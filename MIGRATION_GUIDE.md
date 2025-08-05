# Complete Migration Guide: Merge Frontend & Backend into Web App

## **🎯 Objective**
Transform the current monorepo structure from separate `apps/frontend/` and `apps/backend/` into a single web Next.js application at `apps/web/` that serves both frontend pages and API routes under one domain.

## **📋 Migration Checklist**

### **Phase 1: Create Web App Structure**

1. **Create new web app directory structure**
2. **Merge package.json dependencies**
3. **Set up web Next.js configuration**
4. **Create web TypeScript configuration**

### **Phase 2: Migrate Frontend Components & Pages**

1. **Move all frontend pages to `apps/web/app/(web)/`**
2. **Move all frontend components to `apps/web/app/components/`**
3. **Move frontend libraries and utilities**
4. **Update all import paths**

### **Phase 3: Migrate Backend API Routes**

1. **Move all API routes to `apps/web/app/api/`**
2. **Move backend libraries and utilities**
3. **Migrate Prisma configuration**
4. **Update authentication setup**

### **Phase 4: Update Configuration & Dependencies**

1. **Update workspace configuration**
2. **Update build scripts**
3. **Update environment variables**
4. **Update Vercel deployment configuration**

### **Phase 5: Testing & Deployment**

1. **Test web application locally**
2. **Update deployment scripts**
3. **Configure single Vercel project**
4. **Update documentation**

---

## **🔧 Detailed Implementation Steps**

### **Step 1: Create Web App Structure**

```bash
# Create new web app directory
mkdir -p apps/web/app/{api,components,lib,hooks,locales,styles}
mkdir -p apps/web/app/{(web),(auth),(protected)}
mkdir -p apps/web/prisma
mkdir -p apps/web/public
```

### **Step 2: Create Web Package.json**

```json
{
  "name": "@boilerplate/web",
  "version": "1.0.1",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "pnpm --filter @boilerplate/types build && pnpm --filter @boilerplate/config build && prisma generate && prisma migrate deploy && next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "db:migrate": "prisma migrate deploy",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@boilerplate/config": "workspace:*",
    "@boilerplate/types": "workspace:*",
    "@prisma/client": "^6.13.0",
    "@radix-ui/react-alert-dialog": "^1.1.2",
    "@radix-ui/react-avatar": "^1.1.1",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-toggle": "^1.1.0",
    "@radix-ui/react-toggle-group": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.3",
    "@tanstack/react-query": "^5.59.16",
    "better-auth": "^1.0.0-beta.44",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.468.0",
    "next": "15.4.5",
    "next-pwa": "^5.6.0",
    "next-themes": "^0.4.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^2.5.4",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@types/node": "^22.10.2",
    "@types/react": "^19.0.2",
    "@types/react-dom": "^19.0.2",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.17.0",
    "eslint-config-next": "15.4.5",
    "postcss": "^8.4.49",
    "prisma": "^6.13.0",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.8.3"
  }
}
```

### **Step 3: Create Web Next.js Configuration**

```javascript
// apps/web/next.config.mjs
import withPWA from 'next-pwa'

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

const config = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})(nextConfig)

export default config
```

### **Step 4: Create Web TypeScript Configuration**

```json
// apps/web/tsconfig.json
{
  "extends": "@boilerplate/config/tsconfig/nextjs.json",
  "compilerOptions": {
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./app/*"],
      "@/components/*": ["./app/components/*"],
      "@/lib/*": ["./app/lib/*"],
      "@/hooks/*": ["./app/hooks/*"],
      "@/types/*": ["./app/types/*"],
      "@/locales/*": ["./app/locales/*"],
      "@/styles/*": ["./app/styles/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

### **Step 5: Create Web Tailwind Configuration**

```javascript
// apps/web/tailwind.config.ts
import type { Config } from 'tailwindcss'
import sharedConfig from '@boilerplate/config/tailwind'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  presets: [sharedConfig],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

### **Step 6: Create Web Vercel Configuration**

```json
// apps/web/vercel.json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "buildCommand": "pnpm --filter @boilerplate/types build && pnpm --filter @boilerplate/config build && prisma generate && prisma migrate deploy && next build",
  "installCommand": "pnpm install --frozen-lockfile",
  "outputDirectory": ".next",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization, Cookie, X-Requested-With, Accept, X-CSRF-Token, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version"
        },
        {
          "key": "Access-Control-Allow-Credentials",
          "value": "true"
        },
        {
          "key": "Access-Control-Max-Age",
          "value": "86400"
        }
      ]
    }
  ]
}
```

### **Step 7: Migrate Frontend Pages**

```bash
# Move frontend pages to web app
cp -r apps/frontend/app/(auth) apps/web/app/
cp -r apps/frontend/app/(protected) apps/web/app/
cp -r apps/frontend/app/debug apps/web/app/
cp apps/frontend/app/globals.css apps/web/app/
cp apps/frontend/app/layout.tsx apps/web/app/
cp apps/frontend/app/page.tsx apps/web/app/(web)/
```

### **Step 8: Migrate Frontend Components**

```bash
# Move all frontend components
cp -r apps/frontend/components apps/web/app/
cp -r apps/frontend/hooks apps/web/app/
cp -r apps/frontend/lib apps/web/app/
cp -r apps/frontend/locales apps/web/app/
cp -r apps/frontend/providers apps/web/app/
cp -r apps/frontend/types apps/web/app/
cp -r apps/frontend/public apps/web/
```

### **Step 9: Migrate Backend API Routes**

```bash
# Move all backend API routes
cp -r apps/backend/app/api apps/web/app/
cp -r apps/backend/lib apps/web/app/
cp -r apps/backend/prisma apps/web/
cp apps/backend/middleware.ts apps/web/
```

### **Step 10: Update Import Paths**

**Update all import statements in the web app:**

```typescript
// Before (frontend)
import { Button } from '@/components/ui/button'
import { getCurrentEnvironmentUrls } from '@boilerplate/config'

// After (web)
import { Button } from '@/components/ui/button'
import { getCurrentEnvironmentUrls } from '@boilerplate/config'
```

**Update API client imports:**

```typescript
// apps/web/app/lib/auth-client.ts
import { getCurrentEnvironmentUrls } from '@boilerplate/config'

const { backend } = getCurrentEnvironmentUrls()

export const authClient = {
  // Update all API calls to use relative paths
  health: () => fetch('/api/health'),
  notifications: () => fetch('/api/notifications'),
  // ... other API calls
}
```

### **Step 11: Update Root Workspace Configuration**

```json
// package.json (root)
{
  "workspaces": [
    "apps/web",
    "packages/*"
  ],
  "scripts": {
    "dev": "pnpm --filter @boilerplate/web dev",
    "build": "pnpm --filter @boilerplate/web build",
    "start": "pnpm --filter @boilerplate/web start",
    "lint": "pnpm --filter @boilerplate/web lint",
    "type-check": "pnpm --filter @boilerplate/web type-check"
  }
}
```

### **Step 12: Update Turborepo Configuration**

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "type-check": {
      "dependsOn": ["^type-check"]
    },
    "test": {
      "dependsOn": ["^test"]
    },
    "clean": {
      "cache": false
    },
    "format": {
      "cache": false
    }
  }
}
```

### **Step 13: Create Web Environment Configuration**

```bash
# apps/web/.env.local
# Database
DATABASE_URL="postgresql://auth_user:auth_password@localhost:5432/auth_db"

# Authentication
AUTH_SECRET="your-auth-secret-here"
AUTH_URL="http://localhost:3000"

# Environment
NODE_ENV="development"
```

  },
  // ... other auth queries
}
```

### **Step 14: Update Configuration Files for Web App**

#### **Step 14.1: Update Project Configuration (packages/config/project.config.ts)**

**Replace the entire project.config.ts file with web app configuration:**

```typescript
/**
 * Project Configuration for Web App
 * 
 * This file contains all configurable project metadata for the unified web application.
 * Update this file when using the template for a new project.
 */

export const PROJECT_CONFIG = {
  // Basic Project Information
  name: "v0-boilerplate",
  displayName: "V0 Boilerplate",
  description: "A Next.js 15 web application with authentication, theming, and TypeScript",
  version: "1.0.1",
  
  // URLs and Domains - Single domain architecture
  urls: {
    repository: "https://github.com/your-username/v0-boilerplate",
    homepage: "https://your-domain.com",
    documentation: "https://docs.your-domain.com",
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
      containerName: "v0-boilerplate-postgres",
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

// Web app specific helpers
export const getWebPort = () => PROJECT_CONFIG.development.web.port;
export const getProductionWebUrl = () => PROJECT_CONFIG.production.web.url;
export const getStagingWebUrl = () => PROJECT_CONFIG.staging.web.url;
export const getDevelopmentWebUrl = () => PROJECT_CONFIG.development.web.url;

// Legacy compatibility functions (deprecated but maintained for migration)
export const getFrontendUrl = getWebUrl;
export const getBackendUrl = getWebUrl;
export const getFrontendPort = getWebPort;
export const getBackendPort = getWebPort;

// Type exports for TypeScript
export type ProjectConfig = typeof PROJECT_CONFIG;
export type ThemeName = (typeof PROJECT_CONFIG.themes.available)[number];
export type LocaleName = (typeof PROJECT_CONFIG.i18n.locales)[number];
export type EnvironmentType = "production" | "staging" | "develop" | "development";
```

#### **Step 14.2: Update Setup Project Script (scripts/setup-project.ts)**

**Replace the entire setup-project.ts file with web app configuration:**

```typescript
#!/usr/bin/env tsx
/**
 * Complete Project Setup Script for Web App
 * 
 * Run this script after cloning the template to fully setup your web application.
 * Usage: npx tsx scripts/setup-project.ts
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, cpSync } from "fs";
import { join } from "path";
import * as readline from "readline";
import { randomBytes } from "crypto";

interface ProjectAnswers {
  name: string;
  displayName: string;
  description: string;
  authorName: string;
  authorEmail: string;
  authorUrl: string;
  repositoryUrl: string;
  homepageUrl: string;
  namespace: string;
  
  // Database configuration
  dbName: string;
  dbUser: string;
  dbPassword: string;
  
  // Development configuration - Single port
  webPort: string;
  
  // Production configuration - Single domain
  productionWebUrl: string;
  
  // Staging configuration - Single domain
  stagingWebUrl: string;
  
  // Security
  authSecret: string;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function generateSecretKey(): string {
  return randomBytes(64).toString("hex");
}

async function collectProjectInfo(): Promise<ProjectAnswers> {
  console.log("🚀 Welcome to the V0 Boilerplate Web App Setup!\n");
  console.log("This script will configure your unified web application in one go.\n");

  // Project Information
  console.log("📋 PROJECT INFORMATION");
  const name = await question("Project name (kebab-case): ");
  const displayName = await question("Display name: ");
  const description = await question("Project description: ");
  
  // Author Information
  console.log("\n👤 AUTHOR INFORMATION");
  const authorName = await question("Author name: ");
  const authorEmail = await question("Author email: ");
  const authorUrl = await question("Author website (optional): ");
  
  // Repository Information
  console.log("\n🔗 REPOSITORY INFORMATION");
  const repositoryUrl = await question("Repository URL: ");
  const homepageUrl = await question("Homepage URL (optional): ");
  
  // Database Configuration
  console.log("\n🗄️  DATABASE CONFIGURATION");
  const dbName = await question(`Database name [${name}_db]: `) || `${name}_db`;
  const dbUser = await question(`Database user [${name}_user]: `) || `${name}_user`;
  const dbPassword = await question("Database password [auto-generated]: ") || randomBytes(16).toString("hex");
  
  // Development Configuration - Single port
  console.log("\n⚙️  DEVELOPMENT CONFIGURATION");
  const webPort = await question("Web app port [3000]: ") || "3000";
  
  // Production Configuration - Single domain
  console.log("\n🌐 PRODUCTION CONFIGURATION");
  const productionWebUrl = await question("Production web URL (e.g., https://myapp.com): ");
  
  // Staging Configuration - Single domain
  console.log("\n🟡 STAGING CONFIGURATION");
  const domain = productionWebUrl.replace("https://", "").split(".").slice(-2).join(".");
  const appName = productionWebUrl.replace("https://", "").split(".")[0];
  
  const stagingWebUrl = await question(`Staging web URL [https://${appName}-staging.${domain}]: `) || `https://${appName}-staging.${domain}`;
  
  // Security
  console.log("\n🔐 SECURITY CONFIGURATION");
  console.log("Generating secure authentication secret...");
  const authSecret = generateSecretKey();
  
  const namespace = `@${name}`;

  return {
    name,
    displayName,
    description,
    authorName,
    authorEmail,
    authorUrl,
    repositoryUrl,
    homepageUrl,
    namespace,
    dbName,
    dbUser,
    dbPassword,
    webPort,
    productionWebUrl,
    stagingWebUrl,
    authSecret,
  };
}

function updateProjectConfig(answers: ProjectAnswers) {
  const configPath = join(process.cwd(), "packages/config/project.config.ts");
  let config = readFileSync(configPath, "utf-8");

  // Update basic info
  config = config.replace(/name: ".*?"/, `name: "${answers.name}"`);
  config = config.replace(/displayName: ".*?"/, `displayName: "${answers.displayName}"`);
  config = config.replace(/description: ".*?"/, `description: "${answers.description}"`);

  // Update author info
  config = config.replace(/name: "Your Name"/, `name: "${answers.authorName}"`);
  config = config.replace(/email: "your-email@example.com"/, `email: "${answers.authorEmail}"`);
  config = config.replace(/url: "https:\/\/your-website.com"/, `url: "${answers.authorUrl}"`);

  // Update URLs
  config = config.replace(/repository: ".*?"/, `repository: "${answers.repositoryUrl}"`);
  config = config.replace(/homepage: ".*?"/, `homepage: "${answers.homepageUrl}"`);

  // Update production URLs - Single domain
  config = config.replace(/url: "https:\/\/boilerplate\.lumineau\.app"/, `url: "${answers.productionWebUrl}"`);

  // Update staging URLs - Single domain
  config = config.replace(/url: "https:\/\/boilerplate-staging\.lumineau\.app"/, `url: "${answers.stagingWebUrl}"`);

  // Update develop URL patterns - Single domain
  const domain = answers.productionWebUrl.replace("https://", "").split(".").slice(-2).join(".");
  const appName = answers.productionWebUrl.replace("https://", "").split(".")[0];
  
  config = config.replace(/urlPattern: "https:\/\/boilerplate-git-\{branch\}\.lumineau\.app"/, `urlPattern: "https://${appName}-git-{branch}.${domain}"`);

  // Update namespace
  config = config.replace(/namespace: "@boilerplate"/, `namespace: "${answers.namespace}"`);

  // Update development configuration - Single port
  config = config.replace(/port: 3000/, `port: ${answers.webPort}`);
  config = config.replace(/url: "http:\/\/localhost:3000"/, `url: "http://localhost:${answers.webPort}"`);

  // Update database configuration
  config = config.replace(/name: "auth_db"/, `name: "${answers.dbName}"`);
  config = config.replace(/user: "auth_user"/, `user: "${answers.dbUser}"`);
  config = config.replace(/password: "auth_password"/, `password: "${answers.dbPassword}"`);

  // Update Docker container name
  config = config.replace(/containerName: "v0-boilerplate-postgres"/, `containerName: "${answers.name}-postgres"`);

  writeFileSync(configPath, config);
  console.log("✅ Updated packages/config/project.config.ts");
}

function updatePackageJson(answers: ProjectAnswers) {
  const rootPackagePath = join(process.cwd(), "package.json");
  const rootPackage = JSON.parse(readFileSync(rootPackagePath, "utf-8"));
  
  rootPackage.name = `${answers.name}-monorepo`;
  rootPackage.description = answers.description;
  rootPackage.author = {
    name: answers.authorName,
    email: answers.authorEmail,
    url: answers.authorUrl,
  };
  rootPackage.repository = {
    type: "git",
    url: answers.repositoryUrl,
  };
  rootPackage.homepage = answers.homepageUrl;

  writeFileSync(rootPackagePath, JSON.stringify(rootPackage, null, 2));
  console.log("✅ Updated root package.json");

  // Update web app package.json
  const webPackagePath = join(process.cwd(), "apps/web/package.json");
  if (existsSync(webPackagePath)) {
    const webPackage = JSON.parse(readFileSync(webPackagePath, "utf-8"));
    webPackage.name = `${answers.namespace}/web`;
    webPackage.description = `${answers.displayName} - Web Application`;
    writeFileSync(webPackagePath, JSON.stringify(webPackage, null, 2));
    console.log("✅ Updated web app package.json");
  }
}

function updateDockerCompose(answers: ProjectAnswers) {
  const dockerComposePath = join(process.cwd(), "docker-compose.yml");
  let dockerCompose = readFileSync(dockerComposePath, "utf-8");

  // Update container name
  dockerCompose = dockerCompose.replace(/container_name: v0-boilerplate-postgres/, `container_name: ${answers.name}-postgres`);
  
  // Update database configuration
  dockerCompose = dockerCompose.replace(/POSTGRES_USER: auth_user/, `POSTGRES_USER: ${answers.dbUser}`);
  dockerCompose = dockerCompose.replace(/POSTGRES_PASSWORD: auth_password/, `POSTGRES_PASSWORD: ${answers.dbPassword}`);
  dockerCompose = dockerCompose.replace(/POSTGRES_DB: auth_db/, `POSTGRES_DB: ${answers.dbName}`);
  
  // Update health check
  dockerCompose = dockerCompose.replace(/pg_isready -U auth_user -d auth_db/, `pg_isready -U ${answers.dbUser} -d ${answers.dbName}`);
  
  // Update volume name
  dockerCompose = dockerCompose.replace(/name: v0-boilerplate-postgres-data/, `name: ${answers.name}-postgres-data`);
  
  // Update network name
  dockerCompose = dockerCompose.replace(/name: v0-boilerplate-network/g, `name: ${answers.name}-network`);
  dockerCompose = dockerCompose.replace(/- v0-boilerplate-network/, `- ${answers.name}-network`);
  dockerCompose = dockerCompose.replace(/v0-boilerplate-network:/, `${answers.name}-network:`);

  writeFileSync(dockerComposePath, dockerCompose);
  console.log("✅ Updated docker-compose.yml");
}

function createEnvironmentFiles(answers: ProjectAnswers) {
  // Create web app .env file
  const webEnvPath = join(process.cwd(), "apps/web/.env");
  const databaseUrl = `postgresql://${answers.dbUser}:${answers.dbPassword}@localhost:5432/${answers.dbName}`;
  
  const webEnvContent = `# Database Configuration
DATABASE_URL="${databaseUrl}"

# Authentication Configuration
BETTER_AUTH_SECRET="${answers.authSecret}"
BETTER_AUTH_URL="http://localhost:${answers.webPort}"

# Development Configuration (optional)
NODE_ENV="development"
DEBUG="1"
`;

  writeFileSync(webEnvPath, webEnvContent);
  console.log("✅ Created apps/web/.env");

  // Create .env.project file for Docker Compose
  const projectEnvPath = join(process.cwd(), ".env.project");
  const projectEnvContent = `# Project configuration environment variables
# This file is generated from project.config.ts by the setup script
# These variables are used by docker-compose.yml

PROJECT_NAME=${answers.name}
DB_NAME=${answers.dbName}
DB_USER=${answers.dbUser}
DB_PASSWORD=${answers.dbPassword}
DB_PORT=5432
`;

  writeFileSync(projectEnvPath, projectEnvContent);
  console.log("✅ Created .env.project for Docker Compose");

  // Update .env.example files
  const webEnvExamplePath = join(process.cwd(), "apps/web/.env.example");
  if (existsSync(webEnvExamplePath)) {
    const exampleContent = `# Database Configuration
DATABASE_URL="postgresql://${answers.dbUser}:${answers.dbPassword}@localhost:5432/${answers.dbName}"

# Authentication Configuration
BETTER_AUTH_SECRET="your-super-secret-key-here"
BETTER_AUTH_URL="http://localhost:${answers.webPort}"

# Development Configuration (optional)
NODE_ENV="development"
DEBUG="1"
`;
    writeFileSync(webEnvExamplePath, exampleContent);
    console.log("✅ Updated apps/web/.env.example");
  }
}

function updateMakefile(answers: ProjectAnswers) {
  const makefilePath = join(process.cwd(), "Makefile");
  let makefile = readFileSync(makefilePath, "utf-8");

  // Update title comment
  makefile = makefile.replace(/# V0 Boilerplate Makefile/, `# ${answers.displayName} Makefile`);

  // Update db:push filter - Single app
  makefile = makefile.replace(/pnpm --filter @boilerplate\/backend/, `pnpm --filter ${answers.namespace}/web`);

  writeFileSync(makefilePath, makefile);
  console.log("✅ Updated Makefile");
}

function updateManifestJson(answers: ProjectAnswers) {
  const manifestPath = join(process.cwd(), "apps/web/public/manifest.json");
  
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
    
    // Update app metadata
    manifest.name = answers.displayName;
    manifest.short_name = answers.name.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    manifest.description = answers.description;
    
    // Update start URL based on web URL
    if (answers.productionWebUrl) {
      manifest.start_url = new URL("/", answers.productionWebUrl).pathname;
    }
    
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log("✅ Updated PWA manifest.json");
  }
}

function updateSetupGuide(answers: ProjectAnswers) {
  const setupPath = join(process.cwd(), "SETUP.md");
  let setup = readFileSync(setupPath, "utf-8");

  // Update title and descriptions
  setup = setup.replace(/This guide will help you bootstrap a new project using this Next\.js 15 monorepo template with authentication\./, 
    `This guide will help you set up ${answers.displayName}.`);
  
  // Update git clone example
  setup = setup.replace(/git clone <your-repo-url> my-new-project/, 
    `git clone ${answers.repositoryUrl} ${answers.name}`);
  setup = setup.replace(/cd my-new-project/, `cd ${answers.name}`);

  // Update package filter examples - Single app
  setup = setup.replace(/pnpm --filter @boilerplate\/backend/g, `pnpm --filter ${answers.namespace}/web`);
  setup = setup.replace(/pnpm --filter @boilerplate\/frontend/g, `pnpm --filter ${answers.namespace}/web`);

  // Update port references - Single port
  setup = setup.replace(/localhost:3100/g, `localhost:${answers.webPort}`);
  setup = setup.replace(/localhost:3101/g, `localhost:${answers.webPort}`);
  setup = setup.replace(/port 3100/g, `port ${answers.webPort}`);
  setup = setup.replace(/port 3101/g, `port ${answers.webPort}`);

  // Update database configuration in setup guide
  setup = setup.replace(/postgresql:\/\/auth_user:auth_password@localhost:5432\/auth_db/, 
    `postgresql://${answers.dbUser}:${answers.dbPassword}@localhost:5432/${answers.dbName}`);

  writeFileSync(setupPath, setup);
  console.log("✅ Updated SETUP.md");
}

function updateVercelDeploymentGuide(answers: ProjectAnswers) {
  const deploymentGuidePath = join(process.cwd(), "docs/vercel-deployment.md");
  let guide = readFileSync(deploymentGuidePath, "utf-8");

  // Calculate derived values
  const domain = answers.productionWebUrl.replace("https://", "").split(".").slice(-2).join(".");
  const appName = answers.productionWebUrl.replace("https://", "").split(".")[0];
  const cookieDomain = `.${domain}`;

  // Simple placeholder replacements
  const replacements = {
    "{{PROJECT_DISPLAY_NAME}}": answers.displayName,
    "{{PROJECT_NAME}}": answers.name,
    "{{PROJECT_NAMESPACE}}": answers.namespace,
    "{{PRODUCTION_WEB_URL}}": answers.productionWebUrl,
    "{{STAGING_WEB_URL}}": answers.stagingWebUrl,
    "{{DEVELOP_WEB_URL_PATTERN}}": `https://${appName}-git-{branch-name}.${domain}`,
    "{{EXAMPLE_DEVELOP_WEB_URL}}": `https://${appName}-git-feature-user-auth.${domain}`,
    "{{CUSTOM_WEB_DOMAIN}}": `app.${domain}`,
    "{{COOKIE_DOMAIN}}": cookieDomain,
  };

  // Apply all replacements
  for (const [placeholder, value] of Object.entries(replacements)) {
    guide = guide.replace(new RegExp(placeholder, "g"), value);
  }

  writeFileSync(deploymentGuidePath, guide);
  console.log("✅ Updated docs/vercel-deployment.md with project-specific values");
}

function displaySummary(answers: ProjectAnswers) {
  console.log("\n📋 PROJECT CONFIGURATION SUMMARY");
  console.log("==================================");
  console.log(`Project Name: ${answers.displayName}`);
  console.log(`Package Namespace: ${answers.namespace}`);
  console.log(`Repository: ${answers.repositoryUrl}`);
  console.log(`Author: ${answers.authorName} <${answers.authorEmail}>`);
  console.log("");
  console.log("��️  DATABASE:");
  console.log(`  Name: ${answers.dbName}`);
  console.log(`  User: ${answers.dbUser}`);
  console.log(`  Password: ${answers.dbPassword}`);
  console.log("");
  console.log("🌐 DEVELOPMENT URLS:");
  console.log(`  Web App: http://localhost:${answers.webPort}`);
  console.log(`  API Health: http://localhost:${answers.webPort}/api/health`);
  console.log("");
  console.log("🌍 PRODUCTION URLS:");
  console.log(`  Web App: ${answers.productionWebUrl}`);
  console.log("");
  console.log("🟡 STAGING URLS:");
  console.log(`  Web App: ${answers.stagingWebUrl}`);
  console.log("");
  console.log("🔐 SECURITY:");
  console.log(`  Auth Secret: ${answers.authSecret.substring(0, 16)}... (64 chars)`);
}

async function main() {
  try {
    const answers = await collectProjectInfo();
    
    console.log("\n🔧 Configuring your web application...\n");
    
    updateProjectConfig(answers);
    updatePackageJson(answers);
    updateDockerCompose(answers);
    createEnvironmentFiles(answers);
    updateMakefile(answers);
    updateManifestJson(answers);
    updateSetupGuide(answers);
    updateVercelDeploymentGuide(answers);
    
    displaySummary(answers);
    
    console.log("\n🎉 Complete web app setup finished successfully!");
    console.log("\n🚀 NEXT STEPS:");
    console.log("1. Run `pnpm install` to install dependencies");
    console.log("2. Run `make db-up` to start the database");
    console.log("3. Run `make dev` to start the web application");
    console.log(`4. Open http://localhost:${answers.webPort} in your browser`);
    console.log("5. Create your first account and start building!");
    console.log("");
    console.log("💡 OPTIONAL:");
    console.log("- Delete this setup script: rm scripts/setup-project.ts");
    console.log("- Commit your initial configuration: git add . && git commit -m 'Initial web app setup'");
    console.log("");
    console.log("📚 For more details, check the updated SETUP.md file.");
    
  } catch (error) {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
```

#### **Step 14.3: Key Changes Summary**

**Project Configuration Changes:**
- ✅ **Single domain architecture**: Removed separate frontend/backend URLs
- ✅ **Unified port configuration**: Single development port (3000)
- ✅ **Simplified CORS**: No additional origins needed
- ✅ **Updated workspace paths**: Changed from `apps/*` to `apps/web`
- ✅ **Legacy compatibility**: Maintained old function names for migration

**Setup Script Changes:**
- ✅ **Single port input**: Only one port for web app
- ✅ **Single domain URLs**: Production and staging use same domain
- ✅ **Updated package names**: Changed from `@boilerplate/frontend` to `@boilerplate/web`
- ✅ **Simplified environment files**: Single .env file for web app
- ✅ **Updated documentation**: All references point to web app

**Migration Benefits:**
- ✅ **No CORS issues**: Same origin for frontend and API
- ✅ **Simplified deployment**: One Vercel project
- ✅ **Better performance**: No cross-origin requests
- ✅ **Shared authentication**: Cookies work seamlessly
- ✅ **Easier maintenance**: Single codebase to manage


### **Step 15: Update Documentation**

```markdown
# README.md (Updated)

## 🏗️ Architecture Overview

This is a **web Next.js application** that serves both frontend pages and API routes under a single domain.

### Project Structure
```
boilerplate/
├── apps/
│   └── web/           # Single Next.js app
│       ├── app/
│       │   ├── (web)/     # Frontend pages
│       │   ├── (auth)/    # Authentication pages
│       │   ├── (protected)/ # Protected pages
│       │   ├── api/       # API routes
│       │   ├── components/ # UI components
│       │   ├── lib/       # Utilities and libraries
│       │   └── layout.tsx
│       ├── prisma/        # Database schema
│       └── public/        # Static assets
├── packages/
│   ├── types/             # Shared TypeScript types
│   └── config/            # Shared configurations
└── package.json
```

### Key Benefits
- ✅ **Single domain**: `boilerplate.lumineau.app`
- ✅ **No CORS issues**: Same origin for frontend and API
- ✅ **Simplified deployment**: One Vercel project
- ✅ **Better performance**: No cross-origin requests
- ✅ **Shared authentication**: Cookies work seamlessly

### Development
```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### Deployment
The application is deployed as a single Vercel project with:
- Frontend pages at `/`
- API routes at `/api/*`
- Shared domain and CDN
```

### **Step 16: Update API Client Logic**

```typescript
// apps/web/app/lib/queries/auth.ts
import { getCurrentEnvironmentUrls } from '@boilerplate/config'

const { web } = getCurrentEnvironmentUrls()

// Update all API calls to use relative paths
export const authQueries = {
  login: async (credentials: LoginCredentials) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      credentials: 'include',
    })
    return response.json()
  },
  // ... other auth queries
}
```

### **Step 17: Update Middleware**

```typescript
// apps/web/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

const publicRoutes = ['/login', '/signup', '/debug']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow API routes to pass through
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Check if route is public
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Check authentication for protected routes
  const session = await getSessionCookie(request)
  
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json).*)',
  ],
}
```

### **Step 18: Update Vercel Deployment & Environment Variables**

### **Step 18.1: Environment Variables Management for Web App**

**The web app uses a simplified environment variable approach with automatic configuration:**

#### **🔑 Required Environment Variables (Set Once in Vercel)**

**Web App (Set Once, Works Everywhere):**
- `DATABASE_URL`: Your Neon database connection string 
  - ✅ **Same value for ALL environments** (Production/Staging/Development)
  - Neon automatically creates branch databases for non-production environments
  - **Required for database operations**

- `BETTER_AUTH_SECRET`: Better Auth signing secret (32+ characters)
  - ✅ **Same secret for ALL environments** - Used for token signing across all deployments
  - Generate once: `openssl rand -base64 32`
  - **Required for authentication to work**

#### **🤖 Automatic Environment Variables (Provided by Vercel)**

These are automatically available and used by `@packages/config/project.config.ts`:
- `VERCEL_ENV`: `'production'` | `'preview'` | `'development'`
- `VERCEL_GIT_COMMIT_REF`: Branch name (e.g., `'main'`, `'staging'`, `'feature/user-auth'`)
- `VERCEL_URL`: Deployment URL
- `NODE_ENV`: Environment type

#### **🌐 Environment URLs (Automatically Configured)**

All URLs are automatically configured based on your project setup:

**Production** (`main` branch):
- Web App: Your custom production domain (e.g., `boilerplate.lumineau.app`)

**Staging** (`staging` branch):
- Web App: Staging URL with `-staging` suffix (e.g., `boilerplate-staging.lumineau.app`)

**Development** (other branches):
- Web App: Branch-specific URL with `-git-{branch}` pattern (e.g., `boilerplate-git-feature-user-auth.lumineau.app`)

#### **�� Authentication Configuration (Simplified for Single Domain)**

**Cookie Configuration for Web App:**
```typescript
cookieOptions: {
  httpOnly: true,         // Prevents JavaScript access
  sameSite: "lax",        // Simplified for single domain
  secure: true,           // Required for HTTPS
  path: "/",              // Available on all paths
  // No domain needed - cookies work on same domain
}
```

**Key Authentication Features for Web App:**
- ✅ **No cross-subdomain complexity** - everything on same domain
- ✅ **Simplified cookie configuration** - no domain sharing needed
- ✅ **Secure cookie attributes** for production
- ✅ **No CORS issues** - same origin for frontend and API

#### **📋 Environment Variables Setup Checklist**

**Initial Setup:**
- [ ] `DATABASE_URL` configured in Vercel (same for all environments)
- [ ] `BETTER_AUTH_SECRET` generated and configured in Vercel
- [ ] Database provider supports branching (Neon recommended)
- [ ] Environment detection working in `@packages/config/project.config.ts`

**Multi-Environment Testing:**
- [ ] **Production**: Push to `main` branch and verify environment detection
- [ ] **Staging**: Push to `staging` branch and verify environment detection
- [ ] **Development**: Push to feature branch and verify environment detection
- [ ] All environments use correct URLs automatically
- [ ] Authentication works across all environments

**Security Verification:**
- [ ] `BETTER_AUTH_SECRET` is a secure random string (32+ characters)
- [ ] All URLs use HTTPS in production
- [ ] Database connection uses SSL
- [ ] Environment variables not exposed in client-side code
- [ ] No CORS configuration needed (same origin)

#### **🚀 Benefits of Web App Environment Management**

**Simplified Configuration:**
- ✅ **Single set of environment variables** for all environments
- ✅ **No CORS configuration** needed
- ✅ **No cross-subdomain cookie complexity**
- ✅ **Automatic environment detection** based on Git branches
- ✅ **Zero manual URL configuration** per environment

**Reduced Maintenance:**
- ✅ **One Vercel project** instead of two
- ✅ **Single deployment pipeline**
- ✅ **Unified environment variable management**
- ✅ **Simplified authentication setup**
- ✅ **No cross-origin request handling**

#### **🔧 Environment Variables in Development**

**Local Development (.env.local):**
```bash
# Database Configuration
DATABASE_URL="postgresql://auth_user:auth_password@localhost:5432/auth_db"

# Authentication Configuration
BETTER_AUTH_SECRET="your-development-secret-here"
BETTER_AUTH_URL="http://localhost:3000"

# Development Configuration
NODE_ENV="development"
DEBUG="1"
```

**Production/Staging (Vercel Environment Variables):**
```bash
# Database Configuration (same for all environments)
DATABASE_URL="postgresql://user:password@host:port/database"

# Authentication Configuration (same for all environments)
BETTER_AUTH_SECRET="your-production-secret-here"

# URLs are automatically configured by project.config.ts
# No manual URL configuration needed
```

#### **📊 Environment Variable Comparison**

| Aspect | Dual App (Frontend + Backend) | Web App (Unified) |
|--------|--------------------------------|-------------------|
| **Environment Variables** | 2 sets (frontend + backend) | 1 set (web app) |
| **CORS Configuration** | Required (cross-origin) | Not needed (same origin) |
| **Cookie Domain** | Cross-subdomain setup | Same domain (simplified) |
| **Deployment Projects** | 2 Vercel projects | 1 Vercel project |
| **URL Configuration** | Manual per environment | Automatic detection |
| **Authentication Setup** | Complex (cross-domain) | Simple (same domain) |
| **Maintenance Overhead** | High (2 projects) | Low (1 project) |



# Verify all functionality works

### **Step 18.2: Vercel Project Setup for Web App**

#### **1. Create Vercel Project**
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"New Project"**
3. Import your repository
4. Configure project settings:
   - **Project Name**: `{{PROJECT_NAME}}-web` (or your preferred name)
   - **Framework Preset**: `Next.js` (should auto-detect)
   - **Root Directory**: `apps/web` ⭐ **IMPORTANT**
   - **Build Command**: `pnpm build` (defined in vercel.json)
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install`

#### **2. Configure Environment Variables**
**Set these environment variables in Vercel Dashboard:**

**Required Variables (Set Once, Works Everywhere):**
- `DATABASE_URL`: Your Neon database connection string
- `BETTER_AUTH_SECRET`: Your Better Auth secret (32+ characters)

**No Additional Variables Needed:**
- ✅ **No CORS configuration** - same origin for frontend and API
- ✅ **No URL configuration** - automatically handled by `project.config.ts`
- ✅ **No cross-subdomain setup** - everything on same domain

#### **3. Set Custom Domain**
1. In Vercel Project settings, go to **Domains**
2. Add your custom domain: `boilerplate.lumineau.app`
3. Configure DNS records as instructed by Vercel
4. Enable HTTPS (automatic with Vercel)

#### **4. Database Setup**
**Recommended: Neon Database (Free Tier with Branching)**
1. Create a Neon database account
2. Create a new PostgreSQL database
3. Get the connection string
4. Add `DATABASE_URL` to Vercel environment variables
5. Neon automatically creates branch databases for staging/preview deployments

#### **5. Deploy and Verify**
1. Click **"Deploy"**
2. Wait for build to complete (migrations run automatically)
3. Verify deployment at your custom domain
4. Test API endpoints: `https://boilerplate.lumineau.app/api/health`
5. Test frontend pages: `https://boilerplate.lumineau.app`

#### **6. Multi-Environment Deployment**
**The web app automatically supports all environments:**

**Production** (`main` branch):
- Deploys to: `boilerplate.lumineau.app`
- Uses production database

**Staging** (`staging` branch):
- Deploys to: `boilerplate-staging.lumineau.app`
- Uses staging database branch

**Development** (feature branches):
- Deploys to: `boilerplate-git-{branch}.lumineau.app`
- Uses development database branch

#### **7. Environment Detection**
The `@packages/config/project.config.ts` automatically:
- ✅ **Detects deployment environment** using Vercel variables
- ✅ **Configures correct URLs** based on branch and environment
- ✅ **Handles database connections** for each environment
- ✅ **Manages authentication** across all environments

**No manual configuration needed!** 🎉


# Test deployment
# Deploy to Vercel
# Verify custom domain works
# Verify API routes work
# Verify authentication works
```

### **Step 20: Cleanup**

```bash
# Remove old app directories (after successful migration)
rm -rf apps/frontend
rm -rf apps/backend

# Update workspace configuration
# Remove old app references from package.json
```

---

## **🏗️ Best Practices for Web App Structure**

### **1. File Organization**
```
apps/web/app/
├── (web)/              # Public pages
├── (auth)/             # Authentication pages
├── (protected)/        # Protected pages
├── api/                # API routes
├── components/         # UI components
│   ├── ui/            # Base UI components
│   ├── auth/          # Auth-specific components
│   └── layout/        # Layout components
├── lib/               # Utilities and libraries
│   ├── auth.ts        # Authentication utilities
│   ├── prisma.ts      # Database client
│   └── utils.ts       # General utilities
├── hooks/             # Custom React hooks
├── types/             # TypeScript types
└── locales/           # Internationalization
```

### **2. API Route Organization**
```
apps/web/app/api/
├── auth/              # Authentication routes
├── health/            # Health check
├── notifications/     # Notification routes
└── route.ts           # Root API route
```

### **3. Import Paths**
- Use `@/` for app-level imports
- Use `@boilerplate/types` for shared types
- Use `@boilerplate/config` for shared configuration

### **4. Environment Variables**
- Keep sensitive data in `.env.local`
- Use `@boilerplate/config` for environment-specific URLs
- Ensure all variables are documented

### **5. Authentication Flow**
- Use `better-auth` for authentication
- Implement middleware for route protection
- Use cookies for session management

---

## **🚀 Deployment Instructions**

### **1. Vercel Setup (Web App)**
1. Create new Vercel project
2. Connect to web app directory
3. Set custom domain: `boilerplate.lumineau.app`
4. Configure environment variables
5. Deploy

### **2. Domain Configuration**
- Point `boilerplate.lumineau.app` to Vercel
- Configure DNS records
- Enable HTTPS

4. **✅ All pages load**: Frontend pages accessible
### **3. Environment Variables (Web App)**

**Simplified Environment Variable Management:**

#### **Required Variables (Set Once in Vercel):**
```bash
# Database Configuration (same for all environments)
DATABASE_URL="postgresql://user:password@host:port/database"

# Authentication Configuration (same for all environments)
BETTER_AUTH_SECRET="your-production-secret-here"
```

#### **Automatic Variables (Provided by Vercel):**
- `VERCEL_ENV`: Environment type (production/preview/development)
- `VERCEL_GIT_COMMIT_REF`: Branch name for environment detection
- `VERCEL_URL`: Deployment URL
- `NODE_ENV`: Environment type

#### **No Additional Configuration Needed:**
- ✅ **No CORS variables** - same origin for frontend and API
- ✅ **No URL variables** - automatically handled by `project.config.ts`
- ✅ **No cross-subdomain setup** - everything on same domain
- ✅ **No environment-specific secrets** - same values work everywhere

#### **Benefits of Web App Environment Management:**
- ✅ **Single set of variables** for all environments
- ✅ **Zero manual configuration** per environment
- ✅ **Automatic environment detection** based on Git branches
- ✅ **Simplified deployment** - one project, one configuration
- ✅ **Reduced maintenance** - no cross-origin complexity

5. **✅ API routes work**: Backend functionality intact
6. **✅ Database connection**: Prisma working
7. **✅ Build successful**: No compilation errors
8. **✅ Deployment working**: Vercel deployment successful

---

This comprehensive migration guide will transform your current dual-app structure into a web, single-domain application with improved performance, simplified deployment, and no CORS issues.
