import enTranslations from "@/locales/en.json"
import frTranslations from "@/locales/fr.json"

export type Language = "en" | "fr"

export const translations: Record<Language, Record<string, string>> = {
  en: enTranslations,
  fr: frTranslations,
}

export function getTranslation(language: Language, key: string): string {
  return translations[language][key] || key
}
