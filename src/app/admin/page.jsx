"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { account } from "@/lib/appwrite"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserManagementPanel } from "@/components/user-management-panel"
import { authStatsService } from "@/lib/auth-stats"

export default function AdminPage() {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userProfiles, setUserProfiles] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalAdmins: 0,
    note: ""
  })
  const router = useRouter()

  useEffect(() => {
    checkAdminAuth()
  }, [])

  const checkAdminAuth = async () => {
    try {
      const currentUser = await account.get()
      const isUserAdmin = currentUser.labels && currentUser.labels.includes('admin')
      
      if (!isUserAdmin) {
        router.push("/home")
        return
      }
      
      setUser(currentUser)
      setIsAdmin(true)
      loadAdminData()
    } catch (error) {
      console.error("Auth error:", error)
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }

  const loadAdminData = async () => {
    try {
      // Load stats
      const authStats = await authStatsService.getStats()
      setStats(authStats)
      
    } catch (error) {
      console.error("Error loading admin data:", error)
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center p-6 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            You don't have permission to access the admin dashboard.
          </p>
          <Button onClick={() => router.push('/home')}>
            Return to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {user?.name || user?.email}
            </span>
            <ThemeToggle />
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Users</h3>
            <p className="mt-2 text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {stats.totalUsers || 0}
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Active Users</h3>
            <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.activeUsers || 0}
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Admin Users</h3>
            <p className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">
              {stats.totalAdmins || 0}
            </p>
          </Card>
        </div>

        {/* User Management Section */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">User Management</h2>
          </div>
          <UserManagementPanel />
        </div>
      </main>
    </div>
  )
}
