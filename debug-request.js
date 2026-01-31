const fs = require('fs');
const { SignJWT } = require('jose');

async function main() {
    const env = fs.readFileSync('.env', 'utf8');
    console.log('Raw .env lines:', env.split(/\r?\n/));
    const lines = env.split(/\r?\n/);
    const jwtLine = lines.find(l => l.trim().startsWith('JWT_SECRET')) || '';
    const secretRaw = jwtLine.split('=')[1] || '';
    const secret = secretRaw.replace(/^\s*\"?|\"?\s*$/g, '');
    console.log('JWT line:', jwtLine);
    console.log('Extracted JWT_SECRET length:', secret ? secret.length : 0);
    const key = new TextEncoder().encode(secret);

  
    const fetchFn = globalThis.fetch || (await import('node-fetch')).default;
    const registerRes = await fetchFn('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Debug User', email: `debug+${Date.now()}@local`, password: 'testpass123' }),
    });

    if (!registerRes.ok) {
        console.error('Register failed', await registerRes.text());
        process.exit(1);
    }

    const regJson = await registerRes.json();
    const userId = regJson.user?.id;
    if (!userId) {
        console.error('No user id returned from register:', regJson);
        process.exit(1);
    }

    const token = await new SignJWT({ id: userId, email: regJson.user.email, name: regJson.user.name })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key);

    const url = 'http://localhost:3000/api/chat';
    console.log('Using session token (truncated):', token.slice(0, 20) + '...');

    const body = JSON.stringify({ message: 'hello from debug script', chatId: null });

    try {
        const res = await fetchFn(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `session=${token}`,
            },
            body,
        });

        const text = await res.text();
        console.log('Response status:', res.status);
        console.log('Response body:', text);
        process.exit(0);
    } catch (err) {
        console.error('Request error:', err);
        process.exit(1);
    }
}

main();
