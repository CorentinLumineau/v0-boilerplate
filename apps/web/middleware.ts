import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Single domain architecture - no CORS handling needed
  // All requests are same-origin, which simplifies authentication and security
  
  // Handle OPTIONS requests for API routes (minimal handling for potential edge cases)
  if (request.method === 'OPTIONS' && request.nextUrl.pathname.startsWith('/api')) {
    return new Response(null, { status: 200 })
  }

  // Handle root path redirects
  const { pathname } = request.nextUrl

  // If someone tries to access the old dashboard path, redirect to root
  if (pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}