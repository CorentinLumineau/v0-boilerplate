import { createAuthClient } from "better-auth/react";

// For single web app, API and frontend are on the same domain
// Use the current window location for branch deployments to ensure same-origin requests
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use current origin (handles all branch deployments)
    return window.location.origin;
  }
  // Server-side: use VERCEL_URL if available (for SSR during build)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Fallback to localhost for development
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
};

export const authClient = createAuthClient({
  baseURL: getApiUrl(),
  // Simplified credentials for same-origin requests
  fetchOptions: {
    credentials: 'include',
  },
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;