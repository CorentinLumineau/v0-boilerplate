"use client"

import { useSettings } from "@/hooks/use-settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Moon, Sun } from "lucide-react"

export function ThemeTestPreview() {
  const { t, colorTheme, theme } = useSettings()

  return (
    <div className="space-y-6 mt-6 border-t pt-6">
      <div>
        <h3 className="text-lg font-medium mb-2">{t("themePreview")}</h3>
        <p className="text-sm text-muted-foreground mb-4">{t("themePreviewDescription")}</p>
      </div>

      <div className="rounded-lg border p-4 bg-background">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-medium">{t("currentTheme")}</h4>
            <p className="text-xs text-muted-foreground">
              {theme === "dark" ? (
                <Moon className="inline-block mr-1 h-3 w-3" />
              ) : (
                <Sun className="inline-block mr-1 h-3 w-3" />
              )}
              {t("theme")}: <span className="font-medium">{theme}</span> | {t("colorTheme")}:{" "}
              <span className="font-medium capitalize">{colorTheme}</span>
            </p>
          </div>
        </div>

        <Tabs defaultValue="components" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-8">
            <TabsTrigger value="components" className="text-xs">
              {t("components")}
            </TabsTrigger>
            <TabsTrigger value="colors" className="text-xs">
              {t("colors")}
            </TabsTrigger>
            <TabsTrigger value="blending" className="text-xs">
              {t("blending")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="components" className="space-y-4 mt-2">
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Button size="sm" className="w-full">
                  {t("button")}
                </Button>
                <Button size="sm" variant="secondary" className="w-full">
                  {t("secondary")}
                </Button>
                <Button size="sm" variant="outline" className="w-full">
                  {t("outline")}
                </Button>
                <Button size="sm" variant="destructive" className="w-full">
                  {t("destructive")}
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs">
                  {t("input")}
                </Label>
                <Input id="name" placeholder={t("placeholder")} className="h-8 text-xs" />
                <div className="bg-card p-2 rounded-md border text-xs">
                  <p className="font-medium">{t("card")}</p>
                  <p className="text-card-foreground text-xs">{t("cardText")}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="colors" className="mt-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <div className="h-8 w-full rounded-md bg-background border"></div>
                <div className="text-xs">Background</div>
              </div>
              <div className="space-y-1.5">
                <div className="h-8 w-full rounded-md bg-foreground"></div>
                <div className="text-xs">Foreground</div>
              </div>
              <div className="space-y-1.5">
                <div className="h-8 w-full rounded-md bg-card border"></div>
                <div className="text-xs">Card</div>
              </div>
              <div className="space-y-1.5">
                <div className="h-8 w-full rounded-md bg-card-foreground"></div>
                <div className="text-xs">Card Foreground</div>
              </div>
              <div className="space-y-1.5">
                <div className="h-8 w-full rounded-md bg-primary"></div>
                <div className="text-xs">Primary</div>
              </div>
              <div className="space-y-1.5">
                <div className="h-8 w-full rounded-md bg-secondary"></div>
                <div className="text-xs">Secondary</div>
              </div>
              <div className="space-y-1.5">
                <div className="h-8 w-full rounded-md bg-muted"></div>
                <div className="text-xs">Muted</div>
              </div>
              <div className="space-y-1.5">
                <div className="h-8 w-full rounded-md bg-accent"></div>
                <div className="text-xs">Accent</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="blending" className="mt-2">
            <div className="space-y-3">
              <div className="p-3 bg-background rounded-md border">
                <p className="font-medium text-xs">{t("backgroundBlending")}</p>
                <p className="text-xs text-muted-foreground">{t("blendingDescription", { color: colorTheme })}</p>
              </div>

              <div className="p-3 bg-card rounded-md border">
                <p className="font-medium text-xs">{t("cardBlending")}</p>
                <p className="text-xs text-muted-foreground">{t("cardBlendingDescription", { color: colorTheme })}</p>
              </div>

              <div className="p-3 bg-secondary rounded-md border">
                <p className="font-medium text-xs text-secondary-foreground">{t("secondaryBlending")}</p>
                <p className="text-xs text-secondary-foreground opacity-70">
                  {t("secondaryBlendingDescription", { color: colorTheme })}
                </p>
              </div>

              <div className="p-3 bg-muted rounded-md border">
                <p className="font-medium text-xs text-muted-foreground">{t("mutedBlending")}</p>
                <p className="text-xs text-muted-foreground">{t("mutedBlendingDescription", { color: colorTheme })}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
