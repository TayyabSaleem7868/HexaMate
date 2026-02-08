const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function repairAdmin() {
    const username = 'adminno1';
    const password = 'asherismynderdbrother999';

    console.log("--- Admin Repair Tool ---");
    console.log(`Target Username: ${username}`);

    try {
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: username },
                    { email: 'admin@hexamate.ai' }
                ]
            }
        });

        const hashedPassword = await bcrypt.hash(password, 10);

        if (user) {
            console.log(`User found (ID: ${user.id}). Updating details...`);
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    username: username,
                    password: hashedPassword,
                    role: 'admin'
                }
            });
            console.log("User updated successfully.");
        } else {
            console.log("User NOT found. Creating new admin user...");
            const newUser = await prisma.user.create({
                data: {
                    email: 'admin@hexamate.ai',
                    username: username,
                    password: hashedPassword,
                    name: 'Super Admin',
                    role: 'admin'
                }
            });
            console.log(`New Admin created (ID: ${newUser.id})`);
        }

        // Double check search
        const verifiedUser = await prisma.user.findUnique({
            where: { email: 'admin@hexamate.ai' }
        });
        console.log("Verification check (by email):", verifiedUser ? "SUCCESS" : "FAILED");

        const verifiedByUsername = await prisma.user.findUnique({
            where: { username: username }
        });
        console.log("Verification check (by username):", verifiedByUsername ? "SUCCESS" : "FAILED");

    } catch (error) {
        console.error("CRITICAL ERROR:", error);
    } finally {
        await prisma.$disconnect();
    }
}

repairAdmin();
