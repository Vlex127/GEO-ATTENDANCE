"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { account } from "@/lib/appwrite"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const currentUser = await account.get()
      setUser(currentUser)
    } catch (error) {
      // User is not authenticated, redirect to login
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await account.deleteSession("current")
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/lasu.png" alt="LASU" className="h-8 w-8" />
            <h1 className="text-xl font-bold">LASU AMS - GEO ATTENDANCE</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Welcome, {user.name || user.email}
            </span>
            <ThemeToggle />
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Attendance Dashboard</h2>
          <p className="text-muted-foreground">
            Track your attendance with location-based check-in/out system
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="bg-card text-card-foreground rounded-lg border p-6">
            <h3 className="font-semibold mb-2">Today's Status</h3>
            <p className="text-2xl font-bold text-green-600 mb-2">Checked Out</p>
            <p className="text-sm text-muted-foreground">Ready to check in</p>
          </div>
          <div className="bg-card text-card-foreground rounded-lg border p-6">
            <h3 className="font-semibold mb-2">This Week</h3>
            <p className="text-2xl font-bold mb-2">4/5 Days</p>
            <p className="text-sm text-muted-foreground">80% Attendance</p>
          </div>
          <div className="bg-card text-card-foreground rounded-lg border p-6">
            <h3 className="font-semibold mb-2">Total Hours</h3>
            <p className="text-2xl font-bold mb-2">32.5 hrs</p>
            <p className="text-sm text-muted-foreground">This week</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Quick Actions</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Button size="lg" className="h-20 flex-col gap-2">
              <span className="text-lg">📍 Check In</span>
              <span className="text-sm opacity-75">Mark your arrival at the location</span>
            </Button>
            <Button size="lg" variant="outline" className="h-20 flex-col gap-2">
              <span className="text-lg">📤 Check Out</span>
              <span className="text-sm opacity-75">Mark your departure from the location</span>
            </Button>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 px-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Checked Out</p>
                <p className="text-sm text-muted-foreground">Yesterday at 5:30 PM</p>
              </div>
              <span className="text-green-600">✓</span>
            </div>
            <div className="flex justify-between items-center py-2 px-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Checked In</p>
                <p className="text-sm text-muted-foreground">Yesterday at 9:00 AM</p>
              </div>
              <span className="text-green-600">✓</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
