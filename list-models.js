const fs = require('fs');

(async function () {
    const env = fs.readFileSync('.env', 'utf8');
    const lines = env.split(/\r?\n/);
    const keyLine = lines.find(l => l.trim().startsWith('GEMINI_API_KEY')) || '';
    const keyRaw = keyLine.split('=')[1] || '';
    const apiKey = keyRaw.replace(/^\s*\"?|\"?\s*$/g, '');
    if (!apiKey) {
        console.error('No GEMINI_API_KEY found in .env');
        process.exit(1);
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    console.log('Calling', url.replace(/key=.*$/, 'key=REDACTED'));
    const fetchFn = globalThis.fetch || (await import('node-fetch')).default;
    try {
        const res = await fetchFn(url);
        const json = await res.json();
        console.log('Status:', res.status);
        if (json && json.models) {
            console.log('Models available (names):');
            json.models.forEach(m => console.log(' -', m.name));
        } else {
            console.log('Response JSON:', JSON.stringify(json, null, 2));
        }
    } catch (err) {
        console.error('Request failed:', err);
    }
})();