/**
 * Project Configuration
 * 
 * This file contains all configurable project metadata.
 * Update this file when using the template for a new project.
 */

export const PROJECT_CONFIG = {
  // Basic Project Information
  name: "v0-boilerplate",
  displayName: "V0 Boilerplate",
  description: "A Next.js 15 monorepo boilerplate with authentication, theming, and TypeScript",
  version: "1.0.1",
  
  // URLs and Domains
  urls: {
    repository: "https://github.com/your-username/v0-boilerplate",
    homepage: "https://your-domain.com",
    documentation: "https://docs.your-domain.com",
  },

  // Production URLs
  production: {
    frontend: {
      url: "https://boilerplate.lumineau.app",
    },
    backend: {
      url: "https://api.boilerplate.lumineau.app",
    },
  },
  
  // Author Information
  author: {
    name: "Your Name",
    email: "your-email@example.com",
    url: "https://your-website.com",
  },
  
  // Development Configuration
  development: {
    frontend: {
      port: 3100,
      url: "http://localhost:3100",
    },
    backend: {
      port: 3101,
      url: "http://localhost:3101",
    },
    database: {
      name: "auth_db",
      user: "auth_user",
      password: "auth_password",
      port: 5432,
    },
  },
  
  // Package Configuration
  packages: {
    namespace: "@boilerplate",
    workspaces: ["apps/*", "packages/*"],
  },
  
  // Features Configuration
  features: {
    authentication: true,
    theming: true,
    internationalization: true,
    darkMode: true,
  },
  
  // Theme Configuration
  themes: {
    available: ["default", "red", "orange", "green", "blue", "teal", "purple", "pink"],
    default: "default",
  },
  
  // Internationalization
  i18n: {
    defaultLocale: "en",
    locales: ["en", "fr"],
  },
  
  // Docker Configuration
  docker: {
    postgres: {
      image: "postgres:16-alpine",
      containerName: "v0-boilerplate-postgres",
    },
  },
  
  // Deployment Configuration
  deployment: {
    vercel: {
      frontend: {
        framework: "nextjs",
        buildCommand: "pnpm build",
        outputDirectory: ".next",
      },
      backend: {
        framework: "nextjs",
        buildCommand: "pnpm build",
        outputDirectory: ".next",
      },
    },
  },
} as const;

// Helper functions to get config values
export const getProjectName = () => PROJECT_CONFIG.name;
export const getDisplayName = () => PROJECT_CONFIG.displayName;
export const getDescription = () => PROJECT_CONFIG.description;
export const getVersion = () => PROJECT_CONFIG.version;
export const getAuthor = () => PROJECT_CONFIG.author;
export const getRepositoryUrl = () => PROJECT_CONFIG.urls.repository;
export const getHomepageUrl = () => PROJECT_CONFIG.urls.homepage;
export const getFrontendUrl = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? PROJECT_CONFIG.production.frontend.url : PROJECT_CONFIG.development.frontend.url;
};

export const getBackendUrl = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? PROJECT_CONFIG.production.backend.url : PROJECT_CONFIG.development.backend.url;
};

export const getProductionFrontendUrl = () => PROJECT_CONFIG.production.frontend.url;
export const getProductionBackendUrl = () => PROJECT_CONFIG.production.backend.url;
export const getDevelopmentFrontendUrl = () => PROJECT_CONFIG.development.frontend.url;
export const getDevelopmentBackendUrl = () => PROJECT_CONFIG.development.backend.url;
export const getFrontendPort = () => PROJECT_CONFIG.development.frontend.port;
export const getBackendPort = () => PROJECT_CONFIG.development.backend.port;
export const getNamespace = () => PROJECT_CONFIG.packages.namespace;
export const getAvailableThemes = () => PROJECT_CONFIG.themes.available;
export const getDefaultTheme = () => PROJECT_CONFIG.themes.default;
export const getSupportedLocales = () => PROJECT_CONFIG.i18n.locales;
export const getDefaultLocale = () => PROJECT_CONFIG.i18n.defaultLocale;

// Type exports for TypeScript
export type ProjectConfig = typeof PROJECT_CONFIG;
export type ThemeName = (typeof PROJECT_CONFIG.themes.available)[number];
export type LocaleName = (typeof PROJECT_CONFIG.i18n.locales)[number];