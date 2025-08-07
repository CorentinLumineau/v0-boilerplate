/**
 * Comprehensive tests for the Settings Panel component
 * Tests all interactions, theme selection, and integration with settings store
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SettingsPanel } from '@/components/settings/settings-panel'
import { useSettingsStore, useThemeSettings, useLanguageSettings } from '@/hooks/use-settings-store'

// Mock the settings store
jest.mock('@/hooks/use-settings-store', () => ({
  useSettingsStore: jest.fn(),
  useThemeSettings: jest.fn(),
  useLanguageSettings: jest.fn(),
}))

// Mock the theme provider
jest.mock('next-themes', () => ({
  useTheme: jest.fn(() => ({
    theme: 'light',
    setTheme: jest.fn(),
    resolvedTheme: 'light',
    systemTheme: 'light',
  })),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}))

const mockUseSettingsStore = useSettingsStore as jest.MockedFunction<typeof useSettingsStore>
const mockUseThemeSettings = useThemeSettings as jest.MockedFunction<typeof useThemeSettings>
const mockUseLanguageSettings = useLanguageSettings as jest.MockedFunction<typeof useLanguageSettings>
const mockUseTheme = require('next-themes').useTheme

describe('SettingsPanel', () => {
  // Default mock settings store state
  const defaultMockStore = {
    colorTheme: 'default' as const,
    language: 'en' as const,
    themeMode: 'system' as const,
    preferencesLoaded: true,
    setColorTheme: jest.fn(),
    setLanguage: jest.fn(),
    t: jest.fn((key: string) => {
      const translations = {
        theme: 'Theme',
        light: 'Light',
        dark: 'Dark',
        system: 'System',
        language: 'Language',
        english: 'English',
        french: 'Français',
        colorTheme: 'Color Theme'
      }
      return translations[key] || key
    }), // Mock translation function
  }

  const defaultMockTheme = {
    theme: 'light',
    setTheme: jest.fn(),
    resolvedTheme: 'light',
    systemTheme: 'light',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Ensure the t function is properly mocked for each test
    defaultMockStore.t.mockImplementation((key: string) => {
      const translations = {
        theme: 'Theme',
        light: 'Light',
        dark: 'Dark',
        system: 'System',
        language: 'Language',
        english: 'English',
        french: 'Français',
        colorTheme: 'Color Theme'
      }
      return translations[key] || key
    })
    
    mockUseSettingsStore.mockReturnValue(defaultMockStore)
    mockUseThemeSettings.mockReturnValue({
      colorTheme: defaultMockStore.colorTheme,
      setColorTheme: defaultMockStore.setColorTheme,
    })
    mockUseLanguageSettings.mockReturnValue({
      language: defaultMockStore.language,
      setLanguage: defaultMockStore.setLanguage,
      t: defaultMockStore.t,
    })
    mockUseTheme.mockReturnValue(defaultMockTheme)
  })

  describe('Rendering', () => {
    it('should render settings panel with all sections', () => {
      render(<SettingsPanel />)
      
      expect(screen.getByText('Theme')).toBeInTheDocument()
      expect(screen.getByText('Color Theme')).toBeInTheDocument()
      expect(screen.getByText('Language')).toBeInTheDocument()
    })

    it('should display current settings correctly', () => {
      mockUseSettingsStore.mockReturnValue({
        ...defaultMockStore,
        colorTheme: 'blue',
        language: 'fr',
        themeMode: 'dark',
      })
      
      mockUseLanguageSettings.mockReturnValue({
        language: 'fr',
        setLanguage: defaultMockStore.setLanguage,
        t: defaultMockStore.t,
      })
      
      mockUseThemeSettings.mockReturnValue({
        colorTheme: 'blue',
        setColorTheme: defaultMockStore.setColorTheme,
      })
      
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: jest.fn(),
        resolvedTheme: 'dark',
        systemTheme: 'light',
      })

      render(<SettingsPanel />)
      
      // Check if the current selections are reflected in the UI
      // Color theme uses custom button (not ToggleGroup), so check for selected state differently
      const blueThemeButton = screen.getByRole('button', { name: /blue/i })
      expect(blueThemeButton).toHaveClass('border-primary') // Selected color theme has border-primary
      
      // Language and theme mode use ToggleGroup, so they should have data-state
      expect(screen.getByLabelText('French')).toHaveAttribute('data-state', 'on')
      expect(screen.getByLabelText('Dark Mode')).toHaveAttribute('data-state', 'on')
    })

    it('should show loading state when preferences are not loaded', () => {
      mockUseSettingsStore.mockReturnValue({
        ...defaultMockStore,
        preferencesLoaded: false,
      })

      render(<SettingsPanel />)
      
      // Settings should still render but might show default states
      expect(screen.getByText('Theme')).toBeInTheDocument()
      expect(screen.getByText('Language')).toBeInTheDocument()
    })
  })

  describe('Color Theme Selection', () => {
    it('should display all available color themes', () => {
      render(<SettingsPanel />)
      
      const colorThemes = ['default', 'red', 'orange', 'green', 'blue', 'teal', 'purple', 'pink']
      
      colorThemes.forEach(theme => {
        expect(screen.getByRole('button', { name: new RegExp(theme, 'i') })).toBeInTheDocument()
      })
    })

    it('should call setColorTheme when a color theme is selected', async () => {
      const user = userEvent.setup()
      render(<SettingsPanel />)
      
      const blueThemeButton = screen.getByRole('button', { name: /blue/i })
      await user.click(blueThemeButton)
      
      expect(defaultMockStore.setColorTheme).toHaveBeenCalledWith('blue')
    })

    it('should highlight the currently selected color theme', () => {
      mockUseThemeSettings.mockReturnValue({
        colorTheme: 'purple',
        setColorTheme: defaultMockStore.setColorTheme,
      })

      render(<SettingsPanel />)
      
      const purpleButton = screen.getByRole('button', { name: /purple/i })
      // Color theme buttons show selection with border-primary class
      expect(purpleButton).toHaveClass('border-primary')
    })

    it('should update theme selection when store changes', () => {
      const { rerender } = render(<SettingsPanel />)
      
      // Initially default theme should be selected
      expect(screen.getByRole('button', { name: /default/i })).toHaveClass('border-primary')
      
      // Update mock to return different theme
      mockUseThemeSettings.mockReturnValue({
        colorTheme: 'green',
        setColorTheme: defaultMockStore.setColorTheme,
      })
      
      rerender(<SettingsPanel />)
      
      expect(screen.getByRole('button', { name: /green/i })).toHaveClass('border-primary')
      expect(screen.getByRole('button', { name: /default/i })).not.toHaveClass('border-primary')
    })
  })

  describe('Language Selection', () => {
    it('should display available languages', () => {
      render(<SettingsPanel />)
      
      // The language buttons have aria-label attributes
      expect(screen.getByLabelText('English')).toBeInTheDocument()
      expect(screen.getByLabelText('French')).toBeInTheDocument()
    })

    it('should call setLanguage when a language is selected', async () => {
      const user = userEvent.setup()
      render(<SettingsPanel />)
      
      const frenchButton = screen.getByLabelText('French')
      await user.click(frenchButton)
      
      expect(defaultMockStore.setLanguage).toHaveBeenCalledWith('fr')
    })

    it('should highlight the currently selected language', () => {
      mockUseLanguageSettings.mockReturnValue({
        language: 'fr',
        setLanguage: defaultMockStore.setLanguage,
        t: defaultMockStore.t,
      })

      render(<SettingsPanel />)
      
      const frenchButton = screen.getByLabelText('French')
      expect(frenchButton).toHaveAttribute('data-state', 'on')
    })
  })

  describe('Theme Mode Selection', () => {
    it('should display all theme mode options', () => {
      render(<SettingsPanel />)
      
      expect(screen.getByLabelText('System Mode')).toBeInTheDocument()
      expect(screen.getByLabelText('Light Mode')).toBeInTheDocument()
      expect(screen.getByLabelText('Dark Mode')).toBeInTheDocument()
    })

    it('should call setThemeMode and next-themes setTheme when theme mode is selected', async () => {
      const user = userEvent.setup()
      const mockSetTheme = jest.fn()
      
      mockUseTheme.mockReturnValue({
        ...defaultMockTheme,
        setTheme: mockSetTheme,
      })

      render(<SettingsPanel />)
      
      const darkButton = screen.getByLabelText('Dark Mode')
      await user.click(darkButton)
      
      expect(mockSetTheme).toHaveBeenCalledWith('dark')
    })

    it('should highlight the currently selected theme mode', () => {
      mockUseTheme.mockReturnValue({
        ...defaultMockTheme,
        theme: 'light',
      })

      render(<SettingsPanel />)
      
      const lightButton = screen.getByLabelText('Light Mode')
      expect(lightButton).toHaveAttribute('data-state', 'on')
    })

    it('should sync with next-themes when themeMode changes to system', async () => {
      const user = userEvent.setup()
      const mockSetTheme = jest.fn()
      
      mockUseTheme.mockReturnValue({
        ...defaultMockTheme,
        setTheme: mockSetTheme,
        systemTheme: 'dark',
      })

      render(<SettingsPanel />)
      
      const systemButton = screen.getByLabelText('System Mode')
      await user.click(systemButton)
      
      expect(mockSetTheme).toHaveBeenCalledWith('system')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<SettingsPanel />)
      
      // Check for proper button roles
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
      
      // Check for proper headings - component has Theme, Language, and Color Theme headings
      expect(screen.getByText('Theme')).toBeInTheDocument()
      expect(screen.getByText('Language')).toBeInTheDocument()  
      expect(screen.getByText('Color Theme')).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<SettingsPanel />)
      
      const firstColorButton = screen.getByRole('button', { name: /default/i })
      
      // Focus the first button
      firstColorButton.focus()
      expect(firstColorButton).toHaveFocus()
      
      // Should be able to activate with Enter
      await user.keyboard('{Enter}')
      expect(defaultMockStore.setColorTheme).toHaveBeenCalledWith('default')
    })

    it('should have proper contrast and visual indicators', () => {      
      // Set up mock to have red theme selected
      mockUseThemeSettings.mockReturnValue({
        ...defaultMockStore,
        colorTheme: 'red',
        setColorTheme: jest.fn(),
      })
      
      render(<SettingsPanel />)
      
      // Color theme buttons use border-primary class for visual selection
      const redButtons = screen.getAllByRole('button', { name: /red/i })
      const redButton = redButtons[0] // Get the first red button
      expect(redButton).toHaveClass('border-primary')
    })
  })

  describe('Integration', () => {
    it('should handle rapid setting changes without errors', async () => {
      const user = userEvent.setup()
      render(<SettingsPanel />)
      
      // Rapidly change multiple settings
      await user.click(screen.getByRole('button', { name: /blue/i }))
      await user.click(screen.getByLabelText('French'))
      await user.click(screen.getByLabelText('Dark Mode'))
      await user.click(screen.getByRole('button', { name: /green/i }))
      
      expect(defaultMockStore.setColorTheme).toHaveBeenCalledWith('blue')
      expect(defaultMockStore.setColorTheme).toHaveBeenCalledWith('green')
      expect(defaultMockStore.setLanguage).toHaveBeenCalledWith('fr')
      // Theme mode is handled by next-themes setTheme, not a separate setThemeMode function
    })

    it('should handle settings store errors gracefully', () => {
      const mockSetColorTheme = jest.fn().mockImplementation(() => {
        throw new Error('Settings error')
      })
      
      mockUseSettingsStore.mockReturnValue({
        ...defaultMockStore,
        setColorTheme: mockSetColorTheme,
      })

      render(<SettingsPanel />)
      
      // Should not throw error when settings update fails
      expect(() => {
        fireEvent.click(screen.getByRole('button', { name: /blue/i }))
      }).not.toThrow()
    })

    it('should work without preferences loaded', () => {
      mockUseSettingsStore.mockReturnValue({
        ...defaultMockStore,
        preferencesLoaded: false,
      })

      expect(() => {
        render(<SettingsPanel />)
      }).not.toThrow()
      
      expect(screen.getByText('Theme')).toBeInTheDocument()
    })
  })

  describe('Visual Feedback', () => {
    it('should show visual feedback when settings change', async () => {
      const user = userEvent.setup()
      render(<SettingsPanel />)
      
      const blueButton = screen.getByRole('button', { name: /blue/i })
      
      // Initially not selected (color themes use border classes, not data-state)
      expect(blueButton).not.toHaveClass('border-primary')
      
      // After clicking, mock store should be called
      await user.click(blueButton)
      expect(defaultMockStore.setColorTheme).toHaveBeenCalledWith('blue')
      
      // Update mock to reflect the change
      mockUseThemeSettings.mockReturnValue({
        colorTheme: 'blue',
        setColorTheme: defaultMockStore.setColorTheme,
      })
      
      // Re-render to show updated state
      const { rerender } = render(<SettingsPanel />)
      rerender(<SettingsPanel />)
      
      const updatedBlueButtons = screen.getAllByRole('button', { name: /blue/i })
      const updatedBlueButton = updatedBlueButtons.find(btn => btn.classList.contains('border-primary'))
      expect(updatedBlueButton).toHaveClass('border-primary')
    })

    it('should maintain consistent visual state across re-renders', () => {
      mockUseThemeSettings.mockReturnValue({
        colorTheme: 'purple',
        setColorTheme: defaultMockStore.setColorTheme,
      })
      
      mockUseLanguageSettings.mockReturnValue({
        language: 'fr',
        setLanguage: defaultMockStore.setLanguage,
        t: defaultMockStore.t,
      })
      
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: jest.fn(),
        resolvedTheme: 'dark',
        systemTheme: 'light',
      })

      const { rerender } = render(<SettingsPanel />)
      
      // Initial render
      expect(screen.getByRole('button', { name: /purple/i })).toHaveClass('border-primary')
      expect(screen.getByLabelText('French')).toHaveAttribute('data-state', 'on')
      expect(screen.getByLabelText('Dark Mode')).toHaveAttribute('data-state', 'on')
      
      // Re-render
      rerender(<SettingsPanel />)
      
      expect(screen.getByRole('button', { name: /purple/i })).toHaveClass('border-primary')
      expect(screen.getByLabelText('French')).toHaveAttribute('data-state', 'on')
      expect(screen.getByLabelText('Dark Mode')).toHaveAttribute('data-state', 'on')
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined settings gracefully', () => {
      mockUseSettingsStore.mockReturnValue({
        ...defaultMockStore,
        colorTheme: undefined as any,
        language: undefined as any,
        themeMode: undefined as any,
      })

      expect(() => {
        render(<SettingsPanel />)
      }).not.toThrow()
    })

    it('should handle invalid theme values gracefully', () => {
      mockUseSettingsStore.mockReturnValue({
        ...defaultMockStore,
        colorTheme: 'invalid' as any,
        language: 'invalid' as any,
        themeMode: 'invalid' as any,
      })

      expect(() => {
        render(<SettingsPanel />)
      }).not.toThrow()
    })

    it('should handle missing theme provider gracefully', () => {
      mockUseTheme.mockReturnValue({
        theme: undefined,
        setTheme: jest.fn(),
        resolvedTheme: undefined,
        systemTheme: undefined,
      })

      expect(() => {
        render(<SettingsPanel />)
      }).not.toThrow()
      
      // Component should still render with undefined theme
      expect(screen.getByText('Theme')).toBeInTheDocument()
    })

    it('should handle unknown color theme gracefully', () => {
      // Mock a theme that doesn't exist in themes object
      mockUseThemeSettings.mockReturnValue({
        colorTheme: 'unknown' as any,
        setColorTheme: jest.fn(),
      })

      render(<SettingsPanel />)
      
      // Component should render and use fallback color
      expect(screen.getByText('Theme')).toBeInTheDocument()
    })

    it('should handle compact mode with all conditional branches', () => {
      render(<SettingsPanel compact />)
      
      // Should have compact classes and text variations
      expect(screen.getByText('EN')).toBeInTheDocument()
      expect(screen.getByText('FR')).toBeInTheDocument()
      
      // Icons should be present but text should be abbreviated
      expect(screen.queryByText('English')).not.toBeInTheDocument()
      expect(screen.queryByText('French')).not.toBeInTheDocument()
    })

    it('should handle empty theme change values', () => {
      const mockSetTheme = jest.fn()
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        resolvedTheme: 'light',
        systemTheme: 'light',
      })

      render(<SettingsPanel />)
      
      const toggleGroups = screen.getAllByRole('group')
      const toggleGroup = toggleGroups[0] // First group is the theme mode group
      
      // Simulate empty value change
      fireEvent.click(toggleGroup)
      fireEvent.keyDown(toggleGroup, { key: 'Enter' })
      
      // Should not call setTheme with empty value
      expect(mockSetTheme).not.toHaveBeenCalledWith('')
    })

    it('should handle invalid language change values', () => {
      const mockSetLanguage = jest.fn()
      mockUseLanguageSettings.mockReturnValue({
        language: 'en',
        setLanguage: mockSetLanguage,
        t: defaultMockStore.t,
      })

      render(<SettingsPanel />)
      
      // Try to set invalid language
      const languageToggle = screen.getAllByRole('group')[1]
      fireEvent.click(languageToggle)
      
      // Should not call setLanguage with invalid value
      expect(mockSetLanguage).not.toHaveBeenCalledWith('invalid')
    })
  })

  describe('Branch Coverage', () => {
    it('should cover getThemePrimaryColor fallback branch', () => {
      // This test ensures the fallback color is used for unknown themes
      mockUseThemeSettings.mockReturnValue({
        colorTheme: 'nonexistent' as any,
        setColorTheme: jest.fn(),
      })

      render(<SettingsPanel />)
      
      // Component should render without errors even with invalid theme
      expect(screen.getByText('Theme')).toBeInTheDocument()
    })

    it('should cover all conditional rendering branches in compact mode', () => {
      render(<SettingsPanel compact />)
      
      // Test all conditional branches for compact mode
      const icons = document.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
      
      // Compact text should be shown
      expect(screen.getByText('EN')).toBeInTheDocument()
      expect(screen.getByText('FR')).toBeInTheDocument()
      
      // Full text should not be shown in compact mode
      expect(screen.queryByText('English')).not.toBeInTheDocument()
      expect(screen.queryByText('French')).not.toBeInTheDocument()
    })

    it('should cover all conditional rendering branches in normal mode', () => {
      render(<SettingsPanel compact={false} />)
      
      // Full text should be shown in normal mode
      expect(screen.getByText('English')).toBeInTheDocument()
      expect(screen.getByText('Français')).toBeInTheDocument()
      expect(screen.getByText('Light')).toBeInTheDocument()
      expect(screen.getByText('Dark')).toBeInTheDocument()
      expect(screen.getByText('System')).toBeInTheDocument()
      
      // Compact abbreviations should not be shown
      expect(screen.queryByText('EN')).not.toBeInTheDocument()
      expect(screen.queryByText('FR')).not.toBeInTheDocument()
    })
  })
})