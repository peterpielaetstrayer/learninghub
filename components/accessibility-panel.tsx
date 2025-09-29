"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings, Type, Zap, Volume2, Eye } from "lucide-react"

interface AccessibilitySettings {
  fontSize: number
  reducedMotion: boolean
  highContrast: boolean
  soundEnabled: boolean
  focusIndicators: boolean
  autoRead: boolean
}

export function AccessibilityPanel() {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 16,
    reducedMotion: false,
    highContrast: false,
    soundEnabled: true,
    focusIndicators: true,
    autoRead: false,
  })

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem("accessibility-settings")
    if (saved) {
      setSettings(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    // Apply settings to document
    const root = document.documentElement

    // Font size
    root.style.setProperty("--base-font-size", `${settings.fontSize}px`)

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add("reduce-motion")
    } else {
      root.classList.remove("reduce-motion")
    }

    // High contrast
    if (settings.highContrast) {
      root.classList.add("high-contrast")
    } else {
      root.classList.remove("high-contrast")
    }

    // Enhanced focus indicators
    if (settings.focusIndicators) {
      root.classList.add("enhanced-focus")
    } else {
      root.classList.remove("enhanced-focus")
    }

    // Save to localStorage
    localStorage.setItem("accessibility-settings", JSON.stringify(settings))
  }, [settings])

  const updateSetting = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 w-9 p-0 bg-transparent" aria-label="Accessibility settings">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Accessibility Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Font Size */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Type className="h-4 w-4" />
                Text Size
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="font-size">Font Size: {settings.fontSize}px</Label>
                <Slider
                  id="font-size"
                  min={14}
                  max={24}
                  step={1}
                  value={[settings.fontSize]}
                  onValueChange={([value]) => updateSetting("fontSize", value)}
                  className="w-full"
                  aria-label="Adjust font size"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Larger text improves readability for users with dyslexia or visual impairments.
              </p>
            </CardContent>
          </Card>

          {/* Motion & Animation */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Motion & Animation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="reduced-motion">Reduce Motion</Label>
                  <p className="text-xs text-muted-foreground">Minimizes animations and transitions</p>
                </div>
                <Switch
                  id="reduced-motion"
                  checked={settings.reducedMotion}
                  onCheckedChange={(checked) => updateSetting("reducedMotion", checked)}
                  aria-label="Toggle reduced motion"
                />
              </div>
            </CardContent>
          </Card>

          {/* Visual Enhancements */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Visual Enhancements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="high-contrast">High Contrast Mode</Label>
                  <p className="text-xs text-muted-foreground">Maximum contrast for better visibility</p>
                </div>
                <Switch
                  id="high-contrast"
                  checked={settings.highContrast}
                  onCheckedChange={(checked) => updateSetting("highContrast", checked)}
                  aria-label="Toggle high contrast mode"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="focus-indicators">Enhanced Focus</Label>
                  <p className="text-xs text-muted-foreground">Stronger focus indicators for keyboard navigation</p>
                </div>
                <Switch
                  id="focus-indicators"
                  checked={settings.focusIndicators}
                  onCheckedChange={(checked) => updateSetting("focusIndicators", checked)}
                  aria-label="Toggle enhanced focus indicators"
                />
              </div>
            </CardContent>
          </Card>

          {/* Audio Features */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Audio Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="sound-enabled">Sound Effects</Label>
                  <p className="text-xs text-muted-foreground">Audio feedback for interactions</p>
                </div>
                <Switch
                  id="sound-enabled"
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => updateSetting("soundEnabled", checked)}
                  aria-label="Toggle sound effects"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto-read">Auto-Read Content</Label>
                  <p className="text-xs text-muted-foreground">Automatically read flashcard content</p>
                </div>
                <Switch
                  id="auto-read"
                  checked={settings.autoRead}
                  onCheckedChange={(checked) => updateSetting("autoRead", checked)}
                  aria-label="Toggle auto-read content"
                />
              </div>
            </CardContent>
          </Card>

          {/* Reset Button */}
          <Button
            variant="outline"
            onClick={() =>
              setSettings({
                fontSize: 16,
                reducedMotion: false,
                highContrast: false,
                soundEnabled: true,
                focusIndicators: true,
                autoRead: false,
              })
            }
            className="w-full"
          >
            Reset to Defaults
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
