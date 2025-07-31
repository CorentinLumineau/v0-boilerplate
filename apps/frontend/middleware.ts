import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only check if authenticated users are trying to access auth pages
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    // Use optimistic cookie check (fast, no API call)
    const sessionCookie = getSessionCookie(request);
    
    if (sessionCookie) {
      // User appears to be authenticated, redirect to home
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
  
  // For all other routes, let the route handlers/layouts handle authentication
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|auth).*)",
  ],
};