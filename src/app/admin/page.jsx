"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { account } from "@/lib/appwrite"
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
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
  Chip,
  Checkbox,
  Tooltip,
  Button as NextUIButton
} from "@heroui/react"
import { Download, Search, Filter, RefreshCw } from "lucide-react"

export default function AdminPage() {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [users, setUsers] = useState([])
  const [errorMsg, setErrorMsg] = useState(null)
  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalUsers: 0,
    activeUsers: 0,
    note: ""
  })
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  // Column customization state
  const allColumns = [
    { key: 'name', label: 'Name', sortable: true, filterable: true },
    { key: 'email', label: 'Email', sortable: true, filterable: true },
    { key: 'phone', label: 'Phone', sortable: true },
    { key: 'matricNumber', label: 'Matric No', sortable: true },
    { key: 'department', label: 'Department', sortable: true, filterable: true },
    { key: 'level', label: 'Level', sortable: true },
    { key: 'status', label: 'Status', sortable: true, filterable: true },
    { key: 'verification', label: 'Verified', sortable: true },
    { key: 'role', label: 'Role', sortable: true, filterable: true },
    { key: 'labels', label: 'Labels' },
    { key: 'joined', label: 'Joined', sortable: true },
    { key: 'lastActive', label: 'Last Active', sortable: true }
  ]
  const [visibleColumns, setVisibleColumns] = useState(new Set(allColumns.map(c => c.key)))
  const [sortDescriptor, setSortDescriptor] = useState({ column: 'name', direction: 'ascending' })
  const [filters, setFilters] = useState({})

  // Filtered and sorted data
  const filteredUsers = useMemo(() => {
    let result = [...users]
    
    // Apply search
    if (searchQuery) {
      result = result.filter(user => 
        Object.values(user).some(val => 
          val?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(user => user[key]?.toString().toLowerCase() === value.toLowerCase())
      }
    })

    // Apply sorting
    if (sortDescriptor.column) {
      result.sort((a, b) => {
        const aValue = a[sortDescriptor.column]
        const bValue = b[sortDescriptor.column]
        if (aValue < bValue) return sortDescriptor.direction === 'ascending' ? -1 : 1
        if (aValue > bValue) return sortDescriptor.direction === 'ascending' ? 1 : -1
        return 0
      })
    }

    return result
  }, [users, searchQuery, filters, sortDescriptor])

  // Calculate pagination
  const pages = Math.ceil(filteredUsers.length / rowsPerPage)
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage
    return filteredUsers.slice(start, end)
  }, [page, filteredUsers, rowsPerPage])

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
      const res = await fetch(`/api/admin/users?limit=100&page=1`, { cache: 'no-store' })
      if (!res.ok) {
        const text = await res.text()
        console.error('Users API error:', res.status, text)
        setErrorMsg(`Users API error: ${res.status}`)
        return []
      }
      const data = await res.json()
      const list = Array.isArray(data.users) ? data.users : []
      setErrorMsg(null)
      setUsers(list)
      return list
    } catch (error) {
      console.error("Error loading users:", error)
      setErrorMsg(error.message || 'Failed to load users')
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

  const handleExportCSV = () => {
    const headers = allColumns.filter(c => visibleColumns.has(c.key)).map(c => c.label).join(',')
    const rows = filteredUsers.map(user => 
      allColumns.filter(c => visibleColumns.has(c.key))
        .map(c => `"${user[c.key]?.toString().replace(/"/g, '""') || ''}"`)
        .join(',')
    ).join('\n')
    const csv = `${headers}\n${rows}`
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const columnsToRender = useMemo(() => {
    return allColumns.filter(c => visibleColumns.has(c.key))
  }, [visibleColumns])

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto"></div>
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 mx-auto"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Access Denied</p>
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
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
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

        {errorMsg && (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:border-red-900/50">
            Failed to load users: {errorMsg}
            <Button variant="link" className="ml-4 text-red-700" onClick={handleRefresh}>
              Retry
            </Button>
          </div>
        )}

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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-xl font-semibold">User Management</h3>
            <div className="flex flex-wrap gap-2">
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Search className="w-4 h-4 text-gray-500" />}
                className="w-full sm:w-64"
              />
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" /> Filter Columns
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Filter columns"
                  selectionMode="multiple"
                  selectedKeys={visibleColumns}
                  onSelectionChange={setVisibleColumns}
                  topContent={
                    <div className="px-3 py-2">
                      <Input
                        placeholder="Search columns..."
                        className="mb-2"
                      />
                      <div className="flex justify-between">
                        <Checkbox
                          isSelected={visibleColumns.size === allColumns.length}
                          onChange={() => {
                            setVisibleColumns(
                              visibleColumns.size === allColumns.length
                                ? new Set()
                                : new Set(allColumns.map(c => c.key))
                            )
                          }}
                        >
                          Select All
                        </Checkbox>
                        <NextUIButton
                          size="sm"
                          variant="light"
                          onClick={() => setVisibleColumns(new Set())}
                        >
                          Clear
                        </NextUIButton>
                      </div>
                    </div>
                  }
                >
                  {allColumns.map(col => (
                    <DropdownItem key={col.key}>{col.label}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              <Button onClick={handleCreateAdmin}>
                Add New User
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </Button>
            </div>
          </div>

          {/* Filter Chips */}
          {Object.keys(filters).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => (
                value && (
                  <Chip
                    key={key}
                    onClose={() => setFilters(prev => ({ ...prev, [key]: '' }))}
                    variant="flat"
                    color="primary"
                  >
                    {allColumns.find(c => c.key === key)?.label}: {value}
                  </Chip>
                )
              ))}
            </div>
          )}

          <Card className="p-6">
            <Table
              aria-label="User management table with enhanced features"
              classNames={{
                wrapper: "min-h-[400px] max-h-[600px] overflow-auto",
                th: "sticky top-0 z-10 bg-gray-50 dark:bg-gray-900",
                td: "py-3",
                tr: "hover:bg-gray-100 dark:hover:bg-gray-800"
              }}
              bottomContent={
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Showing {items.length} of {filteredUsers.length} users
                    </span>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button variant="outline" size="sm">
                          Rows: {rowsPerPage}
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label="Rows per page"
                        onAction={(key) => setRowsPerPage(Number(key))}
                      >
                        <DropdownItem key="5">5</DropdownItem>
                        <DropdownItem key="10">10</DropdownItem>
                        <DropdownItem key="20">20</DropdownItem>
                        <DropdownItem key="50">50</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                  {pages > 1 && (
                    <Pagination
                      isCompact
                      showControls
                      showShadow
                      color="primary"
                      page={page}
                      total={pages}
                      onChange={(page) => setPage(page)}
                    />
                  )}
                </div>
              }
            >
              <TableHeader columns={columnsToRender}>
  {(column) => (
    <TableColumn
      key={column.key}
      className={column.key === 'name' ? 'sticky left-0 z-10 bg-gray-50 dark:bg-gray-900' : ''}
      allowsSorting={column.sortable}
      onClick={() => {
        if (column.sortable) {
          setSortDescriptor({
            column: column.key,
            direction:
              sortDescriptor.column === column.key
                ? sortDescriptor.direction === 'ascending'
                  ? 'descending'
                  : 'ascending'
                : 'ascending'
          })
        }
      }}
    >
      <div className="flex items-center gap-2">
        {column.label}
        {column.filterable && (
          <Tooltip content={`Filter by ${column.label}`}>
            <button
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
              onClick={(e) => {
                e.stopPropagation()
                // open popover with input/select here
              }}
            >
              <Filter className="w-3 h-3" />
            </button>
          </Tooltip>
        )}
      </div>
    </TableColumn>
  )}
</TableHeader>


              <TableBody items={items}>
                {(item) => (
                  <TableRow key={item.key}>
                    {columnsToRender.map((col) => (
                      <TableCell
                        key={col.key}
                        className={col.key === 'name' ? 'sticky left-0 z-10 bg-white dark:bg-gray-950' : ''}
                      >
                        {col.key === 'status' ? (
                          <Chip
                            size="sm"
                            className={getStatusColor(item[col.key])}
                          >
                            {item[col.key]}
                          </Chip>
                        ) : ((col.key === 'lastActive' || col.key === 'joined') && item[col.key]) ? (
                          new Date(item[col.key]).toLocaleString()
                        ) : (
                          item[col.key] || '-'
                        )}
                      </TableCell>
                    ))}
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