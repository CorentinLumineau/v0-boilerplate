"use client"

import { useSettings } from "@/hooks/use-settings"

export default function Page() {
  const { t } = useSettings()

  return (
    <div>
      <h1>{t("wip")}</h1>
    </div>
  )
}
