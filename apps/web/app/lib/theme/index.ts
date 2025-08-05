import { type ColorThemeDefinition, type ThemeDefinition, baseTheme } from "./base"
import { defaultTheme } from "./default"
import { redTheme } from "./red"
import { orangeTheme } from "./orange"
import { greenTheme } from "./green"
import { blueTheme } from "./blue"
import { tealTheme } from "./teal"
import { purpleTheme } from "./purple"
import { pinkTheme } from "./pink"
import { getAvailableThemes, getDefaultTheme, type ThemeName } from "@boilerplate/config/project.config"

export type ColorTheme = ThemeName
export type ThemeMode = "light" | "dark"

// Import theme definitions based on available themes from config
const themeDefinitions = {
  default: defaultTheme,
  red: redTheme,
  orange: orangeTheme,
  green: greenTheme,
  blue: blueTheme,
  teal: tealTheme,
  purple: purpleTheme,
  pink: pinkTheme,
}

// Create themes object with only available themes from config
export const themes: Record<ColorTheme, ColorThemeDefinition> = getAvailableThemes().reduce(
  (acc: Record<ColorTheme, ColorThemeDefinition>, themeName: ThemeName) => {
    if (themeName in themeDefinitions) {
      acc[themeName] = themeDefinitions[themeName as keyof typeof themeDefinitions]
    }
    return acc
  },
  {} as Record<ColorTheme, ColorThemeDefinition>
)

// Function to get theme variables based on color theme and mode
export function getThemeVariables(colorTheme: ColorTheme, mode: ThemeMode): ThemeDefinition {
  return themes[colorTheme][mode]
}

// Function to apply theme variables to CSS
export function applyTheme(colorTheme: ColorTheme, mode: ThemeMode): void {
  const theme = getThemeVariables(colorTheme, mode)

  // Apply theme variables to root
  const root = document.documentElement

  root.style.setProperty("--background", theme.background)
  root.style.setProperty("--foreground", theme.foreground)
  root.style.setProperty("--card", theme.card)
  root.style.setProperty("--card-foreground", theme.cardForeground)
  root.style.setProperty("--popover", theme.popover)
  root.style.setProperty("--popover-foreground", theme.popoverForeground)
  root.style.setProperty("--primary", theme.primary)
  root.style.setProperty("--primary-foreground", theme.primaryForeground)
  root.style.setProperty("--secondary", theme.secondary)
  root.style.setProperty("--secondary-foreground", theme.secondaryForeground)
  root.style.setProperty("--muted", theme.muted)
  root.style.setProperty("--muted-foreground", theme.mutedForeground)
  root.style.setProperty("--accent", theme.accent)
  root.style.setProperty("--accent-foreground", theme.accentForeground)
  root.style.setProperty("--destructive", theme.destructive)
  root.style.setProperty("--destructive-foreground", theme.destructiveForeground)
  root.style.setProperty("--border", theme.border)
  root.style.setProperty("--input", theme.input)
  root.style.setProperty("--ring", theme.ring)
}

export { baseTheme }
export type { ThemeDefinition, ColorThemeDefinition }