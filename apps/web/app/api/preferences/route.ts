import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/utils/logger"
import { API, DEFAULTS } from "@/lib/config/constants"
import {
  validatePreferencesUpdate,
  mapLegacyToDbFormat,
  mapDbToLegacyFormat,
  type UpdatePreferencesRequest,
} from "@/lib/validations/preferences"

/**
 * GET /api/preferences - Get user preferences
 * Returns user preferences in legacy format for backward compatibility
 */
export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      logger.apiWarn("GET /api/preferences - No session found")
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: API.STATUS_CODES.UNAUTHORIZED }
      )
    }

    const userId = session.user.id
    logger.apiDebug("GET /api/preferences - User ID", { userId })

    // Fetch preferences from dedicated table
    const userPreferences = await prisma.userPreferences.findUnique({
      where: { userId },
      select: {
        colorTheme: true,
        language: true,
        themeMode: true,
      },
    })

    if (!userPreferences) {
      // Create default preferences if none exist
      logger.apiInfo("GET /api/preferences - Creating default preferences", { userId })
      
      const defaultPrefs = await prisma.userPreferences.create({
        data: {
          userId,
          colorTheme: 'DEFAULT',
          language: 'EN',
          themeMode: 'SYSTEM',
        },
        select: {
          colorTheme: true,
          language: true,
          themeMode: true,
        },
      })

      const legacyFormat = mapDbToLegacyFormat({
        colorTheme: defaultPrefs.colorTheme,
        language: defaultPrefs.language,
        themeMode: defaultPrefs.themeMode,
      })

      logger.apiDebug("GET /api/preferences - Returning default preferences", { 
        userId,
        preferences: legacyFormat 
      })
      
      return NextResponse.json({ data: legacyFormat })
    }

    // Convert to legacy format for backward compatibility
    const legacyFormat = mapDbToLegacyFormat({
      colorTheme: userPreferences.colorTheme,
      language: userPreferences.language,
      themeMode: userPreferences.themeMode,
    })

    logger.apiDebug("GET /api/preferences - Returning preferences", { 
      userId,
      preferences: legacyFormat 
    })

    return NextResponse.json({ data: legacyFormat })
  } catch (error) {
    logger.apiError("GET /api/preferences - Error", { error: error instanceof Error ? error.message : String(error) }, error instanceof Error ? error : undefined)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: API.STATUS_CODES.INTERNAL_SERVER_ERROR }
    )
  }
}

/**
 * PATCH /api/preferences - Update user preferences  
 * Accepts legacy format and converts to database format
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      logger.apiWarn("PATCH /api/preferences - No session found")
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: API.STATUS_CODES.UNAUTHORIZED }
      )
    }

    const userId = session.user.id
    logger.apiDebug("PATCH /api/preferences - User ID", { userId })

    // Parse and validate request body
    const body = await request.json()
    const validationResult = validatePreferencesUpdate(body)

    if (!validationResult.success) {
      logger.apiWarn("PATCH /api/preferences - Invalid request data", { 
        userId,
        errors: validationResult.error.errors,
        receivedData: body 
      })
      return NextResponse.json(
        { error: "Invalid preferences data", details: validationResult.error.errors },
        { status: API.STATUS_CODES.BAD_REQUEST }
      )
    }

    const { preferences }: UpdatePreferencesRequest = validationResult.data
    logger.apiDebug("PATCH /api/preferences - Validated preferences", { userId, preferences })

    // Convert legacy format to database format
    const dbPreferences = mapLegacyToDbFormat(preferences)
    logger.apiDebug("PATCH /api/preferences - Mapped to DB format", { userId, dbPreferences })

    // Update preferences using upsert for atomic operation
    const updatedPreferences = await prisma.userPreferences.upsert({
      where: { userId },
      create: {
        userId,
        colorTheme: dbPreferences.colorTheme || 'DEFAULT',
        language: dbPreferences.language || 'EN', 
        themeMode: dbPreferences.themeMode || 'SYSTEM',
      },
      update: {
        ...(dbPreferences.colorTheme && { colorTheme: dbPreferences.colorTheme }),
        ...(dbPreferences.language && { language: dbPreferences.language }),
        ...(dbPreferences.themeMode && { themeMode: dbPreferences.themeMode }),
      },
      select: {
        colorTheme: true,
        language: true,
        themeMode: true,
      },
    })

    // Convert back to legacy format for response
    const legacyFormat = mapDbToLegacyFormat({
      colorTheme: updatedPreferences.colorTheme,
      language: updatedPreferences.language,
      themeMode: updatedPreferences.themeMode,
    })

    logger.apiInfo("PATCH /api/preferences - Successfully updated preferences", {
      userId,
      updatedPreferences: legacyFormat
    })

    return NextResponse.json({ data: legacyFormat })
  } catch (error) {
    logger.apiError("PATCH /api/preferences - Error", { error: error instanceof Error ? error.message : String(error) }, error instanceof Error ? error : undefined)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: API.STATUS_CODES.INTERNAL_SERVER_ERROR }
    )
  }
}