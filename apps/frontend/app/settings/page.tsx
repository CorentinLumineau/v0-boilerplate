import { SettingsPanel } from "@/components/settings/settings-panel"

export default function SettingsPage() {
  return (
    <div className="container mx-auto max-w-3xl py-6">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>
      <SettingsPanel />
    </div>
  )
}
