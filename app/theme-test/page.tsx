"use client"

import { useSettings } from "@/hooks/use-settings"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ThemeTestPage() {
  const { t, colorTheme, theme } = useSettings()

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Theme Test Page</h1>
        <p className="text-muted-foreground">
          This page demonstrates how the selected color theme ({colorTheme}) appears in {theme} mode.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Card Component</CardTitle>
            <CardDescription>Testing how card components look with the current theme</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is a card component with the current theme applied.</p>
            <div className="h-4"></div>
            <div className="space-y-2">
              <div className="bg-primary p-2 text-primary-foreground rounded">Primary</div>
              <div className="bg-secondary p-2 text-secondary-foreground rounded">Secondary</div>
              <div className="bg-accent p-2 text-accent-foreground rounded">Accent</div>
              <div className="bg-muted p-2 text-muted-foreground rounded">Muted</div>
              <div className="bg-destructive p-2 text-destructive-foreground rounded">Destructive</div>
            </div>
          </CardContent>
          <CardFooter>
            <Button>Primary Button</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>Testing how form elements look with the current theme</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Enter your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Submit</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="buttons" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
        </TabsList>
        <TabsContent value="buttons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
              <CardDescription>Different button variants with the current theme</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive">Destructive</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="typography">
          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
              <CardDescription>Text elements with the current theme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h1 className="text-4xl font-bold">Heading 1</h1>
              <h2 className="text-3xl font-bold">Heading 2</h2>
              <h3 className="text-2xl font-bold">Heading 3</h3>
              <h4 className="text-xl font-bold">Heading 4</h4>
              <p className="text-base">Regular paragraph text</p>
              <p className="text-sm text-muted-foreground">Muted small text</p>
              <a href="#" className="text-primary hover:underline">
                Link text
              </a>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="colors">
          <Card>
            <CardHeader>
              <CardTitle>Color Palette</CardTitle>
              <CardDescription>Color swatches for the current theme</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <div className="h-16 w-full rounded-md bg-background border"></div>
                  <div className="text-xs">Background</div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-16 w-full rounded-md bg-foreground"></div>
                  <div className="text-xs">Foreground</div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-16 w-full rounded-md bg-card border"></div>
                  <div className="text-xs">Card</div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-16 w-full rounded-md bg-card-foreground"></div>
                  <div className="text-xs">Card Foreground</div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-16 w-full rounded-md bg-primary"></div>
                  <div className="text-xs">Primary</div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-16 w-full rounded-md bg-primary-foreground"></div>
                  <div className="text-xs">Primary Foreground</div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-16 w-full rounded-md bg-secondary"></div>
                  <div className="text-xs">Secondary</div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-16 w-full rounded-md bg-secondary-foreground"></div>
                  <div className="text-xs">Secondary Foreground</div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-16 w-full rounded-md bg-muted"></div>
                  <div className="text-xs">Muted</div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-16 w-full rounded-md bg-muted-foreground"></div>
                  <div className="text-xs">Muted Foreground</div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-16 w-full rounded-md bg-accent"></div>
                  <div className="text-xs">Accent</div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-16 w-full rounded-md bg-accent-foreground"></div>
                  <div className="text-xs">Accent Foreground</div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-16 w-full rounded-md bg-destructive"></div>
                  <div className="text-xs">Destructive</div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-16 w-full rounded-md bg-destructive-foreground"></div>
                  <div className="text-xs">Destructive Foreground</div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-16 w-full rounded-md bg-border"></div>
                  <div className="text-xs">Border</div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-16 w-full rounded-md bg-input"></div>
                  <div className="text-xs">Input</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
