"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { account } from "@/lib/appwrite"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Button as NextUIButton,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Avatar,
  Badge,
  Divider,
  Select,
  SelectItem
} from "@heroui/react"
import { 
  Download, 
  Search, 
  Filter, 
  RefreshCw, 
  Plus, 
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Users,
  UserCheck,
  Shield,
  Activity,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Clock,
  ChevronDown,
  Settings,
  BarChart3,
  TrendingUp,
  AlertTriangle
} from "lucide-react"

export default function AdminPage() {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [users, setUsers] = useState([])
  const [errorMsg, setErrorMsg] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [bulkSelectedUsers, setBulkSelectedUsers] = useState(new Set())
  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    verifiedUsers: 0,
    note: ""
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("")
  const router = useRouter()

  const { isOpen: isUserModalOpen, onOpen: onUserModalOpen, onOpenChange: onUserModalOpenChange } = useDisclosure()
  const { isOpen: isBulkModalOpen, onOpen: onBulkModalOpen, onOpenChange: onBulkModalOpenChange } = useDisclosure()

  // Enhanced column configuration
  const allColumns = [
    { key: 'select', label: 'Select', width: '50px', sticky: true },
    { key: 'user', label: 'User', sortable: true, filterable: true, width: '250px', sticky: true },
    { key: 'contact', label: 'Contact', sortable: true, width: '200px' },
    { key: 'academic', label: 'Academic Info', sortable: true, width: '200px' },
    { key: 'status', label: 'Status', sortable: true, filterable: true, width: '120px' },
    { key: 'verification', label: 'Verified', sortable: true, width: '100px' },
    { key: 'role', label: 'Role', sortable: true, filterable: true, width: '120px' },
    { key: 'activity', label: 'Activity', sortable: true, width: '180px' },
    { key: 'actions', label: 'Actions', width: '100px' }
  ]
  
  const [visibleColumns, setVisibleColumns] = useState(new Set(allColumns.map(c => c.key)))
  const [sortDescriptor, setSortDescriptor] = useState({ column: 'user', direction: 'ascending' })

  // Enhanced filtering and sorting
  const filteredUsers = useMemo(() => {
    let result = [...users]
    
    // Apply search across multiple fields
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(user => 
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query) ||
        user.matricNumber?.toLowerCase().includes(query) ||
        user.department?.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (statusFilter) {
      result = result.filter(user => user.status === statusFilter)
    }

    // Apply role filter
    if (roleFilter) {
      result = result.filter(user => user.role === roleFilter)
    }

    // Apply department filter
    if (departmentFilter) {
      result = result.filter(user => user.department === departmentFilter)
    }

    // Apply sorting
    if (sortDescriptor.column && sortDescriptor.column !== 'select' && sortDescriptor.column !== 'actions') {
      result.sort((a, b) => {
        let aValue, bValue
        
        switch (sortDescriptor.column) {
          case 'user':
            aValue = a.name || a.email
            bValue = b.name || b.email
            break
          case 'contact':
            aValue = a.email
            bValue = b.email
            break
          case 'academic':
            aValue = a.department
            bValue = b.department
            break
          case 'activity':
            aValue = new Date(a.lastActive || 0)
            bValue = new Date(b.lastActive || 0)
            break
          default:
            aValue = a[sortDescriptor.column]
            bValue = b[sortDescriptor.column]
        }

        if (aValue < bValue) return sortDescriptor.direction === 'ascending' ? -1 : 1
        if (aValue > bValue) return sortDescriptor.direction === 'ascending' ? 1 : -1
        return 0
      })
    }

    return result
  }, [users, searchQuery, statusFilter, roleFilter, departmentFilter, sortDescriptor])

  // Calculate pagination
  const pages = Math.ceil(filteredUsers.length / rowsPerPage)
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage
    return filteredUsers.slice(start, end)
  }, [page, filteredUsers, rowsPerPage])

  // Get unique values for filters
  const departments = [...new Set(users.map(u => u.department).filter(Boolean))]
  const roles = [...new Set(users.map(u => u.role).filter(Boolean))]
  const statuses = [...new Set(users.map(u => u.status).filter(Boolean))]

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
      const pendingCount = source.filter(u => u.status === 'Pending').length
      const verifiedCount = source.filter(u => u.verification === 'verified' || u.verification === true).length

      setStats({
        totalAdmins: adminCount,
        totalUsers: source.length,
        activeUsers: source.filter(u => u.status === 'Active').length,
        pendingUsers: pendingCount,
        verifiedUsers: verifiedCount,
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
    const headers = [
      'Name', 'Email', 'Phone', 'Matric Number', 'Department', 
      'Level', 'Status', 'Verified', 'Role', 'Joined', 'Last Active'
    ].join(',')
    
    const rows = filteredUsers.map(user => [
      `"${user.name || ''}"`,
      `"${user.email || ''}"`,
      `"${user.phone || ''}"`,
      `"${user.matricNumber || ''}"`,
      `"${user.department || ''}"`,
      `"${user.level || ''}"`,
      `"${user.status || ''}"`,
      `"${user.verification || ''}"`,
      `"${user.role || ''}"`,
      `"${user.joined || ''}"`,
      `"${user.lastActive || ''}"`
    ].join(',')).join('\n')
    
    const csv = `${headers}\n${rows}`
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleBulkAction = (action) => {
    console.log(`Bulk action: ${action} on users:`, Array.from(bulkSelectedUsers))
    // Implement bulk actions here
    onBulkModalOpen()
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success'
      case 'inactive': return 'danger'
      case 'pending': return 'warning'
      default: return 'default'
    }
  }

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'danger'
      case 'moderator': return 'warning'
      case 'user': return 'primary'
      default: return 'default'
    }
  }

  const formatLastActive = (lastActive) => {
    if (!lastActive) return 'Never'
    const date = new Date(lastActive)
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return `${Math.floor(days / 30)} months ago`
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Loading Admin Panel</h3>
            <p className="text-muted-foreground">Please wait while we prepare your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-red-700 dark:text-red-400">Access Denied</h3>
              <p className="text-muted-foreground mt-1">You don't have admin privileges to access this panel.</p>
            </div>
            <Button onClick={() => router.push("/home")} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src="/lasu.png" alt="LASU" className="h-10 w-10 rounded-lg shadow-sm" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-950"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    LASU AMS
                  </h1>
                  <p className="text-xs text-muted-foreground">Admin Panel</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Tooltip content="Refresh Data">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  isIconOnly
                  onClick={handleRefresh}
                  className="hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </Tooltip>
              
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                <Avatar 
                  src={user?.avatar} 
                  name={user?.name || user?.email} 
                  size="sm"
                  className="w-6 h-6"
                />
                <span className="text-sm font-medium">{user?.name || user?.email?.split('@')[0]}</span>
              </div>
              
              <ThemeToggle />
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive user management, attendance tracking, and system analytics at your fingertips
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium text-red-800 dark:text-red-200">Failed to load users</h4>
                  <p className="text-sm text-red-700 dark:text-red-300">{errorMsg}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleRefresh} className="border-red-300 text-red-700 hover:bg-red-100">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Users</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalUsers}</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Registered members</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-bl-full"></div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Active Users</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.activeUsers}</p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">Currently active</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-bl-full"></div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Administrators</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.totalAdmins}</p>
                  <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">System admins</p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-xl">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-bl-full"></div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Pending</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.pendingUsers}</p>
                  <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">Awaiting approval</p>
                </div>
                <div className="p-3 bg-orange-500/10 rounded-xl">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/5 rounded-bl-full"></div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced User Management Section */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  User Management
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage user accounts, roles, and permissions
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => alert("Create user functionality - to be implemented")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleExportCSV}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mt-6">
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Search className="w-4 h-4 text-gray-500" />}
                className="bg-white dark:bg-slate-900"
              />
              
              <Select
                placeholder="Filter by Status"
                selectedKeys={statusFilter ? [statusFilter] : []}
                onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] || "")}
              >
                <SelectItem key="">All Statuses</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </Select>

              <Select
                placeholder="Filter by Role"
                selectedKeys={roleFilter ? [roleFilter] : []}
                onSelectionChange={(keys) => setRoleFilter(Array.from(keys)[0] || "")}
              >
                <SelectItem key="">All Roles</SelectItem>
                {roles.map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </Select>

              <Select
                placeholder="Filter by Department"
                selectedKeys={departmentFilter ? [departmentFilter] : []}
                onSelectionChange={(keys) => setDepartmentFilter(Array.from(keys)[0] || "")}
              >
                <SelectItem key="">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </Select>

              <Select
                placeholder="Rows per page"
                selectedKeys={[rowsPerPage.toString()]}
                onSelectionChange={(keys) => setRowsPerPage(Number(Array.from(keys)[0]))}
              >
                <SelectItem key="10">10 rows</SelectItem>
                <SelectItem key="25">25 rows</SelectItem>
                <SelectItem key="50">50 rows</SelectItem>
                <SelectItem key="100">100 rows</SelectItem>
              </Select>
            </div>

            {/* Bulk Actions */}
            {bulkSelectedUsers.size > 0 && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800/50">
                <Badge color="primary" variant="flat">
                  {bulkSelectedUsers.size} selected
                </Badge>
                <Divider orientation="vertical" className="h-6" />
                <div className="flex gap-2">
                  <Button size="sm" variant="flat" onClick={() => handleBulkAction('activate')}>
                    Activate
                  </Button>
                  <Button size="sm" variant="flat" onClick={() => handleBulkAction('deactivate')}>
                    Deactivate
                  </Button>
                  <Button size="sm" variant="flat" color="danger" onClick={() => handleBulkAction('delete')}>
                    Delete
                  </Button>
                </div>
                <Button 
                  size="sm" 
                  variant="light" 
                  onClick={() => setBulkSelectedUsers(new Set())}
                >
                  Clear Selection
                </Button>
              </div>
            )}
          </CardHeader>

          <CardContent>
            <Table
              aria-label="Enhanced user management table"
              classNames={{
                wrapper: "min-h-[500px] shadow-none border border-slate-200 dark:border-slate-800 rounded-xl",
                th: "bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 font-semibold",
                td: "py-4 border-b border-slate-100 dark:border-slate-800",
                tr: "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              }}
              bottomContent={
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50">
                  <div className="text-sm text-muted-foreground">
                    Showing <span className="font-semibold">{items.length}</span> of{' '}
                    <span className="font-semibold">{filteredUsers.length}</span> users
                  </div>
                  {pages > 1 && (
                    <Pagination
                      isCompact
                      showControls
                      showShadow
                      color="primary"
                      page={page}
                      total={pages}
                      onChange={setPage}
                      classNames={{
                        cursor: "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      }}
                    />
                  )}
                </div>
              }
            >
              <TableHeader>
                <TableColumn key="select" width={50}>
                  <Checkbox
                    isSelected={bulkSelectedUsers.size === items.length && items.length > 0}
                    isIndeterminate={bulkSelectedUsers.size > 0 && bulkSelectedUsers.size < items.length}
                    onChange={(isSelected) => {
                      if (isSelected) {
                        setBulkSelectedUsers(new Set(items.map(item => item.key || item.email)))
                      } else {
                        setBulkSelectedUsers(new Set())
                      }
                    }}
                  />
                </TableColumn>
                
                <TableColumn key="user" allowsSorting width={250} className="sticky left-0 z-10">
                  <div className="flex items-center gap-2">
                    <span>User</span>
                    {sortDescriptor.column === 'user' && (
                      <ChevronDown className={`w-4 h-4 transition-transform ${
                        sortDescriptor.direction === 'ascending' ? 'rotate-180' : ''
                      }`} />
                    )}
                  </div>
                </TableColumn>
                
                <TableColumn key="contact" allowsSorting width={200}>
                  <span>Contact Info</span>
                </TableColumn>
                
                <TableColumn key="academic" allowsSorting width={200}>
                  <span>Academic Info</span>
                </TableColumn>
                
                <TableColumn key="status" allowsSorting width={120}>
                  <span>Status</span>
                </TableColumn>
                
                <TableColumn key="verification" allowsSorting width={100}>
                  <span>Verified</span>
                </TableColumn>
                
                <TableColumn key="role" allowsSorting width={120}>
                  <span>Role</span>
                </TableColumn>
                
                <TableColumn key="activity" allowsSorting width={180}>
                  <span>Last Activity</span>
                </TableColumn>
                
                <TableColumn key="actions" width={100}>
                  <span>Actions</span>
                </TableColumn>
              </TableHeader>
              
              <TableBody items={items}>
                {(item) => (
                  <TableRow key={item.key || item.email}>
                    {/* Select Checkbox */}
                    <TableCell>
                      <Checkbox
                        isSelected={bulkSelectedUsers.has(item.key || item.email)}
                        onChange={(isSelected) => {
                          const newSelection = new Set(bulkSelectedUsers)
                          if (isSelected) {
                            newSelection.add(item.key || item.email)
                          } else {
                            newSelection.delete(item.key || item.email)
                          }
                          setBulkSelectedUsers(newSelection)
                        }}
                      />
                    </TableCell>

                    {/* User Info */}
                    <TableCell className="sticky left-0 z-10 bg-white dark:bg-slate-950">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={item.avatar}
                          name={item.name || item.email}
                          size="sm"
                          className="shrink-0"
                          showFallback
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm truncate">
                            {item.name || 'Unnamed User'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Contact Info */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span className="truncate">{item.email || '-'}</span>
                        </div>
                        {item.phone && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3 shrink-0" />
                            <span>{item.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Academic Info */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {item.department || '-'}
                        </div>
                        {item.matricNumber && (
                          <div className="text-xs text-muted-foreground">
                            {item.matricNumber}
                          </div>
                        )}
                        {item.level && (
                          <Chip size="sm" variant="flat" color="default" className="text-xs">
                            Level {item.level}
                          </Chip>
                        )}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Chip
                        size="sm"
                        color={getStatusColor(item.status)}
                        variant="flat"
                        className="capitalize"
                      >
                        {item.status || 'Unknown'}
                      </Chip>
                    </TableCell>

                    {/* Verification */}
                    <TableCell>
                      <div className="flex justify-center">
                        {item.verification === 'verified' || item.verification === true ? (
                          <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Role */}
                    <TableCell>
                      <Chip
                        size="sm"
                        color={getRoleColor(item.role)}
                        variant="flat"
                        className="capitalize"
                      >
                        {item.role || 'User'}
                      </Chip>
                    </TableCell>

                    {/* Activity */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Activity className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span>{formatLastActive(item.lastActive)}</span>
                        </div>
                        {item.joined && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3 shrink-0" />
                            <span>Joined {new Date(item.joined).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button isIconOnly variant="light" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="User actions">
                          <DropdownItem
                            key="view"
                            startContent={<Eye className="w-4 h-4" />}
                            onClick={() => {
                              setSelectedUser(item)
                              onUserModalOpen()
                            }}
                          >
                            View Details
                          </DropdownItem>
                          <DropdownItem
                            key="edit"
                            startContent={<Edit className="w-4 h-4" />}
                          >
                            Edit User
                          </DropdownItem>
                          <DropdownItem
                            key="settings"
                            startContent={<Settings className="w-4 h-4" />}
                          >
                            Permissions
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            color="danger"
                            startContent={<Trash2 className="w-4 h-4" />}
                          >
                            Delete User
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {/* User Details Modal */}
      <Modal 
        isOpen={isUserModalOpen} 
        onOpenChange={onUserModalOpenChange}
        size="2xl"
        scrollBehavior="inside"
        classNames={{
          base: "bg-white dark:bg-slate-950",
          header: "border-b border-slate-200 dark:border-slate-800",
          body: "py-6",
          footer: "border-t border-slate-200 dark:border-slate-800"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={selectedUser?.avatar}
                    name={selectedUser?.name || selectedUser?.email}
                    size="md"
                    showFallback
                  />
                  <div>
                    <h3 className="text-xl font-semibold">{selectedUser?.name || 'User Details'}</h3>
                    <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
                  </div>
                </div>
              </ModalHeader>
              
              <ModalBody>
                {selectedUser && (
                  <div className="space-y-6">
                    {/* Status and Role */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Chip color={getStatusColor(selectedUser.status)} variant="flat">
                          {selectedUser.status || 'Unknown'}
                        </Chip>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Role</label>
                        <Chip color={getRoleColor(selectedUser.role)} variant="flat">
                          {selectedUser.role || 'User'}
                        </Chip>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Contact Information
                      </h4>
                      <div className="grid gap-3">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Email</label>
                          <p className="text-sm">{selectedUser.email || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Phone</label>
                          <p className="text-sm">{selectedUser.phone || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Academic Information */}
                    <div className="space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Academic Information
                      </h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Department</label>
                          <p className="text-sm">{selectedUser.department || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Level</label>
                          <p className="text-sm">{selectedUser.level || 'Not specified'}</p>
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-muted-foreground">Matric Number</label>
                          <p className="text-sm">{selectedUser.matricNumber || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Activity Information */}
                    <div className="space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Activity Information
                      </h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Last Active</label>
                          <p className="text-sm">{formatLastActive(selectedUser.lastActive)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Joined</label>
                          <p className="text-sm">
                            {selectedUser.joined 
                              ? new Date(selectedUser.joined).toLocaleDateString() 
                              : 'Not available'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Verification Status */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Verification Status</label>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          selectedUser.verification === 'verified' || selectedUser.verification === true
                            ? 'bg-green-600' 
                            : 'bg-gray-400'
                        }`}></div>
                        <span className="text-sm">
                          {selectedUser.verification === 'verified' || selectedUser.verification === true
                            ? 'Verified Account'
                            : 'Unverified Account'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </ModalBody>
              
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button 
                  color="primary" 
                  onPress={() => {
                    alert('Edit user functionality to be implemented')
                    onClose()
                  }}
                >
                  Edit User
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Bulk Actions Modal */}
      <Modal isOpen={isBulkModalOpen} onOpenChange={onBulkModalOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3 className="text-lg font-semibold">Bulk Actions</h3>
              </ModalHeader>
              <ModalBody>
                <p>Bulk action functionality will be implemented here.</p>
                <p className="text-sm text-muted-foreground">
                  Selected {bulkSelectedUsers.size} users for bulk operations.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={onClose}>
                  Confirm
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}