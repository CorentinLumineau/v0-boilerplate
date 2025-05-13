"use client"

// Update import to use the consolidated file
import { useLanguageSettings } from "@/hooks/use-settings-store"

export default function Page() {
  const { t } = useLanguageSettings()

  return (
    <div>
      <h1>{t("wip")}</h1>
    </div>
  )
}
