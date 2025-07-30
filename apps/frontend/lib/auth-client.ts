import { createAuthClient } from "better-auth/react";
import { getBackendUrl } from "./project-config";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || getBackendUrl();

export const authClient = createAuthClient({
  baseURL: apiUrl,
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;