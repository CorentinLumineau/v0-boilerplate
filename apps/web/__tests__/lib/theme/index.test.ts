/**
 * Tests for theme utilities and functions
 * @jest-environment jsdom
 */

// Mock project config
jest.mock('@boilerplate/config/project.config', () => ({
  getAvailableThemes: jest.fn().mockReturnValue(['default', 'red', 'blue', 'green', 'orange', 'purple', 'pink', 'teal']),
  getDefaultTheme: jest.fn().mockReturnValue('default')
}))

import { themes, getThemeVariables, applyTheme } from '@/lib/theme'
import { getAvailableThemes } from '@boilerplate/config/project.config'

const mockGetAvailableThemes = getAvailableThemes as jest.MockedFunction<typeof getAvailableThemes>

describe('theme index', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset available themes
    mockGetAvailableThemes.mockReturnValue(['default', 'red', 'blue', 'green', 'orange', 'purple', 'pink', 'teal'])
  })

  describe('themes object', () => {
    it('should include all available themes from config', () => {
      const availableThemes = getAvailableThemes()
      
      expect(Object.keys(themes)).toHaveLength(availableThemes.length)
      availableThemes.forEach(theme => {
        expect(themes).toHaveProperty(theme)
      })
    })

    it('should have light and dark modes for each theme', () => {
      Object.values(themes).forEach(theme => {
        expect(theme).toHaveProperty('light')
        expect(theme).toHaveProperty('dark')
      })
    })

    it('should have all required theme properties', () => {
      const requiredProps = [
        'background', 'foreground', 'card', 'cardForeground',
        'popover', 'popoverForeground', 'primary', 'primaryForeground',
        'secondary', 'secondaryForeground', 'muted', 'mutedForeground',
        'accent', 'accentForeground', 'destructive', 'destructiveForeground',
        'border', 'input', 'ring'
      ]

      Object.values(themes).forEach(theme => {
        requiredProps.forEach(prop => {
          expect(theme.light).toHaveProperty(prop)
          expect(theme.dark).toHaveProperty(prop)
        })
      })
    })
  })

  describe('getThemeVariables', () => {
    it('should return correct theme for light mode', () => {
      const theme = getThemeVariables('default', 'light')
      
      expect(theme).toBeDefined()
      expect(theme).toBe(themes.default.light)
    })

    it('should return correct theme for dark mode', () => {
      const theme = getThemeVariables('default', 'dark')
      
      expect(theme).toBeDefined()
      expect(theme).toBe(themes.default.dark)
    })

    it('should work with all available color themes', () => {
      const availableThemes = getAvailableThemes()
      
      availableThemes.forEach(colorTheme => {
        const lightTheme = getThemeVariables(colorTheme as any, 'light')
        const darkTheme = getThemeVariables(colorTheme as any, 'dark')
        
        expect(lightTheme).toBeDefined()
        expect(darkTheme).toBeDefined()
        expect(lightTheme).toBe(themes[colorTheme as keyof typeof themes].light)
        expect(darkTheme).toBe(themes[colorTheme as keyof typeof themes].dark)
      })
    })
  })

  describe('applyTheme', () => {
    let mockSetProperty: jest.Mock

    beforeEach(() => {
      // Mock document.documentElement.style.setProperty
      mockSetProperty = jest.fn()
      Object.defineProperty(document, 'documentElement', {
        value: {
          style: {
            setProperty: mockSetProperty
          }
        },
        writable: true
      })
    })

    it('should apply all theme variables to document root', () => {
      applyTheme('default', 'light')

      const theme = themes.default.light
      
      expect(mockSetProperty).toHaveBeenCalledWith('--background', theme.background)
      expect(mockSetProperty).toHaveBeenCalledWith('--foreground', theme.foreground)
      expect(mockSetProperty).toHaveBeenCalledWith('--card', theme.card)
      expect(mockSetProperty).toHaveBeenCalledWith('--card-foreground', theme.cardForeground)
      expect(mockSetProperty).toHaveBeenCalledWith('--popover', theme.popover)
      expect(mockSetProperty).toHaveBeenCalledWith('--popover-foreground', theme.popoverForeground)
      expect(mockSetProperty).toHaveBeenCalledWith('--primary', theme.primary)
      expect(mockSetProperty).toHaveBeenCalledWith('--primary-foreground', theme.primaryForeground)
      expect(mockSetProperty).toHaveBeenCalledWith('--secondary', theme.secondary)
      expect(mockSetProperty).toHaveBeenCalledWith('--secondary-foreground', theme.secondaryForeground)
      expect(mockSetProperty).toHaveBeenCalledWith('--muted', theme.muted)
      expect(mockSetProperty).toHaveBeenCalledWith('--muted-foreground', theme.mutedForeground)
      expect(mockSetProperty).toHaveBeenCalledWith('--accent', theme.accent)
      expect(mockSetProperty).toHaveBeenCalledWith('--accent-foreground', theme.accentForeground)
      expect(mockSetProperty).toHaveBeenCalledWith('--destructive', theme.destructive)
      expect(mockSetProperty).toHaveBeenCalledWith('--destructive-foreground', theme.destructiveForeground)
      expect(mockSetProperty).toHaveBeenCalledWith('--border', theme.border)
      expect(mockSetProperty).toHaveBeenCalledWith('--input', theme.input)
      expect(mockSetProperty).toHaveBeenCalledWith('--ring', theme.ring)
    })

    it('should apply correct number of CSS variables', () => {
      applyTheme('default', 'light')
      
      // Should set exactly 19 CSS variables
      expect(mockSetProperty).toHaveBeenCalledTimes(19)
    })

    it('should apply dark mode theme correctly', () => {
      applyTheme('purple', 'dark')

      const theme = themes.purple.dark
      
      expect(mockSetProperty).toHaveBeenCalledWith('--background', theme.background)
      expect(mockSetProperty).toHaveBeenCalledWith('--foreground', theme.foreground)
      expect(mockSetProperty).toHaveBeenCalledWith('--primary', theme.primary)
      expect(mockSetProperty).toHaveBeenCalledWith('--primary-foreground', theme.primaryForeground)
    })

    it('should work with all available themes', () => {
      const availableThemes = getAvailableThemes()
      
      availableThemes.forEach(colorTheme => {
        mockSetProperty.mockClear()
        
        applyTheme(colorTheme as any, 'light')
        expect(mockSetProperty).toHaveBeenCalledTimes(19)
        
        mockSetProperty.mockClear()
        
        applyTheme(colorTheme as any, 'dark')
        expect(mockSetProperty).toHaveBeenCalledTimes(19)
      })
    })
  })

  describe('theme exports', () => {
    it('should export baseTheme', () => {
      const { baseTheme } = require('@/lib/theme')
      expect(baseTheme).toBeDefined()
      expect(baseTheme).toHaveProperty('radius')
      expect(baseTheme.radius).toBe('0.5rem')
    })
  })
})