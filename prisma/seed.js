require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const username = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'JF-PAK'
    const passwordRaw = process.env.ADMIN_PASSWORD || 'PAKARMYZINDABAD_X9Z'
    const password = await bcrypt.hash(passwordRaw, 10)
    try {
        const admin = await prisma.user.upsert({
            where: { email: 'admin@hexamate.ai' },
            update: { username: username, role: 'admin', password },
            create: {
                email: 'admin@hexamate.ai',
                username: username,
                password,
                name: 'Admin',
                role: 'admin',
            },
        })
        console.log('Admin seeded:', admin)
    } catch (e) {
        if (e.code === 'P2002') {
            console.log('Admin already exists or conflict')
        } else {
            console.error('Seed error:', e)
        }
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
