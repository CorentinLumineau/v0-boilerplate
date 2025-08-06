import type { UserPreferences } from "@boilerplate/types"
import { logger } from "@/lib/utils/logger"
import { TIMING, DEFAULTS } from "@/lib/config/constants"

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
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMING.API_TIMEOUT)

    const response = await fetch("/api/preferences", {
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 401) {
        logger.preferencesInfo('User not authenticated - using localStorage fallback')
        return null
      }
      
      const errorText = await response.text().catch(() => 'Unknown error')
      logger.preferencesError(`Failed to fetch preferences: ${response.status}`, {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText
      })
      throw new Error(`Failed to fetch preferences: ${response.status}`)
    }

    const result = await response.json()
    const preferences: UserPreferences = result.data || DEFAULT_PREFERENCES
    
    logger.preferencesDebug('Fetched preferences successfully', { preferences })
    return preferences
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        logger.preferencesError('Request timeout while fetching preferences')
      } else {
        logger.preferencesError('Error fetching user preferences', { error: error.message }, error)
      }
    }
    return null
  }
}

/**
 * Update user preferences in the database with retry logic and better error handling
 */
export async function updateUserPreferences(
  preferences: Partial<UserPreferences>
): Promise<UserPreferences | null> {
  let retryCount = 0
  const maxRetries = TIMING.MAX_RETRIES

  while (retryCount <= maxRetries) {
    try {
      logger.preferencesDebug('Updating user preferences', { preferences, attempt: retryCount + 1 })
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), TIMING.API_TIMEOUT)

      const response = await fetch("/api/preferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ preferences }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 401) {
          logger.preferencesInfo('User not authenticated - using localStorage fallback')
          return null
        }
        
        const errorText = await response.text().catch(() => 'Unknown error')
        logger.preferencesError(`Failed to update preferences: ${response.status}`, {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText,
          attempt: retryCount + 1
        })
        throw new Error(`Failed to update preferences: ${response.status}`)
      }

      const result = await response.json()
      const updatedPreferences: UserPreferences = result.data || DEFAULT_PREFERENCES
      
      logger.preferencesInfo('Successfully updated preferences', { 
        updatedPreferences,
        attempt: retryCount + 1 
      })
      return updatedPreferences
    } catch (error) {
      retryCount++
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          logger.preferencesError('Request timeout while updating preferences', { attempt: retryCount })
        } else {
          logger.preferencesError('Error updating user preferences', { 
            error: error.message, 
            attempt: retryCount 
          }, error)
        }
      }

      // Don't retry on certain errors
      if (error instanceof Error && (
        error.message.includes('401') ||
        error.message.includes('400') ||
        error.name === 'AbortError'
      )) {
        return null
      }

      // If we haven't exhausted retries, wait before trying again
      if (retryCount <= maxRetries) {
        const delay = TIMING.RETRY_DELAY_BASE * Math.pow(2, retryCount - 1)
        logger.preferencesDebug(`Retrying in ${delay}ms`, { attempt: retryCount, maxRetries })
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  logger.preferencesError('Failed to update preferences after all retry attempts', { maxRetries })
  return null
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