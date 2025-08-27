"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { account } from "@/lib/appwrite"
import { adminService } from "@/lib/database"
import { authStatsService } from "@/lib/auth-stats"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserManagementPanel } from "@/components/user-management-panel"

export default function AdminPage() {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userProfiles, setUserProfiles] = useState([])
  const [admins, setAdmins] = useState([])
  const [stats, setStats] = useState({
    totalAdmins: 0,
    attendanceRecords: 0,
    note: ""
  })
  const router = useRouter()

  useEffect(() => {
    checkAdminAuth()
  }, [])

  const checkAdminAuth = async () => {
    try {
      const currentUser = await account.get()
      const adminStatus = await adminService.isAdmin(currentUser.$id)
      
      if (!adminStatus) {
        // Not an admin, redirect to home
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
      // Load admin list
      const adminList = await adminService.listAdmins()
      setAdmins(adminList)
      
      // Load simplified stats
      const authStats = await authStatsService.getStats()
      
      // Update stats
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

  const handleCreateAdmin = async () => {
    // This would open a modal or form to create new admin
    alert("Create admin functionality - to be implemented")
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Access Denied</p>
          <p>You don't have admin privileges</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-b border-white/20 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/lasu.png" alt="LASU" className="h-8 w-8" />
            <h1 className="text-xl font-bold">LASU AMS - ADMIN PANEL</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Admin: {user.name || user.email}
            </span>
            <ThemeToggle />
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Manage users, attendance, and system settings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Administrators</h3>
            <p className="text-2xl font-bold text-green-600 mb-2">{stats.totalAdmins}</p>
            <p className="text-sm text-muted-foreground">System administrators</p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">System Status</h3>
            <p className="text-2xl font-bold text-blue-600 mb-2">✅ Auth Only</p>
            <p className="text-sm text-muted-foreground">Simplified user management</p>
            <p className="text-xs text-gray-500 mt-1">User profiles stored in Auth preferences</p>
          </Card>
        </div>

        {/* Admin Management */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Admin Management</h3>
            <Button onClick={handleCreateAdmin}>
              Add New Admin
            </Button>
          </div>

          <Card className="p-6">
            <h4 className="font-medium mb-4">Current Administrators</h4>
            {admins.length > 0 ? (
              <div className="space-y-3">
                {admins.map((admin) => (
                  <div key={admin.$id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{admin.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Role: {admin.role} | Created: {new Date(admin.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm">
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No administrators found</p>
            )}
          </Card>

          {/* User Management */}
          <UserManagementPanel />
        </div>
      </main>
    </div>
  )
}
