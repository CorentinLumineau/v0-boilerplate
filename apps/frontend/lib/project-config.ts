// Re-export project config values from shared config package
export {
  getVersion,
  getAvailableThemes,
  getDefaultTheme, 
  getSupportedLocales,
  getDefaultLocale,
  getFrontendUrl,
  getBackendUrl,
  type ThemeName,
  type LocaleName
} from "@boilerplate/config/project.config";