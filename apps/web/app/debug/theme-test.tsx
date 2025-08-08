"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { useThemeSettings } from "@/hooks/use-settings-store"
import { useSession } from "@/lib/auth-client"

export function ThemeTest() {
  const { theme, setTheme } = useTheme()
  const { colorTheme, setColorTheme } = useThemeSettings()
  const { data: session } = useSession()
  const [localStorageData, setLocalStorageData] = useState<any>({})

  const refreshLocalStorageData = () => {
    if (typeof window === 'undefined') return;
    
    const data = {
      colorTheme: localStorage.getItem("colorTheme"),
      themeMode: localStorage.getItem("themeMode"),
      language: localStorage.getItem("language"),
    }
    setLocalStorageData(data)
  }

  const clearLocalStorage = () => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem("colorTheme")
    localStorage.removeItem("themeMode")
    localStorage.removeItem("language")
    refreshLocalStorageData()
  }

  useEffect(() => {
    refreshLocalStorageData()
    
    // Check if Inter font is loaded
    if (typeof document !== 'undefined') {
      const checkFont = () => {
        const testElement = document.createElement('span')
        testElement.style.fontFamily = 'Inter'
        testElement.style.fontSize = '72px'
        testElement.style.position = 'absolute'
        testElement.style.visibility = 'hidden'
        testElement.textContent = 'BESbswy'
        document.body.appendChild(testElement)
        
        const width = testElement.offsetWidth
        document.body.removeChild(testElement)
        
        console.log('Font loading test:', {
          fontFamily: 'Inter',
          width,
          isLoaded: width > 0
        })
      }
      
      // Check after a short delay to allow fonts to load
      setTimeout(checkFont, 1000)
    }
  }, [])

  const handleThemeChange = (newTheme: string) => {
    console.log("Changing theme to:", newTheme)
    setTheme(newTheme)
  }

  const handleColorThemeChange = (newColorTheme: string) => {
    console.log("Changing color theme to:", newColorTheme)
    setColorTheme(newColorTheme as any)
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Theme Debug</h1>
      
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Current State:</h2>
        <p>Authentication: {session?.user ? `Authenticated (${session.user.email})` : 'Not authenticated'}</p>
        <p>Next-themes theme: {theme}</p>
        <p>Color theme: {colorTheme}</p>
        <p>Document classes: {typeof window !== 'undefined' ? document.documentElement.className : 'N/A'}</p>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Font Test:</h2>
        <div className="space-y-1">
          <p className="font-light">Light weight (300): The quick brown fox jumps over the lazy dog</p>
          <p className="font-normal">Normal weight (400): The quick brown fox jumps over the lazy dog</p>
          <p className="font-medium">Medium weight (500): The quick brown fox jumps over the lazy dog</p>
          <p className="font-semibold">Semibold weight (600): The quick brown fox jumps over the lazy dog</p>
          <p className="font-bold">Bold weight (700): The quick brown fox jumps over the lazy dog</p>
          <p className="font-extrabold">Extrabold weight (800): The quick brown fox jumps over the lazy dog</p>
          <p className="font-black">Black weight (900): The quick brown fox jumps over the lazy dog</p>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">localStorage:</h2>
        <div className="flex gap-2 mb-2">
          <button 
            onClick={refreshLocalStorageData}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            Refresh
          </button>
          <button 
            onClick={clearLocalStorage}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm"
          >
            Clear
          </button>
        </div>
        <pre className="bg-gray-100 p-2 rounded text-sm">
          {JSON.stringify(localStorageData, null, 2)}
        </pre>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Test Controls:</h2>
        
        <div>
          <h3>Theme Mode:</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => handleThemeChange("light")}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Light
            </button>
            <button 
              onClick={() => handleThemeChange("dark")}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Dark
            </button>
            <button 
              onClick={() => handleThemeChange("system")}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              System
            </button>
          </div>
        </div>

        <div>
          <h3>Color Theme:</h3>
          <div className="flex gap-2 flex-wrap">
            {["default", "red", "orange", "green", "blue", "teal", "purple", "pink"].map((color) => (
              <button 
                key={color}
                onClick={() => handleColorThemeChange(color)}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 