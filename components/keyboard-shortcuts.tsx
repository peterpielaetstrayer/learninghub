"use client"

import { useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Keyboard } from "lucide-react"

interface KeyboardShortcutsProps {
  onTabChange: (tab: string) => void
  onSearch: () => void
}

export function KeyboardShortcuts({ onTabChange, onSearch }: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      // Handle keyboard shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case "1":
            event.preventDefault()
            onTabChange("inbox")
            break
          case "2":
            event.preventDefault()
            onTabChange("srs-review")
            break
          case "3":
            event.preventDefault()
            onTabChange("projects")
            break
          case "k":
            event.preventDefault()
            onSearch()
            break
        }
      }

      // Handle single key shortcuts
      switch (event.key) {
        case "?":
          event.preventDefault()
          // Focus the keyboard shortcuts dialog trigger
          const shortcutsButton = document.querySelector('[aria-label="Keyboard shortcuts"]') as HTMLButtonElement
          shortcutsButton?.click()
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onTabChange, onSearch])

  const shortcuts = [
    { keys: ["Ctrl", "1"], description: "Go to Inbox" },
    { keys: ["Ctrl", "2"], description: "Go to SRS Review" },
    { keys: ["Ctrl", "3"], description: "Go to Projects" },
    { keys: ["Ctrl", "K"], description: "Focus search" },
    { keys: ["?"], description: "Show keyboard shortcuts" },
    { keys: ["Tab"], description: "Navigate between elements" },
    { keys: ["Enter"], description: "Activate focused element" },
    { keys: ["Space"], description: "Flip flashcard" },
    { keys: ["Esc"], description: "Close dialogs" },
  ]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 w-9 p-0 bg-transparent" aria-label="Keyboard shortcuts">
          <Keyboard className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Use these keyboard shortcuts to navigate the app more efficiently.
          </p>

          <div className="space-y-3">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{shortcut.description}</span>
                <div className="flex gap-1">
                  {shortcut.keys.map((key, keyIndex) => (
                    <Badge key={keyIndex} variant="outline" className="text-xs font-mono">
                      {key}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              <strong>Tip:</strong> Press{" "}
              <Badge variant="outline" className="text-xs font-mono mx-1">
                ?
              </Badge>{" "}
              anytime to view these shortcuts.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
