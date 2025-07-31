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
    
    return NextResponse.json({
      session,
      cookies: cookies.map(c => ({ name: c.name, value: c.value.substring(0, 20) + "..." })),
      timestamp: new Date().toISOString(),
      headers: {
        origin: request.headers.get("origin"),
        cookie: request.headers.get("cookie")?.substring(0, 50) + "...",
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}