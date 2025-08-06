/**
 * Tests for logger configuration and constants
 * Since logger is mocked in Jest setup, we test the configuration constants
 */

import { LOGGING } from '@/lib/config/constants'

describe('logger configuration', () => {
  describe('Configuration Constants', () => {
    it('should use correct log level constants', () => {
      expect(LOGGING.LEVELS.ERROR).toBe(0)
      expect(LOGGING.LEVELS.WARN).toBe(1)
      expect(LOGGING.LEVELS.INFO).toBe(2)
      expect(LOGGING.LEVELS.DEBUG).toBe(3)
    })

    it('should use correct default log level', () => {
      expect(LOGGING.DEFAULT_LEVEL).toBeDefined()
      expect(typeof LOGGING.DEFAULT_LEVEL).toBe('number')
    })

    it('should have consistent category names', () => {
      expect(LOGGING.CATEGORIES).toEqual({
        API: 'API',
        SETTINGS: 'SETTINGS',
        PREFERENCES: 'PREFERENCES',
        AUTH: 'AUTH',
        DATABASE: 'DATABASE'
      })
    })

    it('should have proper enabled flag configuration', () => {
      expect(typeof LOGGING.ENABLED_IN_PRODUCTION).toBe('boolean')
    })

    it('should have proper log level hierarchy', () => {
      expect(LOGGING.LEVELS.ERROR).toBeLessThan(LOGGING.LEVELS.WARN)
      expect(LOGGING.LEVELS.WARN).toBeLessThan(LOGGING.LEVELS.INFO)
      expect(LOGGING.LEVELS.INFO).toBeLessThan(LOGGING.LEVELS.DEBUG)
    })
  })

  describe('Logger Mock Verification', () => {
    it('should have logger mocked in test environment', () => {
      const { logger } = require('@/lib/utils/logger')
      
      // Verify that logger methods exist and are mocked
      expect(logger.settingsError).toBeDefined()
      expect(logger.settingsWarn).toBeDefined()
      expect(logger.settingsInfo).toBeDefined()
      expect(logger.settingsDebug).toBeDefined()
      expect(logger.apiError).toBeDefined()
      expect(logger.apiWarn).toBeDefined()
      expect(logger.apiInfo).toBeDefined()
      expect(logger.apiDebug).toBeDefined()
      expect(logger.preferencesError).toBeDefined()
      expect(logger.preferencesWarn).toBeDefined()
      expect(logger.preferencesInfo).toBeDefined()
      expect(logger.preferencesDebug).toBeDefined()
      
      // Verify they are jest mock functions
      expect(jest.isMockFunction(logger.settingsError)).toBe(true)
      expect(jest.isMockFunction(logger.apiError)).toBe(true)
      expect(jest.isMockFunction(logger.preferencesError)).toBe(true)
    })

    it('should not throw when calling mocked logger methods', () => {
      const { logger } = require('@/lib/utils/logger')
      
      expect(() => {
        logger.settingsError('Test error', { test: true }, new Error('test'))
        logger.settingsWarn('Test warning', { test: true })
        logger.settingsInfo('Test info', { test: true })
        logger.settingsDebug('Test debug', { test: true })
        logger.apiError('API error', { method: 'GET' }, new Error('test'))
        logger.apiWarn('API warning', { method: 'POST' })
        logger.apiInfo('API info', { status: 200 })
        logger.apiDebug('API debug', { query: 'SELECT *' })
        logger.preferencesError('Pref error', { userId: '123' }, new Error('test'))
        logger.preferencesWarn('Pref warning', { setting: 'theme' })
        logger.preferencesInfo('Pref info', { updated: true })
        logger.preferencesDebug('Pref debug', { source: 'localStorage' })
      }).not.toThrow()
    })
  })
})