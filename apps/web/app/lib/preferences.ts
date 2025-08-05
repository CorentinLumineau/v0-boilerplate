import type { UserPreferences } from "@boilerplate/types"

/**
 * Preferences service for handling user preference persistence
 * Supports both database (authenticated users) and localStorage (anonymous users)
 */

// Default preferences
export const DEFAULT_PREFERENCES: UserPreferences = {
  colorTheme: "default",
  radiusValue: "0.5",
  language: "en",
  themeMode: "system",
}

/**
 * Fetch user preferences from the API
 */
export async function fetchUserPreferences(): Promise<UserPreferences | null> {
  try {
    const response = await fetch("/api/preferences", {
      credentials: "include",
    })

    if (!response.ok) {
      if (response.status === 401) {
        // User is not authenticated, return null to use localStorage
        return null
      }
      throw new Error(`Failed to fetch preferences: ${response.status}`)
    }

    const result = await response.json()
    return result.data || {}
  } catch (error) {
    console.error("Error fetching user preferences:", error)
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
        // User is not authenticated, return null to use localStorage
        return null
      }
      throw new Error(`Failed to update preferences: ${response.status}`)
    }

    const result = await response.json()
    return result.data || {}
  } catch (error) {
    console.error("Error updating user preferences:", error)
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
    const radiusValue = localStorage.getItem("radiusValue") || DEFAULT_PREFERENCES.radiusValue
    const language = localStorage.getItem("language") || DEFAULT_PREFERENCES.language
    
    // Note: themeMode is handled by next-themes, so we don't store it in localStorage

    return {
      colorTheme,
      radiusValue,
      language,
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
    if (preferences.radiusValue) {
      localStorage.setItem("radiusValue", preferences.radiusValue)
    }
    if (preferences.language) {
      localStorage.setItem("language", preferences.language)
    }
    // Note: themeMode is handled by next-themes
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
    
    // Check if there are any preferences to migrate
    const hasPreferences = Object.values(localPreferences).some(
      (value, index) => value !== Object.values(DEFAULT_PREFERENCES)[index]
    )

    if (hasPreferences) {
      const result = await updateUserPreferences(localPreferences)
      
      // If successfully migrated, clear localStorage
      if (result) {
        localStorage.removeItem("colorTheme")
        localStorage.removeItem("radiusValue")
        localStorage.removeItem("language")
      }
    }
  } catch (error) {
    console.error("Error migrating preferences to database:", error)
  }
}