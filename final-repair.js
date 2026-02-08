const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function repair() {
    const username = 'adminno1';
    const password = 'asherismynderdbrother999';
    const email = 'admin@hexamate.ai';

    console.log("Starting Admin Repair...");

    // Try to find user by email first
    let user = await prisma.user.findUnique({
        where: { email: email }
    });

    if (!user) {
        // Try to find by username
        user = await prisma.user.findUnique({
            where: { username: username }
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (user) {
        console.log(`Found existing user: ${user.email} (${user.id})`);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                username: username,
                password: hashedPassword,
                role: 'admin',
                email: email // normalize email
            }
        });
        console.log("Admin user updated successfully.");
    } else {
        console.log("Admin user not found. Creating...");
        const newUser = await prisma.user.create({
            data: {
                email: email,
                username: username,
                password: hashedPassword,
                name: 'HexaMate Admin',
                role: 'admin'
            }
        });
        console.log(`Admin user created with ID: ${newUser.id}`);
    }

    // Verify
    const verified = await prisma.user.findFirst({
        where: {
            OR: [{ email: username }, { username: username }]
        }
    });

    if (verified) {
        const passMatch = await bcrypt.compare(password, verified.password);
        console.log(`Verification: User found. Password match: ${passMatch}. Role: ${verified.role}`);
    } else {
        console.log("Verification FAILED: User still not found by credentials logic.");
    }
}

repair()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
