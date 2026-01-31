import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    
    const user = await prisma.user.findUnique({ where: { id: session.id } })
    if (user?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        const users = await prisma.user.findMany({
            include: {
                _count: {
                    select: { chats: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        
        const safeUsers = users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            username: u.username,
            role: u.role,
            createdAt: u.createdAt,
            chatCount: u._count.chats
        }))

        return NextResponse.json(safeUsers)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
