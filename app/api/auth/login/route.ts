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
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        console.log("User found:", user.email, user.username)
        

        const isValid = await bcrypt.compare(password, user.password)
        console.log("Password comparison result:", isValid)

        if (!isValid) {
            console.log("Login failed: Password mismatch")
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
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
