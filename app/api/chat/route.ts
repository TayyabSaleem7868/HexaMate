import { GoogleGenerativeAI, GoogleGenerativeAIResponseError } from '@google/generative-ai'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

type IncomingMessage = {
    role?: string
    content?: string
    text?: string
}

function mapRole(role?: string) {
    if (!role) return 'user'
    const r = role.toLowerCase()
    if (r === 'assistant' || r === 'model') return 'model'
    if (r === 'system') return 'system'
    if (r === 'function') return 'function'
    return 'user'
}

function maskKey(k?: string) {
    if (!k) return '<missing>'
    if (k.length <= 8) return k.replace(/./g, '*')
    return `${k.slice(0, 4)}...${k.slice(-4)}`
}

export async function POST(request: Request) {
    try {
        console.debug('[api/chat] invoked', { url: (request as any).url ?? '<unknown>' })
    } catch (_) { }

    const session = await getSession()
    if (!session) {
        console.warn('[api/chat] unauthorized request')
        return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 })
    }

    const apiKey = process.env.GOOGLE_API_KEY
    console.debug('[api/chat] GOOGLE_API_KEY present:', Boolean(apiKey), 'masked:', maskKey(apiKey))

    if (!apiKey) {
        console.error('[api/chat] Missing GOOGLE_API_KEY')
        return NextResponse.json({ error: { message: 'Server configuration error: missing GOOGLE_API_KEY' } }, { status: 500 })
    }

    let body: any
    try {
        body = await request.json()
    } catch (e: any) {
        console.error('[api/chat] Invalid JSON body:', e?.message ?? e)
        return NextResponse.json({ error: { message: 'Invalid JSON body' } }, { status: 400 })
    }

    try {
        const summary = Array.isArray(body?.messages)
            ? { messagesCount: body.messages.length }
            : body?.message
                ? { message: typeof body.message === 'string' ? `${(body.message as string).slice(0, 80)}${(body.message as string).length > 80 ? '...' : ''}` : '<non-string>' }
                : { keys: Object.keys(body ?? {}) }
        console.debug('[api/chat] request body summary:', summary)
    } catch (e) {
        console.debug('[api/chat] could not summarize body')
    }

    let messages: IncomingMessage[] | undefined = undefined
    const chatId = body?.chatId ?? null

    if (Array.isArray(body?.messages)) {
        messages = body.messages
    } else if (typeof body?.message === 'string') {
        messages = [{ role: 'user', content: body.message }]
    } else if (body && (typeof body?.content === 'string' || typeof body?.text === 'string')) {
        messages = [{ role: body.role ?? 'user', content: body.content ?? body.text }]
    }

    if (!Array.isArray(messages) || messages.length === 0) {
        console.warn('[api/chat] invalid request payload - messages missing or empty', { bodyKeys: Object.keys(body ?? {}) })
        return NextResponse.json({ error: { message: 'Invalid request: missing "messages" array or "message" text' } }, { status: 400 })
    }

    for (const [i, m] of messages.entries()) {
        const text = (m.content ?? m.text ?? '')
        if (typeof text !== 'string' || text.trim() === '') {
            return NextResponse.json({ error: { message: `Invalid request: message at index ${i} is empty or not a string` } }, { status: 400 })
        }
    }

    try {
        let currentChatId = chatId
        let history: any[] = []

        if (currentChatId) {
            const existingChat = await prisma.chat.findUnique({
                where: { id: currentChatId },
                include: { messages: { orderBy: { createdAt: 'asc' } } }
            })

            if (existingChat && existingChat.userId === session.id) {
                history = existingChat.messages.map((m: any) => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content }]
                }))
            } else {
                currentChatId = null
            }
        }


        const isExistingChat = Boolean(currentChatId)
        const pendingUserMessages = messages.filter(m => mapRole(m.role) === 'user')

        if (isExistingChat) {
            for (const m of pendingUserMessages) {
                await prisma.message.create({
                    data: {
                        content: (m.content ?? m.text ?? '').toString(),
                        role: 'user',
                        chatId: currentChatId,
                    }
                })
            }
        }

        const contents = messages.map((m: IncomingMessage) => ({
            role: mapRole(m.role),
            parts: [{ text: (m.content ?? m.text ?? '').toString() }]
        }))


        const modelName = process.env.GOOGLE_MODEL || "gemini-1.5-flash";
        console.debug("[api/chat] using model:", modelName);
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        if (!isExistingChat) {
            const firstUser = pendingUserMessages[0];
            const titleSource = (firstUser?.content ?? firstUser?.text ?? "Conversation").toString();
            const title = titleSource.substring(0, 30) + (titleSource.length > 30 ? "..." : "");
            const newChat = await prisma.chat.create({ data: { title, userId: session.id } });
            currentChatId = newChat.id;

            for (const m of pendingUserMessages) {
                await prisma.message.create({
                    data: {
                        content: (m.content ?? m.text ?? "").toString(),
                        role: "user",
                        chatId: currentChatId,
                    }
                });
            }
        }

        const chatUuid = currentChatId!;

        // Use streaming output
        const result = await model.generateContentStream({ contents, systemInstruction: undefined });

        const stream = new ReadableStream({
            async start(controller) {
                let fullAiText = "";
                try {
                    for await (const chunk of result.stream) {
                        const chunkText = chunk.text();
                        fullAiText += chunkText;
                        controller.enqueue(new TextEncoder().encode(chunkText));
                    }

                    // Save the complete AI message to the database
                    await prisma.message.create({
                        data: {
                            content: fullAiText,
                            role: "assistant",
                            chatId: chatUuid,
                        }
                    });

                    await prisma.chat.update({
                        where: { id: chatUuid },
                        data: { updatedAt: new Date() }
                    });

                    controller.close();
                } catch (e: any) {
                    console.error("[api/chat] Streaming error:", e);
                    controller.error(e);
                }
            }
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "X-Chat-ID": chatUuid,
                "X-Accel-Buffering": "no",
                "Cache-Control": "no-cache, no-transform",
                "Connection": "keep-alive",
            }
        });
    } catch (error: any) {
        console.error("[api/chat] Server error:", error?.message ?? error);
        return NextResponse.json({ error: { message: error?.message ?? "Server error" } }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 })

    try {
        const url = new URL((request as any).url)
        const q = url.searchParams.get('q') || undefined
        const chatId = url.searchParams.get('chatId') || undefined

        if (chatId) {
            const chat = await prisma.chat.findUnique({
                where: { id: chatId },
                include: { messages: { orderBy: { createdAt: 'asc' } } }
            })
            if (!chat || chat.userId !== session.id) return NextResponse.json({ error: { message: 'Not found' } }, { status: 404 })

            return NextResponse.json({ chat })
        }


        const where: any = { userId: session.id }
        if (q) where.title = { contains: q, mode: 'insensitive' }


        const chats = await prisma.chat.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            include: { messages: { orderBy: { createdAt: 'asc' }, take: 1 } }
        })

        const mapped = chats.map(c => ({
            id: c.id,
            title: c.title,
            updatedAt: c.updatedAt,

            lastMessage: c.messages?.[0]?.content ?? null,
        }))

        return NextResponse.json({ chats: mapped })
    } catch (e: any) {
        console.error('[api/chat] GET error', e?.message ?? e)
        return NextResponse.json({ error: { message: 'Server error' } }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 })

    let body: any
    try {
        body = await request.json()
    } catch (e) {
        return NextResponse.json({ error: { message: 'Invalid JSON body' } }, { status: 400 })
    }

    const chatId = body?.chatId
    if (!chatId) return NextResponse.json({ error: { message: 'Missing chatId' } }, { status: 400 })

    try {
        const existing = await prisma.chat.findUnique({ where: { id: chatId } })
        if (!existing || existing.userId !== session.id) return NextResponse.json({ error: { message: 'Not found' } }, { status: 404 })

        await prisma.message.deleteMany({ where: { chatId } })
        await prisma.chat.delete({ where: { id: chatId } })

        return NextResponse.json({ ok: true })
    } catch (e: any) {
        console.error('[api/chat] DELETE error', e?.message ?? e)
        return NextResponse.json({ error: { message: 'Server error' } }, { status: 500 })
    }
}
