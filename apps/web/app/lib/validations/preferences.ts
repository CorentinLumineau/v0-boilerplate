import { z } from 'zod'

/**
 * Validation schemas for user preferences
 * Provides runtime validation and type safety for preference data
 */

// Base enum schemas matching Prisma enums
export const ColorThemeSchema = z.enum([
  'DEFAULT', 'RED', 'ORANGE', 'GREEN', 'BLUE', 'TEAL', 'PURPLE', 'PINK'
])

export const LanguageSchema = z.enum(['EN', 'FR'])

export const ThemeModeSchema = z.enum(['LIGHT', 'DARK', 'SYSTEM'])

// Legacy string-based schemas for backward compatibility
export const LegacyColorThemeSchema = z.enum([
  'default', 'red', 'orange', 'green', 'blue', 'teal', 'purple', 'pink'
])

export const LegacyLanguageSchema = z.enum(['en', 'fr'])

export const LegacyThemeModeSchema = z.enum(['light', 'dark', 'system'])

// User preferences schema (database format)
export const UserPreferencesSchema = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().cuid().optional(),
  colorTheme: ColorThemeSchema,
  language: LanguageSchema,
  themeMode: ThemeModeSchema,
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

// Partial preferences for updates
export const PartialUserPreferencesSchema = UserPreferencesSchema.partial()

// API request schema (legacy string format)
export const UpdatePreferencesRequestSchema = z.object({
  preferences: z.object({
    colorTheme: LegacyColorThemeSchema.optional(),
    language: LegacyLanguageSchema.optional(),
    themeMode: LegacyThemeModeSchema.optional(),
  }).strict(), // Reject unknown properties
})

// API response schema
export const PreferencesResponseSchema = z.object({
  data: z.object({
    colorTheme: LegacyColorThemeSchema,
    language: LegacyLanguageSchema,
    themeMode: LegacyThemeModeSchema,
  }),
})

// Error response schema
export const ErrorResponseSchema = z.object({
  error: z.string(),
})

// Validation helper functions
export function validatePreferencesUpdate(data: unknown) {
  return UpdatePreferencesRequestSchema.safeParse(data)
}

export function mapLegacyToDbFormat(legacy: {
  colorTheme?: string
  language?: string 
  themeMode?: string
}): {
  colorTheme?: z.infer<typeof ColorThemeSchema>
  language?: z.infer<typeof LanguageSchema>
  themeMode?: z.infer<typeof ThemeModeSchema>
} {
  const result: any = {}
  
  if (legacy.colorTheme) {
    result.colorTheme = legacy.colorTheme.toUpperCase()
  }
  if (legacy.language) {
    result.language = legacy.language.toUpperCase()
  }
  if (legacy.themeMode) {
    result.themeMode = legacy.themeMode.toUpperCase()
  }
  
  return result
}

export function mapDbToLegacyFormat(db: {
  colorTheme?: string
  language?: string
  themeMode?: string
}): {
  colorTheme?: string
  language?: string
  themeMode?: string
} {
  const result: any = {}
  
  if (db.colorTheme) {
    result.colorTheme = db.colorTheme.toLowerCase()
  }
  if (db.language) {
    result.language = db.language.toLowerCase()
  }
  if (db.themeMode) {
    result.themeMode = db.themeMode.toLowerCase()
  }
  
  return result
}

// Type exports
export type UserPreferences = z.infer<typeof UserPreferencesSchema>
export type PartialUserPreferences = z.infer<typeof PartialUserPreferencesSchema>
export type UpdatePreferencesRequest = z.infer<typeof UpdatePreferencesRequestSchema>
export type PreferencesResponse = z.infer<typeof PreferencesResponseSchema>
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>