import { NextRequest, NextResponse } from 'next/server'
import { getFrontendUrl } from './lib/project-config'

export function middleware(request: NextRequest) {
  // Handle CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const response = NextResponse.next()
    
    // Add CORS headers
    const allowedOrigins = [
      getFrontendUrl(),
      'http://localhost:3100', // fallback for development
      process.env.FRONTEND_URL,
      process.env.NEXT_PUBLIC_APP_URL
    ].filter(Boolean)
    
    const origin = request.headers.get('origin')
    const isAllowedOrigin = allowedOrigins.includes(origin || '')
    
    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin!)
    } else if (!origin) {
      // For same-origin requests (no origin header), allow the request
      response.headers.set('Access-Control-Allow-Origin', '*')
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Max-Age', '86400')

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: response.headers })
    }

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}