"use client"

import { useLanguage } from "@/hooks/use-language"

export default function Page() {
  const { t } = useLanguage()

  return (
    <div>
      <h1>{t("wip")}</h1>
    </div>
  )
}
