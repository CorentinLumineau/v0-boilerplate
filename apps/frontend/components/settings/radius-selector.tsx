"use client"

import { useSettings } from "@/hooks/use-settings"
import { cn } from "@/lib/utils"

const radiusValues = [
  { value: "0", label: "0" },
  { value: "0.3", label: "0.3" },
  { value: "0.5", label: "0.5" },
  { value: "0.75", label: "0.75" },
  { value: "1.0", label: "1.0" },
]

export function RadiusSelector() {
  const { radiusValue, setRadiusValue } = useSettings()

  return (
    <div className="flex flex-wrap gap-2">
      {radiusValues.map((radius) => (
        <button
          key={radius.value}
          className={cn(
            "flex h-9 min-w-[40px] items-center justify-center rounded-md border px-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            radiusValue === radius.value
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input bg-background hover:bg-accent hover:text-accent-foreground",
          )}
          onClick={() => setRadiusValue(radius.value as any)}
        >
          {radius.label}
        </button>
      ))}
    </div>
  )
}
