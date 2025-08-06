import type { UserPreferences } from "@boilerplate/types"

/**
 * Preferences service for handling user preference persistence
 * Supports both database (authenticated users) and localStorage (anonymous users)
 */

// Default preferences
export const DEFAULT_PREFERENCES: UserPreferences = {
  colorTheme: "default",
  language: "en",
  themeMode: "system",
}

/**
 * Fetch user preferences from the API
 */
export async function fetchUserPreferences(): Promise<UserPreferences | null> {
  try {
    console.log('[Preferences] Fetching user preferences from API')
    const response = await fetch("/api/preferences", {
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        console.log('[Preferences] User not authenticated (401)')
        // User is not authenticated, return null to use localStorage
        return null
      }
      console.error(`[Preferences] Failed to fetch preferences: ${response.status}`)
      throw new Error(`Failed to fetch preferences: ${response.status}`)
    }

    const result = await response.json()
    console.log('[Preferences] Fetched preferences:', result.data)
    return result.data || {}
  } catch (error) {
    console.error('[Preferences] Error fetching user preferences:', error)
    return null
  }
}

/**
 * Update user preferences in the database
 */
export async function updateUserPreferences(
  preferences: Partial<UserPreferences>
): Promise<UserPreferences | null> {
  try {
    console.log('[Preferences] Updating user preferences:', preferences)
    const response = await fetch("/api/preferences", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ preferences }),
    })

    if (!response.ok) {
      if (response.status === 401) {
        console.log('[Preferences] User not authenticated (401)')
        // User is not authenticated, return null to use localStorage
        return null
      }
      const errorText = await response.text()
      console.error(`[Preferences] Failed to update preferences: ${response.status}`, errorText)
      throw new Error(`Failed to update preferences: ${response.status}`)
    }

    const result = await response.json()
    console.log('[Preferences] Successfully updated preferences:', result.data)
    return result.data || {}
  } catch (error) {
    console.error('[Preferences] Error updating user preferences:', error)
    if (error instanceof Error) {
      console.error('[Preferences] Error details:', error.message)
    }
    return null
  }
}

/**
 * Get preferences from localStorage (fallback for anonymous users)
 */
export function getLocalStoragePreferences(): UserPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_PREFERENCES
  }

  try {
    const colorTheme = localStorage.getItem("colorTheme") || DEFAULT_PREFERENCES.colorTheme
    const language = localStorage.getItem("language") || DEFAULT_PREFERENCES.language
    const themeMode = localStorage.getItem("themeMode") as UserPreferences['themeMode'] || DEFAULT_PREFERENCES.themeMode

    return {
      colorTheme,
      language,
      themeMode,
    }
  } catch (error) {
    console.error("Error reading from localStorage:", error)
    return DEFAULT_PREFERENCES
  }
}

/**
 * Save preferences to localStorage (fallback for anonymous users)
 */
export function saveLocalStoragePreferences(preferences: Partial<UserPreferences>): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    if (preferences.colorTheme) {
      localStorage.setItem("colorTheme", preferences.colorTheme)
    }
    if (preferences.language) {
      localStorage.setItem("language", preferences.language)
    }
    if (preferences.themeMode) {
      localStorage.setItem("themeMode", preferences.themeMode)
    }
  } catch (error) {
    console.error("Error saving to localStorage:", error)
  }
}

/**
 * Migrate preferences from localStorage to database (for newly authenticated users)
 */
export async function migrateLocalStorageToDatabase(): Promise<void> {
  if (typeof window === "undefined") {
    return
  }

  try {
    const localPreferences = getLocalStoragePreferences()
    console.log('[Preferences] Checking localStorage for migration:', localPreferences)
    
    // Check if there are any preferences to migrate
    const hasPreferences = Object.entries(localPreferences).some(
      ([key, value]) => value !== DEFAULT_PREFERENCES[key as keyof UserPreferences]
    )

    if (hasPreferences) {
      console.log('[Preferences] Migrating localStorage preferences to database')
      const result = await updateUserPreferences(localPreferences)
      
      // If successfully migrated, clear localStorage
      if (result) {
        console.log('[Preferences] Migration successful, clearing localStorage')
        localStorage.removeItem("colorTheme")
        localStorage.removeItem("language")
        localStorage.removeItem("themeMode")
      } else {
        console.warn('[Preferences] Migration failed, keeping localStorage')
      }
    } else {
      console.log('[Preferences] No localStorage preferences to migrate')
    }
  } catch (error) {
    console.error('[Preferences] Error migrating preferences to database:', error)
  }
}