import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { getWebUrl } from "@boilerplate/config/project.config";

// Determine if we're in production (simplified for single domain)
const isProduction = process.env.NODE_ENV === 'production' || 
                    process.env.VERCEL_ENV === 'production';

// Get web app URL from project config (dynamic environment detection)
const webUrl = getWebUrl();

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


export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: webUrl,
  trustedOrigins: [
    webUrl,
    // Support wildcard for subdomains in production
    ...(isProduction && getRootDomain(webUrl) ? [`*.${getRootDomain(webUrl)}`] : [])
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
    // Simplified cookie configuration for single domain web app
    defaultCookieAttributes: {
      sameSite: "lax", // Simplified for same domain
      secure: isProduction,
      httpOnly: true,
      path: "/",
    }
  },
  // Add the nextCookies plugin - MUST be last in the plugins array
  plugins: [nextCookies()],
});

export type Auth = typeof auth;