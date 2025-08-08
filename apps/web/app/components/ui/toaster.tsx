"use client"

import { useToast } from "@/hooks/use-toast"
import { Toaster as UIToaster } from "@boilerplate/ui"

export function Toaster() {
  const { toasts } = useToast()

  return <UIToaster toasts={toasts} />
}
