import { headers } from "next/headers";
import { getBackendUrl } from "@/lib/project-config";
import { betterFetch } from "@better-fetch/fetch";

// No authentication needed here - handled by layout
export default async function HomePage() {
  // Get session data for display (already authenticated by layout)
  const { data: session } = await betterFetch("/api/auth/get-session", {
    baseURL: getBackendUrl(),
    headers: await headers(),
  });

  return (
    <div>
      <h1>Welcome {session?.user?.name || session?.user?.email || "User"}</h1>
      <p>You are successfully authenticated!</p>
    </div>
  );
}