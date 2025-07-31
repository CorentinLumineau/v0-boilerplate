import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { getFrontendUrl, getBackendUrl } from "@boilerplate/config/project.config";

// Determine if we're in production (more robust detection)
const isProduction = process.env.NODE_ENV === 'production' || 
                    process.env.VERCEL_ENV === 'production' ||
                    (process.env.BETTER_AUTH_BASE_URL && process.env.BETTER_AUTH_BASE_URL.includes('https://'));

// Get URLs from project config with environment variable overrides
const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || getFrontendUrl();
const backendUrl = process.env.BETTER_AUTH_BASE_URL || getBackendUrl();

// Extract the root domain for cross-subdomain cookies (e.g., lumineau.app from boilerplate.lumineau.app)
const getRootDomain = (url: string) => {
  try {
    const hostname = new URL(url).hostname;
    // For localhost, return undefined
    if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
      return undefined;
    }
    
    // For production domains, extract the root domain
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      // Return the root domain without the leading dot (better-auth handles this)
      return parts.slice(-2).join('.');
    }
    
    return undefined;
  } catch {
    return undefined;
  }
};

// Log configuration in development
if (process.env.NODE_ENV !== 'production') {
  console.log('Auth Configuration:', {
    isProduction,
    frontendUrl,
    backendUrl,
    rootDomain: getRootDomain(frontendUrl),
  });
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: backendUrl,
  trustedOrigins: [
    frontendUrl,
    // Support wildcard for subdomains in production
    ...(isProduction && getRootDomain(frontendUrl) ? [`*.${getRootDomain(frontendUrl)}`] : [])
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
  },
  socialProviders: {
    github: process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET ? {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    } : undefined,
    google: process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    } : undefined,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    updateAge: 60 * 60 * 24, // 1 day in seconds
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  advanced: {
    // Use better-auth's built-in cross-subdomain cookie support
    ...(isProduction && getRootDomain(frontendUrl) ? {
      crossSubDomainCookies: {
        enabled: true,
        domain: getRootDomain(frontendUrl), // e.g., "lumineau.app"
      }
    } : {}),
    // Default cookie attributes
    defaultCookieAttributes: {
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction ? true : false,
      httpOnly: true,
      path: "/",
    }
  },
});

export type Auth = typeof auth;