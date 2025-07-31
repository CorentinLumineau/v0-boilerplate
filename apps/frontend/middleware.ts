import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { betterFetch } from "@better-fetch/fetch";

// Public routes that don't require authentication
const publicRoutes = ["/login", "/signup", "/debug"];

// Get backend URL from environment or fallback
const getBackendUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || process.env.BETTER_AUTH_BASE_URL || "http://localhost:3101";
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // For public routes, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // For protected routes, validate session using secure method
  try {
    const { data: session } = await betterFetch("/api/auth/get-session", {
      baseURL: getBackendUrl(),
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });

    // If no valid session, redirect to login
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Valid session, allow access
    return NextResponse.next();
  } catch (error) {
    // On error (network, etc.), redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }
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