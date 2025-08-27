"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
})

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light")
  const [mounted, setMounted] = useState(false)

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      setTheme(systemTheme)
    }
    
    setMounted(true)
  }, [])

  // Apply theme to document
  useEffect(() => {
    if (mounted) {
      const root = document.documentElement
      root.classList.remove("light", "dark")
      root.classList.add(theme)
      localStorage.setItem("theme", theme)
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === "light" ? "dark" : "light")
  }

  const handleSetTheme = (newTheme) => {
    setTheme(newTheme)
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return <div className="opacity-0">{children}</div>
  }

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      setTheme: handleSetTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
