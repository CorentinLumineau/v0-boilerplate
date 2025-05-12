"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/hooks/use-language"

export default function Home() {
  const { t } = useLanguage()

  return (
    <div className="flex h-full items-center justify-center">
      <Card className="max-w-2xl shadow-md">
        <CardContent className="flex min-h-28 items-center justify-center p-6 text-center">
          <p className="text-lg font-medium">{t("wip")}</p>
        </CardContent>
      </Card>
    </div>
  )
}
