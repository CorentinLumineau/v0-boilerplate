import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import type { UserPreferences } from "@boilerplate/types"

// GET /api/preferences - Get user preferences
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      console.log('[API] GET /api/preferences - No session found')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log('[API] GET /api/preferences - User ID:', session.user.id)

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferences: true },
    })

    if (!user) {
      console.error('[API] GET /api/preferences - User not found:', session.user.id)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Return preferences or empty object if null
    const preferences = (user.preferences as UserPreferences) || {}
    console.log('[API] GET /api/preferences - Returning preferences:', preferences)

    return NextResponse.json({ data: preferences })
  } catch (error) {
    console.error('[API] GET /api/preferences - Error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH /api/preferences - Update user preferences
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      console.log('[API] PATCH /api/preferences - No session found')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log('[API] PATCH /api/preferences - User ID:', session.user.id)

    const body = await request.json()
    const { preferences } = body
    console.log('[API] PATCH /api/preferences - Received preferences:', preferences)

    if (!preferences || typeof preferences !== "object") {
      console.error('[API] PATCH /api/preferences - Invalid preferences data:', preferences)
      return NextResponse.json(
        { error: "Invalid preferences data" },
        { status: 400 }
      )
    }

    // Get current preferences
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferences: true },
    })

    if (!currentUser) {
      console.error('[API] PATCH /api/preferences - User not found:', session.user.id)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Merge with existing preferences
    const currentPreferences = (currentUser.preferences as UserPreferences) || {}
    const updatedPreferences: UserPreferences = {
      ...currentPreferences,
      ...preferences,
    }
    
    console.log('[API] PATCH /api/preferences - Current preferences:', currentPreferences)
    console.log('[API] PATCH /api/preferences - Updated preferences:', updatedPreferences)

    // Update user preferences
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { preferences: updatedPreferences as any },
      select: { preferences: true },
    })

    console.log('[API] PATCH /api/preferences - Successfully updated preferences')
    return NextResponse.json({ data: updatedUser.preferences })
  } catch (error) {
    console.error('[API] PATCH /api/preferences - Error:', error)
    // Log more details about the error
    if (error instanceof Error) {
      console.error('[API] PATCH /api/preferences - Error message:', error.message)
      console.error('[API] PATCH /api/preferences - Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}