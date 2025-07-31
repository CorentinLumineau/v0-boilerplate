import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Get the session from Better Auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Get cookies from request
    const cookies = request.cookies.getAll();
    const sessionCookie = cookies.find(c => c.name === "better-auth.session_token");
    
    // Get environment info
    const isProduction = process.env.NODE_ENV === 'production';
    const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3100";
    const backendUrl = process.env.BETTER_AUTH_BASE_URL || "http://localhost:3101";
    const frontendDomain = new URL(frontendUrl).hostname;
    
    // Extract root domain logic (same as in auth.ts)
    const getRootDomain = (hostname: string) => {
      if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
        return undefined;
      }
      const parts = hostname.split('.');
      if (parts.length >= 2) {
        return `.${parts.slice(-2).join('.')}`;
      }
      return undefined;
    };
    
    const expectedCookieDomain = getRootDomain(frontendDomain);
    
    return NextResponse.json({
      session,
      cookies: cookies.map(c => ({ 
        name: c.name, 
        value: c.value.substring(0, 20) + "...",
        ...(c.name === "better-auth.session_token" ? {
          fullLength: c.value.length,
          domain: c.domain,
          path: c.path,
          secure: c.secure,
          httpOnly: c.httpOnly,
          sameSite: c.sameSite
        } : {})
      })),
      sessionCookie: sessionCookie ? {
        exists: true,
        length: sessionCookie.value.length,
      } : {
        exists: false
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        isProduction,
        frontendUrl,
        backendUrl,
        frontendDomain,
        expectedCookieDomain,
        actualBackendHost: request.headers.get("host"),
      },
      headers: {
        origin: request.headers.get("origin"),
        host: request.headers.get("host"),
        referer: request.headers.get("referer"),
        cookie: request.headers.get("cookie") ? "present" : "missing",
        userAgent: request.headers.get("user-agent"),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}