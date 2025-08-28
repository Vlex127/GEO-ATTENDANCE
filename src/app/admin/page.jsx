"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { account, users as usersApi } from "@/lib/appwrite"
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
      const list = await loadUsers()
      await loadAdminData(list)
    } catch (error) {
      console.error("Auth error:", error)
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      // Fetch all users from Appwrite (Admin endpoint)
      const response = await usersApi.list()
      
      // Map basic user data; preferences are only available via server Users.getPrefs
      const usersList = response.users.map((u) => {
        const prefs = u.prefs || {} // if server included prefs
        return {
          key: u.$id,
          name: u.name || 'No Name',
          email: u.email,
          phone: u.phone || 'N/A',
          status: u.status ? 'Active' : 'Inactive',
          verification: u.emailVerification ? 'Verified' : 'Unverified',
          role: u.labels?.includes('admin') ? 'Admin' : 'User',
          labels: Array.isArray(u.labels) && u.labels.length ? u.labels.join(', ') : 'None',
          lastActive: u.accessedAt || u.updatedAt || u.createdAt,
          joined: u.createdAt,
          // Preferences (if present on the user object)
          department: prefs.department || 'N/A',
          level: prefs.level || 'N/A',
          matricNumber: prefs.matricNumber || 'N/A',
          profileCompleted: prefs.profileCompleted ? 'Yes' : 'No'
        }
      })

      setUsers(usersList)
      return usersList
    } catch (error) {
      console.error("Error loading users:", error)
      return []
    }
  }

  const loadAdminData = async (list) => {
    try {
      const source = Array.isArray(list) ? list : users
      const adminCount = source.filter(u => u.role === 'Admin').length

      setStats({
        totalAdmins: adminCount,
        totalUsers: source.length,
        activeUsers: source.filter(u => u.status === 'Active').length,
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
      const list = await loadUsers()
      await loadAdminData(list)
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
                        {((columnKey === 'lastActive') || (columnKey === 'joined')) && item[columnKey]
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
