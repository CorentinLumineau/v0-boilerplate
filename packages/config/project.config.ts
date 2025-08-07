/**
 * Project Configuration for Web App
 * 
 * This file contains all configurable project metadata for the unified web application.
 * Update this file when using the template for a new project.
 */

export const PROJECT_CONFIG = {
  // Basic Project Information
  name: "boilerplate",
  displayName: "V0 Boilerplate",
  description: "A Next.js 15 web application with authentication, theming, and TypeScript",
  version: "0.1.3",
  
  // URLs and Domains - Single domain architecture
  urls: {
    repository: "https://github.com/your-username/boilerplate",
    homepage: "https://your-domain.com",
    documentation: "https://docs.your-domain.com",
    github: "https://github.com/your-username/boilerplate",
  },

  // Production URLs - Single domain
  production: {
    web: {
      url: "https://boilerplate.lumineau.app",
    },
  },

  // Staging URLs - Single domain
  staging: {
    web: {
      url: "https://boilerplate-staging.lumineau.app",
    },
  },

  // Develop URLs - Single domain (dynamic based on branch)
  develop: {
    web: {
      urlPattern: "https://boilerplate-git-{branch}.lumineau.app",
    },
  },
  
  // Author Information
  author: {
    name: "Your Name",
    email: "your-email@example.com",
    url: "https://your-website.com",
  },
  
  // Development Configuration - Single port
  development: {
    web: {
      port: 3000,
      url: "http://localhost:3000",
    },
    database: {
      name: "auth_db",
      user: "auth_user",
      password: "auth_password",
      port: 5432,
    },
  },
  
  // Package Configuration - Updated for web app
  packages: {
    namespace: "@boilerplate",
    workspaces: ["apps/web", "packages/*"],
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
      containerName: "boilerplate-postgres",
    },
  },
  
  // Deployment Configuration - Single app
  deployment: {
    vercel: {
      web: {
        framework: "nextjs",
        buildCommand: "pnpm build",
        outputDirectory: ".next",
      },
    },
  },
  
  // CORS Configuration - Simplified for single domain
  cors: {
    // No additional origins needed for single domain
    additionalOrigins: [],
    credentials: true,
    maxAge: 86400, // 24 hours
  },
} as const;

// Environment detection functions - Updated for web app
export const getEnvironmentType = (): "production" | "staging" | "develop" | "development" => {
  // For local development
  if (process.env.NODE_ENV === "development") {
    return "development";
  }
  
  // For Vercel deployments
  if (typeof window === "undefined") {
    // Server-side: use Vercel environment variables
    const vercelEnv = process.env.VERCEL_ENV;
    const branch = process.env.VERCEL_GIT_COMMIT_REF;
    
    if (vercelEnv === "production") return "production";
    if (branch === "staging") return "staging";
    return "develop";
  } else {
    // Client-side: detect from URL
    const hostname = window.location.hostname;
    
    if (hostname === "boilerplate.lumineau.app") return "production";
    if (hostname.includes("-staging.lumineau.app")) return "staging";
    if (hostname.includes("-git-") || hostname.includes("vercel.app")) return "develop";
    return "development";
  }
};

export const getBranchName = (): string => {
  const branch = process.env.VERCEL_GIT_COMMIT_REF || "develop";
  return branch.replace("/", "-");
};

// Updated URL helper functions for web app
export const getWebUrl = (): string => {
  // For Vercel deployments, always use VERCEL_URL if available
  // This ensures branch deployments use their own URLs
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Use NEXT_PUBLIC_APP_URL if explicitly set
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // Otherwise, use environment-based URLs
  const env = getEnvironmentType();
  
  switch (env) {
    case "production":
      return PROJECT_CONFIG.production.web.url;
    case "staging":
      return PROJECT_CONFIG.staging.web.url;
    case "develop":
      const branch = getBranchName();
      return PROJECT_CONFIG.develop.web.urlPattern.replace("{branch}", branch);
    case "development":
    default:
      return PROJECT_CONFIG.development.web.url;
  }
};

// Updated environment URLs function - Single domain
export const getCurrentEnvironmentUrls = () => ({
  web: getWebUrl(),
  environment: getEnvironmentType(),
});

// Helper functions for web app
export const getProjectName = () => PROJECT_CONFIG.name;
export const getDisplayName = () => PROJECT_CONFIG.displayName;
export const getDescription = () => PROJECT_CONFIG.description;
export const getVersion = () => PROJECT_CONFIG.version;
export const getAuthor = () => PROJECT_CONFIG.author;
export const getRepositoryUrl = () => PROJECT_CONFIG.urls.repository;
export const getHomepageUrl = () => PROJECT_CONFIG.urls.homepage;
export const getGithubUrl = () => PROJECT_CONFIG.urls.github;

// Web app specific helpers
export const getWebPort = () => PROJECT_CONFIG.development.web.port;
export const getProductionWebUrl = () => PROJECT_CONFIG.production.web.url;
export const getStagingWebUrl = () => PROJECT_CONFIG.staging.web.url;
export const getDevelopmentWebUrl = () => PROJECT_CONFIG.development.web.url;

// Theme helpers
export const getAvailableThemes = () => PROJECT_CONFIG.themes.available;
export const getDefaultTheme = () => PROJECT_CONFIG.themes.default;

// i18n helpers
export const getSupportedLocales = () => PROJECT_CONFIG.i18n.locales;
export const getDefaultLocale = () => PROJECT_CONFIG.i18n.defaultLocale;

// Legacy compatibility functions (deprecated but maintained for migration)
export const getFrontendUrl = getWebUrl;
export const getBackendUrl = getWebUrl;
export const getFrontendPort = getWebPort;
export const getBackendPort = getWebPort;
export const getDevelopmentFrontendUrl = getDevelopmentWebUrl;
export const getProductionFrontendUrl = getProductionWebUrl;

// Type exports for TypeScript
export type ProjectConfig = typeof PROJECT_CONFIG;
export type ThemeName = (typeof PROJECT_CONFIG.themes.available)[number];
export type LocaleName = (typeof PROJECT_CONFIG.i18n.locales)[number];
export type EnvironmentType = "production" | "staging" | "develop" | "development";