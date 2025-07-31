import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getBackendUrl } from "@/lib/project-config";
import { betterFetch } from "@better-fetch/fetch";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authenticate user once for all protected routes
  try {
    const { data: session } = await betterFetch("/api/auth/get-session", {
      baseURL: getBackendUrl(),
      headers: await headers(),
    });

    if (!session) {
      redirect("/login");
    }

    // Session is valid, render children
    return <>{children}</>;
  } catch (error) {
    // If there's an error getting the session, redirect to login
    redirect("/login");
  }
}