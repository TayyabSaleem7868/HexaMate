import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 })

  try {
    const title = 'New chat'
    const c = await prisma.chat.create({ data: { title, userId: session.id } })
    return NextResponse.json({ id: c.id, title: c.title })
  } catch (e: unknown) {
    const maybe = e && typeof e === 'object' ? (e as { message?: unknown }) : null
    const msg = maybe?.message ? String(maybe.message) : String(e)
    console.error('[api/chat/new] error', msg)
    return NextResponse.json({ error: { message: 'Server error' } }, { status: 500 })
  }
}
