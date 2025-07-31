import { createAuthClient } from "better-auth/react";
import { getBackendUrl } from "@boilerplate/config/project.config";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || getBackendUrl();

export const authClient = createAuthClient({
  baseURL: apiUrl,
  // Enable credentials for cross-origin requests
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