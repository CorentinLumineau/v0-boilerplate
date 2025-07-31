import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getBackendUrl } from "@/lib/project-config";
import { betterFetch } from "@better-fetch/fetch";

// Server component with authentication
export default async function Page() {
  // Get session using better-auth server-side API
  try {
    const { data: session } = await betterFetch("/api/auth/get-session", {
      baseURL: getBackendUrl(),
      headers: await headers(),
    });

    if (!session) {
      redirect("/login");
    }

    return (
      <div>
        <h1>Welcome {session.user.name || session.user.email}</h1>
        <p>You are successfully authenticated!</p>
      </div>
    );
  } catch (error) {
    // If there's an error getting the session, redirect to login
    redirect("/login");
  }
}
