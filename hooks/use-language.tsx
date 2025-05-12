"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"

type Language = "en" | "fr"

type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    home: "Home",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System",
    logout: "Logout",
    language: "Language",
    english: "English",
    french: "French",
    wip: "This boilerplate is currently in WIP",
    username: "Username",
    settings: "Settings",
    colorTheme: "Color Theme",
    borderRadius: "Border Radius",
  },
  fr: {
    home: "Accueil",
    theme: "Thème",
    light: "Clair",
    dark: "Sombre",
    system: "Système",
    logout: "Déconnexion",
    language: "Langue",
    english: "Anglais",
    french: "Français",
    wip: "Ce modèle est actuellement en cours de développement",
    username: "Nom d'utilisateur",
    settings: "Paramètres",
    colorTheme: "Thème de couleur",
    borderRadius: "Rayon de bordure",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    try {
      const storedLanguage = localStorage.getItem("language") as Language
      if (storedLanguage && (storedLanguage === "en" || storedLanguage === "fr")) {
        setLanguage(storedLanguage)
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("language", language)
    } catch (error) {
      console.error("Error setting localStorage:", error)
    }
  }, [language])

  const t = (key: string) => {
    try {
      return translations[language][key as keyof (typeof translations)[typeof language]] || key
    } catch (error) {
      console.error(`Translation error for key: ${key}`, error)
      return key
    }
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
