/**
 * Extracts HSL values from an HSL color string
 * @param hslString Format: "hsl(142,50%,40%)"
 * @returns Object with h, s, l values
 */
export function parseHslString(hslString: string): { h: number; s: number; l: number } {
  // Default values
  const defaultValues = { h: 0, s: 0, l: 0 }

  try {
    // Extract the values from the string
    const match = hslString.match(/hsl$$(\d+),(\d+)%,(\d+)%$$/)
    if (!match) return defaultValues

    return {
      h: Number.parseInt(match[1], 10),
      s: Number.parseInt(match[2], 10),
      l: Number.parseInt(match[3], 10),
    }
  } catch (error) {
    console.error("Error parsing HSL string:", error)
    return defaultValues
  }
}

/**
 * Creates an HSL color string with the specified blend of the theme color
 * @param baseH Hue of the base color
 * @param baseS Saturation of the base color
 * @param baseL Lightness of the base color
 * @param themeH Hue of the theme color
 * @param themeS Saturation of the theme color
 * @param blendFactor How much to blend the theme color (0-1)
 * @returns HSL color string
 */
export function createBlendedHsl(
  baseH: number,
  baseS: number,
  baseL: number,
  themeH: number,
  themeS: number,
  blendFactor: number,
): string {
  // Blend the hue and saturation (not the lightness)
  const blendedH = Math.round(baseH * (1 - blendFactor) + themeH * blendFactor)
  const blendedS = Math.round(baseS * (1 - blendFactor) + themeS * blendFactor)

  return `${blendedH} ${blendedS}% ${baseL}%`
}

/**
 * Gets the HSL values for a specific theme
 * @param theme The theme name
 * @returns HSL values for the theme
 */
export function getThemeHsl(theme: string): { h: number; s: number } {
  switch (theme) {
    case "default":
      return { h: 0, s: 0 } // Black
    case "red":
      return { h: 0, s: 72 }
    case "rose":
      return { h: 336, s: 80 }
    case "orange":
      return { h: 24, s: 95 }
    case "green":
      return { h: 142, s: 50 }
    case "blue":
      return { h: 221, s: 83 }
    case "yellow":
      return { h: 48, s: 96 }
    case "violet":
      return { h: 271, s: 81 }
    default:
      return { h: 0, s: 0 }
  }
}
