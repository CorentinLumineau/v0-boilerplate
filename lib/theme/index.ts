import { type ColorThemeDefinition, type ThemeDefinition, baseTheme } from "./base"
import { defaultTheme } from "./default"
import { redTheme } from "./red"
import { roseTheme } from "./rose"
import { orangeTheme } from "./orange"
import { greenTheme } from "./green"
import { blueTheme } from "./blue"
import { yellowTheme } from "./yellow"
import { violetTheme } from "./violet"
import { tealTheme } from "./teal"
import { purpleTheme } from "./purple"
import { pinkTheme } from "./pink"
import { slateTheme } from "./slate"
import { amberTheme } from "./amber"
import { limeTheme } from "./lime"
import { emeraldTheme } from "./emerald"
import { cyanTheme } from "./cyan"
import { indigoTheme } from "./indigo"
import { fuchsiaTheme } from "./fuchsia"
import { brownTheme } from "./brown"
import { grayTheme } from "./gray"

export type ColorTheme =
  | "default"
  | "red"
  | "rose"
  | "orange"
  | "green"
  | "blue"
  | "yellow"
  | "violet"
  | "teal"
  | "purple"
  | "pink"
  | "slate"
  | "amber"
  | "lime"
  | "emerald"
  | "cyan"
  | "indigo"
  | "fuchsia"
  | "brown"
  | "gray"
export type ThemeMode = "light" | "dark"

export const themes: Record<ColorTheme, ColorThemeDefinition> = {
  default: defaultTheme,
  red: redTheme,
  rose: roseTheme,
  orange: orangeTheme,
  green: greenTheme,
  blue: blueTheme,
  yellow: yellowTheme,
  violet: violetTheme,
  teal: tealTheme,
  purple: purpleTheme,
  pink: pinkTheme,
  slate: slateTheme,
  amber: amberTheme,
  lime: limeTheme,
  emerald: emeraldTheme,
  cyan: cyanTheme,
  indigo: indigoTheme,
  fuchsia: fuchsiaTheme,
  brown: brownTheme,
  gray: grayTheme,
}

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
