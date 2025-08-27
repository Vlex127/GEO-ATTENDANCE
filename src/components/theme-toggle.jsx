"use client"

import { useTheme } from "@/contexts/theme-context"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className="w-9 h-9"
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  )
}

export function ThemeToggleWithText() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="outline"
      onClick={toggleTheme}
      className="flex items-center gap-2"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <>
          <Moon className="h-4 w-4" />
          <span>Dark Mode</span>
        </>
      ) : (
        <>
          <Sun className="h-4 w-4" />
          <span>Light Mode</span>
        </>
      )}
    </Button>
  )
}
