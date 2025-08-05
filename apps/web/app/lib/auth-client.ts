import { createAuthClient } from "better-auth/react";
import { getWebUrl } from "@boilerplate/config/project.config";

// For web app, we use the same domain for both frontend and API
const apiUrl = process.env.NEXT_PUBLIC_API_URL || getWebUrl();

export const authClient = createAuthClient({
  baseURL: apiUrl,
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