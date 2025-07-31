import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getBackendUrl } from "@/lib/project-config";
import { betterFetch } from "@better-fetch/fetch";
import { SettingsPanel } from "@/components/settings/settings-panel"

export default async function SettingsPage() {
  // Authenticate user on server-side
  try {
    const { data: session } = await betterFetch("/api/auth/get-session", {
      baseURL: getBackendUrl(),
      headers: await headers(),
    });

    if (!session) {
      redirect("/login");
    }

    return (
      <div className="container mx-auto max-w-3xl py-6">
        <h1 className="mb-6 text-2xl font-bold">Settings</h1>
        <SettingsPanel />
      </div>
    );
  } catch (error) {
    redirect("/login");
  }
}
