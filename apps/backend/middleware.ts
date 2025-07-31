import { NextRequest, NextResponse } from 'next/server'
import { getFrontendUrl, getDevelopmentFrontendUrl, getProductionFrontendUrl } from '@boilerplate/config/project.config'

export function middleware(request: NextRequest) {
  // Handle CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const response = NextResponse.next()
    
    // Add CORS headers
    const allowedOrigins = [
      getFrontendUrl(), // Current environment URL
      getDevelopmentFrontendUrl(), // Development fallback
      getProductionFrontendUrl(), // Production URL
      process.env.FRONTEND_URL,
      process.env.NEXT_PUBLIC_APP_URL,
      // Add www subdomain for production
      getProductionFrontendUrl().replace('https://', 'https://www.')
    ].filter(Boolean)
    
    const origin = request.headers.get('origin')
    const isAllowedOrigin = origin && allowedOrigins.some(allowed => 
      allowed === origin || origin.startsWith(allowed!)
    )
    
    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin!)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    } else if (!origin) {
      // For same-origin requests (no origin header), allow the request
      response.headers.set('Access-Control-Allow-Origin', '*')
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With, Accept')
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