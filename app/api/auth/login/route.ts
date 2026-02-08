import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { encrypt } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const adminUsername = 'adminno1'
        const adminPassword = 'asherismynderdbrother999'

        // EXHIBITION FAILSAFE: Direct match for admin fallback
        if (email === adminUsername && password === adminPassword) {
            console.log("EXHIBITION FAILSAFE triggered for adminno1")
            let rootAdmin = await prisma.user.findFirst({
                where: { OR: [{ email: 'admin@hexamate.ai' }, { username: adminUsername }] }
            })

            if (!rootAdmin) {
                console.log("Root admin not found in failsafe. Creating...")
                const hp = await bcrypt.hash(adminPassword, 10)
                rootAdmin = await prisma.user.create({
                    data: {
                        email: 'admin@hexamate.ai',
                        username: adminUsername,
                        password: hp,
                        name: 'System Admin',
                        role: 'admin'
                    }
                })
            }

            const session = await encrypt({ id: rootAdmin.id, email: rootAdmin.email, name: rootAdmin.name })
            const cookieStore = await cookies()
            cookieStore.set('session', session, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24,
                path: '/'
            })

            return NextResponse.json({
                user: { id: rootAdmin.id, email: rootAdmin.email, name: rootAdmin.name }
            })
        }

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { username: email }
                ]
            },
        })

        if (!user) {
            console.log("Login failed: User not found for", email)
            return NextResponse.json({ error: `User '${email}' not found. Check spelling.` }, { status: 401 })
        }

        console.log("User found:", user.email, user.username)


        const isValid = await bcrypt.compare(password, user.password)
        console.log("Password comparison result:", isValid)

        if (!isValid) {
            console.log("Login failed: Password mismatch")
            return NextResponse.json({ error: 'Incorrect password. Please try again.' }, { status: 401 })
        }

        const session = await encrypt({ id: user.id, email: user.email, name: user.name })
        const cookieStore = await cookies()
        cookieStore.set('session', session, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24,
            path: '/'
        })

        return NextResponse.json({
            user: { id: user.id, email: user.email, name: user.name }
        })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
