"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Search,
  Filter,
  RefreshCw,
  ArrowUpDown,
  XCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const allColumns = [
  { key: "name", label: "Name", sortable: true, filterable: true },
  { key: "email", label: "Email", sortable: true, filterable: true },
  { key: "phone", label: "Phone", sortable: true },
  { key: "matricNumber", label: "Matric No", sortable: true },
  { key: "department", label: "Department", sortable: true, filterable: true },
  { key: "level", label: "Level", sortable: true },
  { key: "status", label: "Status", sortable: true, filterable: true },
  { key: "verification", label: "Verified", sortable: true },
  { key: "role", label: "Role", sortable: true, filterable: true },
  { key: "joined", label: "Joined", sortable: true },
  { key: "lastActive", label: "Last Active", sortable: true },
];

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalUsers: 0,
    activeUsers: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(allColumns.map((c) => c.key))
  );
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "name",
    direction: "asc",
  });
  const [filters, setFilters] = useState({});

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const currentUser = await account.get();
      const isUserAdmin = currentUser.labels && currentUser.labels.includes("admin");

      if (!isUserAdmin) {
        router.push("/home");
        return;
      }

      setUser(currentUser);
      setIsAdmin(true);
      const list = await loadUsers();
      loadAdminData(list);
    } catch (error) {
      console.error("Auth error:", error);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch(`/api/admin/users?limit=100&page=1`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("Users API error:", res.status, text);
        setErrorMsg(`Users API error: ${res.status}`);
        return [];
      }
      const data = await res.json();
      const list = Array.isArray(data.users) ? data.users : [];
      setErrorMsg(null);
      setUsers(list);
      return list;
    } catch (error) {
      console.error("Error loading users:", error);
      setErrorMsg(error.message || "Failed to load users");
      return [];
    }
  };

  const loadAdminData = (list) => {
    const source = Array.isArray(list) ? list : users;
    const adminCount = source.filter((u) => u.role === "Admin").length;

    setStats({
      totalAdmins: adminCount,
      totalUsers: source.length,
      activeUsers: source.filter((u) => u.status === "Active").length,
    });
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    const list = await loadUsers();
    loadAdminData(list);
    setIsLoading(false);
  };

  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];

    if (searchQuery) {
      result = result.filter((user) =>
        allColumns.some((col) =>
          user[col.key]?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(
          (user) => user[key]?.toString().toLowerCase() === value.toLowerCase()
        );
      }
    });

    if (sortDescriptor.column) {
      result.sort((a, b) => {
        const aValue = a[sortDescriptor.column];
        const bValue = b[sortDescriptor.column];
        if (aValue < bValue) return sortDescriptor.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDescriptor.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [users, searchQuery, filters, sortDescriptor]);

  const handleSort = (key) => {
    setSortDescriptor((prev) => {
      if (prev.column === key) {
        return {
          column: key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      } else {
        return { column: key, direction: "asc" };
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4 w-full max-w-4xl">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-[500px]" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Access Denied</p>
          <p>You don't have admin privileges</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="backdrop-blur-sm bg-white/50 dark:bg-black/50 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/lasu.png" alt="LASU" className="h-8 w-8" />
            <h1 className="text-xl font-bold tracking-tight">
              LASU AMS - ADMIN PANEL
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.name || user?.email}
            </span>
            <ThemeToggle />
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            Admin Dashboard
          </h2>
          <p className="text-muted-foreground">
            Manage users, attendance, and system settings.
          </p>
        </div>
        {errorMsg && (
          <Alert variant="destructive" className="mb-6">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load users: {errorMsg}
            </AlertDescription>
            <Button
              variant="link"
              className="mt-2 text-red-700 dark:text-red-200"
              onClick={handleRefresh}
            >
              Retry
            </Button>
          </Alert>
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
              <p className="text-3xl font-bold tracking-tight">
                {stats.totalUsers}
              </p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Users
              </CardTitle>
              <p className="text-3xl font-bold tracking-tight">
                {stats.activeUsers}
              </p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Administrators
              </CardTitle>
              <p className="text-3xl font-bold tracking-tight">
                {stats.totalAdmins}
              </p>
            </CardHeader>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h3 className="text-xl font-semibold tracking-tight">
                User Management
              </h3>
              <div className="flex flex-wrap gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" /> Columns
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                    {allColumns.map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.key}
                        checked={visibleColumns.has(column.key)}
                        onCheckedChange={(checked) => {
                          const newVisibleColumns = new Set(visibleColumns);
                          checked
                            ? newVisibleColumns.add(column.key)
                            : newVisibleColumns.delete(column.key);
                          setVisibleColumns(newVisibleColumns);
                        }}
                      >
                        {column.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  <Download className="w-4 h-4 mr-2" /> Export CSV
                </Button>
              </div>
            </div>
            {Object.values(filters).some(Boolean) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(filters).map(([key, value]) => (
                  <Badge key={key} variant="secondary">
                    {allColumns.find((c) => c.key === key)?.label}: {value}
                    <X className="ml-2 h-3 w-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, [key]: '' }))} />
                  </Badge>
                ))}
              </div>
            )}
            <div className="rounded-md border">
              <div className="w-full overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {allColumns
                        .filter((c) => visibleColumns.has(c.key))
                        .map((column) => (
                          <TableHead
                            key={column.key}
                            onClick={() => column.sortable && handleSort(column.key)}
                            className="cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-2">
                              {column.label}
                              {column.sortable && (
                                <ArrowUpDown className="h-4 w-4" />
                              )}
                              {column.filterable && (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                      <Filter className="w-3 h-3 text-gray-400" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-64 p-4 space-y-3" align="start">
                                    <h4 className="font-medium text-sm">Filter by {column.label}</h4>
                                    <Input
                                      placeholder={`Enter ${column.label.toLowerCase()}...`}
                                      value={filters[column.key] || ""}
                                      onChange={(e) => setFilters(prev => ({ ...prev, [column.key]: e.target.value }))}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          e.currentTarget.blur();
                                        }
                                      }}
                                    />
                                    <div className="flex justify-end gap-2">
                                      <Button size="sm" variant="outline" onClick={() => setFilters(prev => ({ ...prev, [column.key]: "" }))}>
                                        Reset
                                      </Button>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              )}
                            </div>
                          </TableHead>
                        ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedUsers.length > 0 ? (
                      filteredAndSortedUsers.map((item) => (
                        <TableRow key={item.$id}>
                          {allColumns
                            .filter((c) => visibleColumns.has(c.key))
                            .map((column) => (
                              <TableCell key={column.key}>
                                {column.key === "status" ? (
                                  <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                                ) : (column.key === "lastActive" || column.key === "joined") ? (
                                  item[column.key] ? new Date(item[column.key]).toLocaleString() : "-"
                                ) : (
                                  item[column.key] || "-"
                                )}
                              </TableCell>
                            ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={allColumns.length} className="h-24 text-center">
                          No users found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Select onValueChange={(value) => setRowsPerPage(Number(value))} value={rowsPerPage.toString()}>
                <SelectTrigger className="w-auto">
                  <SelectValue placeholder="Rows per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}