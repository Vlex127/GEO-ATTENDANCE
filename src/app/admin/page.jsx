"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { account, users as usersApi } from "@/lib/appwrite"
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

export default function AdminPage() {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [rowsPerPage] = useState(10)
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalUsers: 0,
    activeUsers: 0,
    note: ""
  })
  const router = useRouter()

  // Calculate pagination
  const pages = Math.ceil(users.length / rowsPerPage)
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage
    return users.slice(start, end)
  }, [page, users, rowsPerPage])

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
      await loadUsers()
      await loadAdminData()
    } catch (error) {
      console.error("Auth error:", error)
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      // Fetch all users from Appwrite
      const response = await usersApi.list()
      
      // Get detailed user data including preferences
      const usersList = await Promise.all(response.users.map(async (user) => {
        try {
          // Get user preferences
          const prefs = await account.getPrefs(user.$id);
          
          return {
            key: user.$id,
            name: user.name || 'No Name',
            email: user.email,
            phone: user.phone || 'N/A',
            status: user.status === 0 ? 'Active' : 'Inactive',
            verification: user.emailVerification ? 'Verified' : 'Unverified',
            role: user.labels?.includes('admin') ? 'Admin' : 'User',
            labels: user.labels?.join(', ') || 'None',
            lastActive: user.accessedAt ? new Date(user.accessedAt * 1000).toLocaleString() : 'Never',
            joined: new Date(user.createdAt * 1000).toLocaleDateString(),
            // Include preferences if available
            department: prefs?.department || 'N/A',
            level: prefs?.level || 'N/A',
            matricNumber: prefs?.matricNumber || 'N/A',
            profileCompleted: prefs?.profileCompleted ? 'Yes' : 'No'
          };
        } catch (error) {
          console.error(`Error fetching details for user ${user.$id}:`, error);
          return null;
        }
      }));
      
      // Filter out any null entries from failed fetches
      setUsers(usersList.filter(user => user !== null));
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const loadAdminData = async () => {
    try {
      // Fetch admin stats
      const authStats = await authStatsService.getStats()
      
      // Count admins from the users list
      const adminCount = users.filter(u => u.role === 'Admin').length
      
      setStats({
        totalAdmins: adminCount,
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status === 'Active').length,
        note: ""
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

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      await loadUsers()
      await loadAdminData()
    } catch (error) {
      console.error("Error refreshing data:", error)
    } finally {
      setIsLoading(false)
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
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Refresh Data
            </Button>
            <span className="text-sm text-muted-foreground">
              {user?.name || user?.email}
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
            <p className="text-sm text-muted-foreground">Currently active</p>
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
            <div className="flex gap-2">
              <Button onClick={handleCreateAdmin}>
                Add New User
              </Button>
            </div>
          </div>

          <Card className="p-6">
            <Table
              aria-label="User management table"
              bottomContent={
                pages > 1 && (
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
                )
              }
              classNames={{
                wrapper: "min-h-[400px]",
              }}
            >
              <TableHeader>
                <TableColumn key="name">NAME</TableColumn>
                <TableColumn key="email">EMAIL</TableColumn>
                <TableColumn key="phone">PHONE</TableColumn>
                <TableColumn key="matricNumber">MATRIC NO</TableColumn>
                <TableColumn key="department">DEPARTMENT</TableColumn>
                <TableColumn key="level">LEVEL</TableColumn>
                <TableColumn key="status">STATUS</TableColumn>
                <TableColumn key="verification">VERIFIED</TableColumn>
                <TableColumn key="role">ROLE</TableColumn>
                <TableColumn key="labels">LABELS</TableColumn>
                <TableColumn key="joined">JOINED</TableColumn>
                <TableColumn key="lastActive">LAST ACTIVE</TableColumn>
              </TableHeader>
              <TableBody items={items}>
                {(item) => (
                  <TableRow key={item.key}>
                    {(columnKey) => (
                      <TableCell>
                        {columnKey === 'lastActive' && item[columnKey]
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
