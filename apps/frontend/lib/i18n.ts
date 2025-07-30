import enTranslations from "@/locales/en.json"
import frTranslations from "@/locales/fr.json"
import { getSupportedLocales, type LocaleName } from "./project-config"

export type Language = LocaleName

export const translations: Record<Language, Record<string, string>> = {
  en: enTranslations,
  fr: frTranslations,
}

export function getTranslation(language: Language, key: string): string {
  return translations[language][key] || key
}
