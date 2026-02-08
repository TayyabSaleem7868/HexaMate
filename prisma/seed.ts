import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const adminUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'JF-PAK'
    const adminPassword = process.env.ADMIN_PASSWORD || 'PAKARMYZINDABAD_X9Z'

    const password = await bcrypt.hash(adminPassword, 10)
    const admin = await prisma.user.upsert({
        where: { username: adminUsername },
        update: {},
        create: {
            email: 'admin@hexamate.ai',
            username: adminUsername,
            password,
            name: 'Admin',
            role: 'admin',
        },
    })
    console.log({ admin })
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
