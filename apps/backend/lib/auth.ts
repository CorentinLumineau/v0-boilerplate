import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

// Determine if we're in production (more robust detection)
const isProduction = process.env.NODE_ENV === 'production' || 
                    process.env.VERCEL_ENV === 'production' ||
                    (process.env.BETTER_AUTH_BASE_URL && process.env.BETTER_AUTH_BASE_URL.includes('https://'));

// Get the frontend URL for cookie configuration
const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3100";
const backendUrl = process.env.BETTER_AUTH_BASE_URL || "http://localhost:3101";
const frontendDomain = new URL(frontendUrl).hostname;

// Extract the root domain for cookie sharing (e.g., lumineau.app from boilerplate.lumineau.app)
const getRootDomain = (hostname: string) => {
  // For localhost, don't set domain
  if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
    return undefined;
  }
  
  // For production domains, extract the root domain
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    // Return the last two parts (e.g., lumineau.app)
    return `.${parts.slice(-2).join('.')}`;
  }
  
  return undefined;
};

// Log configuration in development
if (process.env.NODE_ENV !== 'production') {
  console.log('Auth Configuration:', {
    isProduction,
    frontendUrl,
    backendUrl,
    frontendDomain,
    cookieDomain: getRootDomain(frontendDomain),
  });
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_BASE_URL,
  trustedOrigins: [frontendUrl],
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
  // Global cookie options that apply to ALL cookies
  cookies: {
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    httpOnly: true,
    path: "/",
    // Set domain for cookie sharing across subdomains in production
    ...(isProduction && getRootDomain(frontendDomain) ? {
      domain: getRootDomain(frontendDomain)
    } : {})
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    updateAge: 60 * 60 * 24, // 1 day in seconds
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
});

export type Auth = typeof auth;