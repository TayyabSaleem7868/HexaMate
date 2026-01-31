import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const session = request.cookies.get('session')?.value

    
    if (!session) {
        const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register') || request.nextUrl.pathname.startsWith('/secret-admin-access-x9z')
        const isApi = request.nextUrl.pathname.startsWith('/api')
        const isPublic = request.nextUrl.pathname.startsWith('/_next') || request.nextUrl.pathname.startsWith('/favicon.ico') || request.nextUrl.pathname.startsWith('/images') || request.nextUrl.pathname === '/'

        if (!isAuthPage && !isApi && !isPublic) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    if (session) {
        if (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
