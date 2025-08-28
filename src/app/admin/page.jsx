"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { account } from "@/lib/appwrite"
import { adminService } from "@/lib/database"
import { authStatsService } from "@/lib/auth-stats"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell, 
  Pagination,
  getKeyValue
} from "@heroui/react"

// Sample user data (replace with actual data from your API)
const users = [
  {
    key: "1",
    name: "Tony Reichert",
    role: "Admin",
    status: "Active",
    email: "tony@example.com",
    lastActive: "2025-08-27T10:30:00Z"
  },
  {
    key: "2",
    name: "Zoey Lang",
    role: "Staff",
    status: "Active",
    email: "zoey@example.com",
    lastActive: "2025-08-27T09:15:00Z"
  },
  // Add more sample users as needed
]

export default function AdminPage() {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [rowsPerPage] = useState(5)
  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalUsers: 0,
    activeUsers: 0,
    note: ""
  })
  const [userProfiles, setUserProfiles] = useState([])
  const router = useRouter()

  // Calculate pagination
  const pages = Math.ceil(userProfiles.length / rowsPerPage)
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage
    return userProfiles.slice(start, end)
  }, [page, userProfiles, rowsPerPage])

  useEffect(() => {
    checkAdminAuth()
  }, [])

  const checkAdminAuth = async () => {
    try {
      const currentUser = await account.get()
      const adminStatus = await adminService.isAdmin(currentUser.$id)
      
      if (!adminStatus) {
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
      setUserProfiles(adminList)
      
      // Load simplified stats
      const authStats = await authStatsService.getStats()
      setStats({
        ...stats,
        totalAdmins: authStats.totalAdmins || 1,
        totalUsers: authStats.totalUsers || userProfiles.length,
        activeUsers: authStats.activeUsers || Math.floor(userProfiles.length * 0.8)
      })
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4"></div>
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
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Total Users</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
            <p className="text-sm text-muted-foreground">Registered users</p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Active Users</h3>
            <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
            <p className="text-sm text-muted-foreground">Active in last 24h</p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Administrators</h3>
            <p className="text-2xl font-bold text-purple-600">{stats.totalAdmins}</p>
            <p className="text-sm text-muted-foreground">System administrators</p>
          </Card>
        </div>

        {/* User Management */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">User Management</h3>
            <Button onClick={handleCreateAdmin}>
              Add New User
            </Button>
          </div>

          <Card className="p-6">
            <Table
              aria-label="User management table"
              bottomContent={
                <div className="flex w-full justify-center">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={pages}
                    onChange={(page) => setPage(page)}
                  />
                </div>
              }
              classNames={{
                wrapper: "min-h-[400px]",
              }}
            >
              <TableHeader>
                <TableColumn key="name">NAME</TableColumn>
                <TableColumn key="email">EMAIL</TableColumn>
                <TableColumn key="role">ROLE</TableColumn>
                <TableColumn key="status">STATUS</TableColumn>
                <TableColumn key="lastActive">LAST ACTIVE</TableColumn>
              </TableHeader>
              <TableBody items={items}>
                {(item) => (
                  <TableRow key={item.$id}>
                    {(columnKey) => (
                      <TableCell>
                        {columnKey === 'lastActive' 
                          ? new Date(item[columnKey]).toLocaleString() 
                          : getKeyValue(item, columnKey)}
                      </TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </main>
    </div>
  )
}
