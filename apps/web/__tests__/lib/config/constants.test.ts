/**
 * Tests for configuration constants
 * Verifies all constants are properly defined and have expected values
 */

import {
  TIMING,
  LOGGING,
  API,
  VALIDATION,
  UI,
  DATABASE,
  FEATURES,
  DEFAULTS,
  PERFORMANCE
} from '@/lib/config/constants'

describe('Configuration Constants', () => {
  describe('TIMING', () => {
    it('should have proper timing constants', () => {
      expect(TIMING.PREFERENCES_UPDATE_DEBOUNCE).toBe(500)
      expect(TIMING.SEARCH_DEBOUNCE).toBe(300)
      expect(TIMING.AUTO_SAVE_DEBOUNCE).toBe(1000)
      expect(TIMING.API_TIMEOUT).toBe(30000)
      expect(TIMING.DATABASE_TIMEOUT).toBe(10000)
      expect(TIMING.RETRY_DELAY_BASE).toBe(1000)
      expect(TIMING.MAX_RETRIES).toBe(3)
    })

    it('should have positive numeric values', () => {
      Object.values(TIMING).forEach(value => {
        expect(typeof value).toBe('number')
        expect(value).toBeGreaterThan(0)
      })
    })
  })

  describe('LOGGING', () => {
    it('should have proper log levels', () => {
      expect(LOGGING.LEVELS.ERROR).toBe(0)
      expect(LOGGING.LEVELS.WARN).toBe(1)
      expect(LOGGING.LEVELS.INFO).toBe(2)
      expect(LOGGING.LEVELS.DEBUG).toBe(3)
    })

    it('should have proper prefixes', () => {
      expect(LOGGING.PREFIXES).toEqual({
        API: '[API]',
        AUTH: '[AUTH]',
        SETTINGS: '[Settings]',
        PREFERENCES: '[Preferences]',
        NOTIFICATION: '[Notification]',
        DATABASE: '[Database]'
      })
    })

    it('should maintain log level hierarchy', () => {
      expect(LOGGING.LEVELS.ERROR).toBeLessThan(LOGGING.LEVELS.WARN)
      expect(LOGGING.LEVELS.WARN).toBeLessThan(LOGGING.LEVELS.INFO)
      expect(LOGGING.LEVELS.INFO).toBeLessThan(LOGGING.LEVELS.DEBUG)
    })
  })

  describe('API', () => {
    it('should have proper status codes', () => {
      expect(API.STATUS_CODES.OK).toBe(200)
      expect(API.STATUS_CODES.CREATED).toBe(201)
      expect(API.STATUS_CODES.NO_CONTENT).toBe(204)
      expect(API.STATUS_CODES.BAD_REQUEST).toBe(400)
      expect(API.STATUS_CODES.UNAUTHORIZED).toBe(401)
      expect(API.STATUS_CODES.FORBIDDEN).toBe(403)
      expect(API.STATUS_CODES.NOT_FOUND).toBe(404)
      expect(API.STATUS_CODES.CONFLICT).toBe(409)
      expect(API.STATUS_CODES.INTERNAL_SERVER_ERROR).toBe(500)
      expect(API.STATUS_CODES.SERVICE_UNAVAILABLE).toBe(503)
    })

    it('should have valid HTTP status codes', () => {
      Object.values(API.STATUS_CODES).forEach(statusCode => {
        expect(typeof statusCode).toBe('number')
        expect(statusCode).toBeGreaterThanOrEqual(200)
        expect(statusCode).toBeLessThan(600)
      })
    })

    it('should have proper endpoints', () => {
      expect(API.ENDPOINTS.PREFERENCES).toBe('/api/preferences')
      expect(API.ENDPOINTS.HEALTH).toBe('/api/health')
      expect(API.ENDPOINTS.AUTH).toBe('/api/auth')
      expect(API.ENDPOINTS.NOTIFICATIONS).toBe('/api/notifications')

      // All endpoints should start with /api/
      Object.values(API.ENDPOINTS).forEach(endpoint => {
        expect(endpoint).toMatch(/^\/api\//)
      })
    })

    it('should have valid request limits', () => {
      expect(API.LIMITS.MAX_REQUEST_SIZE).toBe(1024 * 1024)
      expect(API.LIMITS.RATE_LIMIT_REQUESTS).toBe(100)
      expect(API.LIMITS.RATE_LIMIT_WINDOW).toBe(60 * 1000)
      expect(typeof API.LIMITS.MAX_REQUEST_SIZE).toBe('number')
      expect(typeof API.LIMITS.RATE_LIMIT_REQUESTS).toBe('number')
      expect(typeof API.LIMITS.RATE_LIMIT_WINDOW).toBe('number')
    })
  })

  describe('VALIDATION', () => {
    it('should have proper password validation', () => {
      expect(VALIDATION.PASSWORD.MIN_LENGTH).toBe(8)
      expect(VALIDATION.PASSWORD.MAX_LENGTH).toBe(128)
      expect(VALIDATION.PASSWORD.REQUIRE_UPPERCASE).toBe(true)
      expect(VALIDATION.PASSWORD.REQUIRE_LOWERCASE).toBe(true)
      expect(VALIDATION.PASSWORD.REQUIRE_NUMBERS).toBe(true)
      expect(VALIDATION.PASSWORD.REQUIRE_SPECIAL_CHARS).toBe(false)
    })

    it('should have proper sanitization settings', () => {
      expect(VALIDATION.SANITIZATION.STRIP_HTML).toBe(true)
      expect(VALIDATION.SANITIZATION.TRIM_WHITESPACE).toBe(true)
      expect(VALIDATION.SANITIZATION.MAX_INPUT_LENGTH).toBe(10000)
    })

    it('should have logical password length constraints', () => {
      expect(VALIDATION.PASSWORD.MIN_LENGTH).toBeLessThan(VALIDATION.PASSWORD.MAX_LENGTH)
      expect(VALIDATION.PASSWORD.MIN_LENGTH).toBeGreaterThan(0)
    })
  })

  describe('UI', () => {
    it('should have proper UI constants', () => {
      expect(UI.DEFAULT_RADIUS).toBe('0.5rem')
      expect(UI.ANIMATION_DURATION_FAST).toBe('150ms')
      expect(UI.ANIMATION_DURATION_NORMAL).toBe('300ms')
      expect(UI.ANIMATION_DURATION_SLOW).toBe('500ms')
    })

    it('should have proper z-index layers', () => {
      expect(UI.Z_INDEX.DROPDOWN).toBe(50)
      expect(UI.Z_INDEX.MODAL).toBe(60)
      expect(UI.Z_INDEX.TOOLTIP).toBe(70)
      expect(UI.Z_INDEX.TOAST).toBe(80)
      expect(UI.Z_INDEX.OVERLAY).toBe(90)
    })

    it('should have proper breakpoints', () => {
      expect(UI.BREAKPOINTS.SM).toBe(640)
      expect(UI.BREAKPOINTS.MD).toBe(768)
      expect(UI.BREAKPOINTS.LG).toBe(1024)
      expect(UI.BREAKPOINTS.XL).toBe(1280)
      expect(UI.BREAKPOINTS['2XL']).toBe(1536)
      
      // Verify ascending order
      expect(UI.BREAKPOINTS.SM).toBeLessThan(UI.BREAKPOINTS.MD)
      expect(UI.BREAKPOINTS.MD).toBeLessThan(UI.BREAKPOINTS.LG)
      expect(UI.BREAKPOINTS.LG).toBeLessThan(UI.BREAKPOINTS.XL)
      expect(UI.BREAKPOINTS.XL).toBeLessThan(UI.BREAKPOINTS['2XL'])
    })

    it('should have logical z-index hierarchy', () => {
      expect(UI.Z_INDEX.DROPDOWN).toBeLessThan(UI.Z_INDEX.MODAL)
      expect(UI.Z_INDEX.MODAL).toBeLessThan(UI.Z_INDEX.TOOLTIP)
      expect(UI.Z_INDEX.TOOLTIP).toBeLessThan(UI.Z_INDEX.TOAST)
      expect(UI.Z_INDEX.TOAST).toBeLessThan(UI.Z_INDEX.OVERLAY)
    })
  })

  describe('DATABASE', () => {
    it('should have proper field limits', () => {
      expect(DATABASE.LIMITS.USER_NAME_MAX_LENGTH).toBe(255)
      expect(DATABASE.LIMITS.EMAIL_MAX_LENGTH).toBe(320)
      expect(DATABASE.LIMITS.NOTIFICATION_TITLE_MAX_LENGTH).toBe(255)
      expect(DATABASE.LIMITS.NOTIFICATION_MESSAGE_MAX_LENGTH).toBe(1000)
    })

    it('should have proper pagination settings', () => {
      expect(DATABASE.PAGINATION.DEFAULT_PAGE_SIZE).toBe(20)
      expect(DATABASE.PAGINATION.MAX_PAGE_SIZE).toBe(100)
      expect(DATABASE.PAGINATION.DEFAULT_PAGE_SIZE).toBeLessThan(DATABASE.PAGINATION.MAX_PAGE_SIZE)
    })

    it('should have positive numeric values', () => {
      Object.values(DATABASE.LIMITS).forEach(value => {
        expect(typeof value).toBe('number')
        expect(value).toBeGreaterThan(0)
      })
      
      Object.values(DATABASE.PAGINATION).forEach(value => {
        expect(typeof value).toBe('number')
        expect(value).toBeGreaterThan(0)
      })
    })
  })

  describe('FEATURES', () => {
    it('should have proper feature flags', () => {
      expect(typeof FEATURES.DEBUG_ENABLED).toBe('boolean')
      expect(typeof FEATURES.VERBOSE_LOGGING).toBe('boolean')
      expect(typeof FEATURES.PWA_ENABLED).toBe('boolean')
      expect(typeof FEATURES.NOTIFICATIONS_ENABLED).toBe('boolean')
      expect(typeof FEATURES.ANALYTICS_ENABLED).toBe('boolean')
    })

    it('should have consistent environment-based flags', () => {
      // Debug flags should match
      expect(FEATURES.DEBUG_ENABLED).toBe(FEATURES.VERBOSE_LOGGING)
      
      // PWA should be enabled
      expect(FEATURES.PWA_ENABLED).toBe(true)
      
      // Notifications should be enabled
      expect(FEATURES.NOTIFICATIONS_ENABLED).toBe(true)
    })
  })

  describe('DEFAULTS', () => {
    it('should have proper default preferences', () => {
      expect(DEFAULTS.PREFERENCES.COLOR_THEME).toBe('default')
      expect(DEFAULTS.PREFERENCES.LANGUAGE).toBe('en')
      expect(DEFAULTS.PREFERENCES.THEME_MODE).toBe('system')
    })

    it('should have proper notification defaults', () => {
      expect(DEFAULTS.NOTIFICATIONS.ENABLED).toBe(true)
      expect(DEFAULTS.NOTIFICATIONS.TYPES).toEqual(['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'SYSTEM'])
    })
  })

  describe('PERFORMANCE', () => {
    it('should have proper cache durations', () => {
      expect(PERFORMANCE.CACHE_DURATION.USER_SESSION).toBe(15 * 60 * 1000)
      expect(PERFORMANCE.CACHE_DURATION.USER_PREFERENCES).toBe(5 * 60 * 1000)
      expect(PERFORMANCE.CACHE_DURATION.STATIC_DATA).toBe(60 * 60 * 1000)
    })

    it('should have proper bundle limits', () => {
      expect(PERFORMANCE.BUNDLE_LIMITS.WARNING_SIZE).toBe(500 * 1024)
      expect(PERFORMANCE.BUNDLE_LIMITS.ERROR_SIZE).toBe(1024 * 1024)
      expect(PERFORMANCE.BUNDLE_LIMITS.WARNING_SIZE).toBeLessThan(PERFORMANCE.BUNDLE_LIMITS.ERROR_SIZE)
    })

    it('should have logical cache duration hierarchy', () => {
      expect(PERFORMANCE.CACHE_DURATION.USER_PREFERENCES).toBeLessThan(PERFORMANCE.CACHE_DURATION.USER_SESSION)
      expect(PERFORMANCE.CACHE_DURATION.USER_SESSION).toBeLessThan(PERFORMANCE.CACHE_DURATION.STATIC_DATA)
    })
  })

  describe('Type Safety', () => {
    it('should export constants with proper TypeScript types', () => {
      // This test ensures our constants maintain type safety
      const statusCode: number = API.STATUS_CODES.OK
      const logLevel: number = LOGGING.LEVELS.ERROR
      const timeout: number = TIMING.API_TIMEOUT
      const radius: string = UI.DEFAULT_RADIUS
      const prefix: string = LOGGING.PREFIXES.API
      
      expect(typeof statusCode).toBe('number')
      expect(typeof logLevel).toBe('number')
      expect(typeof timeout).toBe('number')
      expect(typeof radius).toBe('string')
      expect(typeof prefix).toBe('string')
    })
  })

  describe('Environment Consistency', () => {
    it('should have constants suitable for all environments', () => {
      // Ensure constants work in both test and production environments
      expect(TIMING.PREFERENCES_UPDATE_DEBOUNCE).toBeLessThan(TIMING.API_TIMEOUT)
      expect(VALIDATION.PASSWORD.MIN_LENGTH).toBeLessThan(VALIDATION.PASSWORD.MAX_LENGTH)
      expect(LOGGING.LEVELS.ERROR).toBeLessThan(LOGGING.LEVELS.DEBUG)
    })

    it('should have reasonable default values', () => {
      // Check that defaults are reasonable for production use
      expect(TIMING.PREFERENCES_UPDATE_DEBOUNCE).toBeGreaterThan(100) // Not too aggressive
      expect(TIMING.PREFERENCES_UPDATE_DEBOUNCE).toBeLessThan(2000) // Not too slow
      expect(API.LIMITS.RATE_LIMIT_REQUESTS).toBeGreaterThan(10) // Allow reasonable usage
      expect(API.LIMITS.RATE_LIMIT_REQUESTS).toBeLessThan(1000) // Prevent abuse
      expect(VALIDATION.PASSWORD.MIN_LENGTH).toBeGreaterThanOrEqual(8) // Security minimum
      expect(DATABASE.PAGINATION.DEFAULT_PAGE_SIZE).toBeLessThan(100) // Reasonable page size
    })
  })
})