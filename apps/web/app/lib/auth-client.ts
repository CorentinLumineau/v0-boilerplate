import { createAuthClient } from "better-auth/react";
import { getWebUrl } from "@boilerplate/config/project.config";

// For single web app, API and frontend are on the same domain
const apiUrl = getWebUrl();

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