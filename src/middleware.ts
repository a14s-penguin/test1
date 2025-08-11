import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
    const token = req.cookies.get('token')?.value
    const url = req.nextUrl

    if (!token) {
        return NextResponse.redirect(new URL('/login', req.url))
    }else {
        console.log("okokok");
    }

    if (url.pathname === '/user') {
        return NextResponse.next()
    }

    if (url.pathname === '/admin') {
        return NextResponse.next()
    }

    return NextResponse.redirect(new URL('/admin', req.url))
}

export const config = {
    matcher: ['/user/:path*', '/user'],
}
// src/app/api/users/[id]/permissions/[permission]/route.ts
