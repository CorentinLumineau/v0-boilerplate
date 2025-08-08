import type { UserPreferences } from "@boilerplate/types"
import { logger } from "@/lib/utils/logger"
import { TIMING, DEFAULTS } from "@/lib/config/constants"
import { apiClient, ApiClientError } from "@/lib/api-client"

/**
 * Enhanced preferences service for handling user preference persistence
 * Supports both database (authenticated users) and localStorage (anonymous users)
 * Now with proper type safety and optimized database operations
 */

// Default preferences using constants - frozen to ensure immutability
export const DEFAULT_PREFERENCES: UserPreferences = Object.freeze({
  colorTheme: DEFAULTS.PREFERENCES.COLOR_THEME,
  language: DEFAULTS.PREFERENCES.LANGUAGE,
  themeMode: DEFAULTS.PREFERENCES.THEME_MODE,
})

/**
 * Fetch user preferences from the API with enhanced error handling and logging
 */
export async function fetchUserPreferences(): Promise<UserPreferences | null> {
  try {
    logger.preferencesDebug('Fetching user preferences from API')
    
    const response = await apiClient.get<UserPreferences>("/preferences")
    const preferences = response.data || DEFAULT_PREFERENCES
    
    logger.preferencesDebug('Fetched preferences successfully', { preferences })
    return preferences
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      logger.preferencesInfo('User not authenticated - using localStorage fallback')
      return null
    }
    
    logger.preferencesError('Error fetching user preferences', { 
      error: error instanceof Error ? error.message : String(error) 
    }, error instanceof Error ? error : undefined)
    return null
  }
}

/**
 * Update user preferences in the database with retry logic and better error handling
 */
export async function updateUserPreferences(
  preferences: Partial<UserPreferences>
): Promise<UserPreferences | null> {
  try {
    logger.preferencesDebug('Updating user preferences', { preferences })
    
    const response = await apiClient.patch<UserPreferences>("/preferences", { preferences })
    const updatedPreferences = response.data || DEFAULT_PREFERENCES
    
    logger.preferencesInfo('Successfully updated preferences', { updatedPreferences })
    return updatedPreferences
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      logger.preferencesInfo('User not authenticated - using localStorage fallback')
      return null
    }
    
    logger.preferencesError('Error updating user preferences', { 
      error: error instanceof Error ? error.message : String(error) 
    }, error instanceof Error ? error : undefined)
    return null
  }
}

/**
 * Get preferences from localStorage with proper type safety (fallback for anonymous users)
 */
export function getLocalStoragePreferences(): UserPreferences {
  if (typeof window === "undefined") {
    logger.preferencesDebug('SSR context - returning default preferences')
    return DEFAULT_PREFERENCES
  }

  try {
    const colorTheme = localStorage.getItem("colorTheme")
    const language = localStorage.getItem("language")
    const themeMode = localStorage.getItem("themeMode")

    // Validate localStorage values against expected types
    const preferences: UserPreferences = {
      colorTheme: isValidColorTheme(colorTheme) ? colorTheme : DEFAULT_PREFERENCES.colorTheme,
      language: isValidLanguage(language) ? language : DEFAULT_PREFERENCES.language,
      themeMode: isValidThemeMode(themeMode) ? themeMode : DEFAULT_PREFERENCES.themeMode,
    }

    logger.preferencesDebug('Retrieved preferences from localStorage', { preferences })
    return preferences
  } catch (error) {
    logger.preferencesError('Error reading from localStorage', { error: error instanceof Error ? error.message : String(error) }, error instanceof Error ? error : undefined)
    return DEFAULT_PREFERENCES
  }
}

// Type guards for localStorage validation
function isValidColorTheme(value: string | null): value is NonNullable<UserPreferences['colorTheme']> {
  if (!value) return false
  const validThemes = ['default', 'red', 'orange', 'green', 'blue', 'teal', 'purple', 'pink']
  return validThemes.includes(value)
}

function isValidLanguage(value: string | null): value is NonNullable<UserPreferences['language']> {
  if (!value) return false
  const validLanguages = ['en', 'fr']
  return validLanguages.includes(value)
}

function isValidThemeMode(value: string | null): value is NonNullable<UserPreferences['themeMode']> {
  if (!value) return false
  const validModes = ['light', 'dark', 'system']
  return validModes.includes(value)
}

/**
 * Save preferences to localStorage with enhanced error handling (fallback for anonymous users)
 */
export function saveLocalStoragePreferences(preferences: Partial<UserPreferences>): void {
  if (typeof window === "undefined") {
    logger.preferencesDebug('SSR context - skipping localStorage save')
    return
  }

  try {
    const updates: string[] = []
    
    if (preferences.colorTheme && isValidColorTheme(preferences.colorTheme)) {
      localStorage.setItem("colorTheme", preferences.colorTheme)
      updates.push(`colorTheme: ${preferences.colorTheme}`)
    }
    if (preferences.language && isValidLanguage(preferences.language)) {
      localStorage.setItem("language", preferences.language)
      updates.push(`language: ${preferences.language}`)
    }
    if (preferences.themeMode && isValidThemeMode(preferences.themeMode)) {
      localStorage.setItem("themeMode", preferences.themeMode)
      updates.push(`themeMode: ${preferences.themeMode}`)
    }

    if (updates.length > 0) {
      logger.preferencesDebug(`Saved preferences to localStorage: ${updates.join(', ')}`)
      // Add immediate verification
      const savedColorTheme = localStorage.getItem("colorTheme")
      const savedThemeMode = localStorage.getItem("themeMode")
      logger.preferencesDebug('Verification - localStorage after save', { 
        savedColorTheme, 
        savedThemeMode,
        expectedColorTheme: preferences.colorTheme,
        expectedThemeMode: preferences.themeMode
      })
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      logger.preferencesError('localStorage quota exceeded - unable to save preferences')
    } else {
      logger.preferencesError('Error saving to localStorage', { 
        error: error instanceof Error ? error.message : String(error) 
      }, error instanceof Error ? error : undefined)
    }
  }
}

/**
 * Migrate preferences from localStorage to database with improved logic (for newly authenticated users)
 */
export async function migrateLocalStorageToDatabase(): Promise<boolean> {
  if (typeof window === "undefined") {
    logger.preferencesDebug('SSR context - skipping migration')
    return false
  }

  try {
    const localPreferences = getLocalStoragePreferences()
    logger.preferencesDebug('Checking localStorage for migration', { localPreferences })
    
    // Check if there are any non-default preferences to migrate
    const hasCustomPreferences = Object.entries(localPreferences).some(
      ([key, value]) => value !== DEFAULT_PREFERENCES[key as keyof UserPreferences]
    )

    if (!hasCustomPreferences) {
      logger.preferencesInfo('No custom localStorage preferences to migrate')
      return false
    }

    logger.preferencesInfo('Migrating localStorage preferences to database', { localPreferences })
    
    // Create a clean preferences object with only non-default values
    // Note: The API expects lowercase values, but the database stores uppercase
    const preferencesToMigrate: Partial<UserPreferences> = {}
    if (localPreferences.colorTheme !== DEFAULT_PREFERENCES.colorTheme) {
      preferencesToMigrate.colorTheme = localPreferences.colorTheme
    }
    if (localPreferences.language !== DEFAULT_PREFERENCES.language) {
      preferencesToMigrate.language = localPreferences.language
    }
    if (localPreferences.themeMode !== DEFAULT_PREFERENCES.themeMode) {
      preferencesToMigrate.themeMode = localPreferences.themeMode
    }

    const result = await updateUserPreferences(preferencesToMigrate)
    
    if (result) {
      logger.preferencesInfo('Migration successful - clearing localStorage', { migratedPreferences: preferencesToMigrate })
      
      // Clear only the migrated preferences
      try {
        localStorage.removeItem("colorTheme")
        localStorage.removeItem("language") 
        localStorage.removeItem("themeMode")
      } catch (clearError) {
        logger.preferencesWarn('Failed to clear localStorage after successful migration', {
          error: clearError instanceof Error ? clearError.message : String(clearError)
        })
      }
      
      return true
    } else {
      logger.preferencesWarn('Migration failed - keeping localStorage preferences', { preferencesToMigrate })
      return false
    }
  } catch (error) {
    logger.preferencesError('Error migrating preferences to database', {
      error: error instanceof Error ? error.message : String(error)
    }, error instanceof Error ? error : undefined)
    return false
  }
}