/**
 * Comprehensive tests for the preferences validation schemas
 * Tests all Zod schemas for type safety and validation rules
 */

import {
  LegacyColorThemeSchema,
  LegacyLanguageSchema,
  LegacyThemeModeSchema,
  UpdatePreferencesRequestSchema,
  type LegacyColorTheme,
  type LegacyLanguage,
  type LegacyThemeMode
} from '@/lib/validations/preferences'
import { ZodError } from 'zod'

describe('preferences validation schemas', () => {
  describe('LegacyColorThemeSchema', () => {
    it('should validate all supported color themes', () => {
      const validThemes: LegacyColorTheme[] = [
        'default', 'red', 'orange', 'green', 'blue', 'teal', 'purple', 'pink'
      ]

      validThemes.forEach(theme => {
        const result = LegacyColorThemeSchema.safeParse(theme)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data).toBe(theme)
        }
      })
    })

    it('should reject invalid color themes', () => {
      const invalidThemes = [
        'invalid',
        'DEFAULT', // uppercase
        'Red', // mixed case
        '',
        null,
        undefined,
        123,
        {},
        [],
        'yellow', // not in enum
        'black'
      ]

      invalidThemes.forEach(theme => {
        const result = LegacyColorThemeSchema.safeParse(theme)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error).toBeInstanceOf(ZodError)
        }
      })
    })

    it('should provide descriptive error messages', () => {
      const result = LegacyColorThemeSchema.safeParse('invalid')
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid enum value')
      }
    })
  })

  describe('LegacyLanguageSchema', () => {
    it('should validate all supported languages', () => {
      const validLanguages: LegacyLanguage[] = ['en', 'fr']

      validLanguages.forEach(language => {
        const result = LegacyLanguageSchema.safeParse(language)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data).toBe(language)
        }
      })
    })

    it('should reject invalid languages', () => {
      const invalidLanguages = [
        'invalid',
        'EN', // uppercase
        'Fr', // mixed case
        'es', // not supported
        'de',
        '',
        null,
        undefined,
        123,
        {},
        []
      ]

      invalidLanguages.forEach(language => {
        const result = LegacyLanguageSchema.safeParse(language)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error).toBeInstanceOf(ZodError)
        }
      })
    })

    it('should provide descriptive error messages', () => {
      const result = LegacyLanguageSchema.safeParse('es')
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid enum value')
      }
    })
  })

  describe('LegacyThemeModeSchema', () => {
    it('should validate all supported theme modes', () => {
      const validModes: LegacyThemeMode[] = ['system', 'light', 'dark']

      validModes.forEach(mode => {
        const result = LegacyThemeModeSchema.safeParse(mode)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data).toBe(mode)
        }
      })
    })

    it('should reject invalid theme modes', () => {
      const invalidModes = [
        'invalid',
        'SYSTEM', // uppercase
        'Light', // mixed case
        'auto',
        'manual',
        '',
        null,
        undefined,
        123,
        {},
        []
      ]

      invalidModes.forEach(mode => {
        const result = LegacyThemeModeSchema.safeParse(mode)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error).toBeInstanceOf(ZodError)
        }
      })
    })

    it('should provide descriptive error messages', () => {
      const result = LegacyThemeModeSchema.safeParse('auto')
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid enum value')
      }
    })
  })

  describe('UpdatePreferencesRequestSchema', () => {
    it('should validate complete valid preferences request', () => {
      const validRequest = {
        preferences: {
          colorTheme: 'blue' as LegacyColorTheme,
          language: 'fr' as LegacyLanguage,
          themeMode: 'dark' as LegacyThemeMode
        }
      }

      const result = UpdatePreferencesRequestSchema.safeParse(validRequest)
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validRequest)
      }
    })

    it('should validate partial preferences request', () => {
      const partialRequests = [
        { preferences: { colorTheme: 'green' as LegacyColorTheme } },
        { preferences: { language: 'en' as LegacyLanguage } },
        { preferences: { themeMode: 'light' as LegacyThemeMode } },
        { preferences: { colorTheme: 'red' as LegacyColorTheme, language: 'fr' as LegacyLanguage } }
      ]

      partialRequests.forEach(request => {
        const result = UpdatePreferencesRequestSchema.safeParse(request)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data).toEqual(request)
        }
      })
    })

    it('should validate empty preferences object', () => {
      const emptyRequest = { preferences: {} }

      const result = UpdatePreferencesRequestSchema.safeParse(emptyRequest)
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(emptyRequest)
      }
    })

    it('should reject requests missing preferences key', () => {
      const invalidRequests = [
        {},
        { prefs: { colorTheme: 'blue' } },
        { preference: { colorTheme: 'blue' } },
        null,
        undefined,
        'string'
      ]

      invalidRequests.forEach(request => {
        const result = UpdatePreferencesRequestSchema.safeParse(request)
        expect(result.success).toBe(false)
      })
    })

    it('should reject requests with invalid preference values', () => {
      const invalidRequests = [
        { preferences: { colorTheme: 'invalid' } },
        { preferences: { language: 'es' } },
        { preferences: { themeMode: 'auto' } },
        { preferences: { colorTheme: 'BLUE' } }, // uppercase
        { preferences: { colorTheme: null } },
        { preferences: { colorTheme: 123 } }
      ]

      invalidRequests.forEach(request => {
        const result = UpdatePreferencesRequestSchema.safeParse(request)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error).toBeInstanceOf(ZodError)
        }
      })
    })

    it('should reject requests with extra properties due to strict mode', () => {
      const requestWithExtra = {
        preferences: {
          colorTheme: 'blue' as LegacyColorTheme,
          extraProperty: 'not allowed'
        }
      }

      const result = UpdatePreferencesRequestSchema.safeParse(requestWithExtra)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].code).toBe('unrecognized_keys')
      }
    })

    it('should provide detailed error information for multiple validation failures', () => {
      const invalidRequest = {
        preferences: {
          colorTheme: 'invalid_color',
          language: 'invalid_lang',
          themeMode: 'invalid_mode',
          extraProperty: 'not allowed'
        }
      }

      const result = UpdatePreferencesRequestSchema.safeParse(invalidRequest)
      expect(result.success).toBe(false)
      
      if (!result.success) {
        // Should have multiple errors (3 invalid enums + 1 unrecognized key)
        expect(result.error.errors.length).toBeGreaterThanOrEqual(3)
        
        // Check that errors contain expected validation failures
        const errorMessages = result.error.errors.map(e => e.message)
        expect(errorMessages.some(msg => msg.includes('Invalid enum value'))).toBe(true)
      }
    })

    it('should handle nested validation errors correctly', () => {
      const invalidRequest = {
        preferences: {
          colorTheme: 'red' as LegacyColorTheme, // valid
          language: 'invalid_language' // invalid
        }
      }

      const result = UpdatePreferencesRequestSchema.safeParse(invalidRequest)
      expect(result.success).toBe(false)
      
      if (!result.success) {
        const languageError = result.error.errors.find(e => 
          e.path.includes('language')
        )
        expect(languageError).toBeDefined()
        expect(languageError!.message).toContain('Invalid enum value')
      }
    })

    it('should maintain type safety in successful validation', () => {
      const validRequest = {
        preferences: {
          colorTheme: 'purple' as const,
          language: 'en' as const,
          themeMode: 'system' as const
        }
      }

      const result = UpdatePreferencesRequestSchema.safeParse(validRequest)
      
      expect(result.success).toBe(true)
      if (result.success) {
        // TypeScript should infer these types correctly
        const colorTheme: LegacyColorTheme = result.data.preferences.colorTheme!
        const language: LegacyLanguage = result.data.preferences.language!
        const themeMode: LegacyThemeMode = result.data.preferences.themeMode!

        expect(colorTheme).toBe('purple')
        expect(language).toBe('en')
        expect(themeMode).toBe('system')
      }
    })
  })

  describe('Schema Integration', () => {
    it('should work with real API request data', () => {
      // Simulate data that would come from a real API request
      const apiRequestBody = JSON.parse(JSON.stringify({
        preferences: {
          colorTheme: 'blue',
          language: 'fr',
          themeMode: 'dark'
        }
      }))

      const result = UpdatePreferencesRequestSchema.safeParse(apiRequestBody)
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.preferences.colorTheme).toBe('blue')
        expect(result.data.preferences.language).toBe('fr')
        expect(result.data.preferences.themeMode).toBe('dark')
      }
    })

    it('should handle malformed JSON-like data gracefully', () => {
      const malformedData = [
        { preferences: 'not an object' },
        { preferences: null },
        { preferences: [] },
        { preferences: 123 }
      ]

      malformedData.forEach(data => {
        const result = UpdatePreferencesRequestSchema.safeParse(data)
        expect(result.success).toBe(false)
      })
    })

    it('should provide error details suitable for API responses', () => {
      const invalidRequest = {
        preferences: {
          colorTheme: 'invalid_color',
          language: 'es'
        }
      }

      const result = UpdatePreferencesRequestSchema.safeParse(invalidRequest)
      expect(result.success).toBe(false)
      
      if (!result.success) {
        // Error format should be suitable for API error responses
        const formattedErrors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          received: err.path.length > 0 ? 'received' in err ? err.received : undefined : undefined
        }))

        expect(formattedErrors.length).toBeGreaterThan(0)
        expect(formattedErrors[0]).toHaveProperty('field')
        expect(formattedErrors[0]).toHaveProperty('message')
      }
    })
  })
})