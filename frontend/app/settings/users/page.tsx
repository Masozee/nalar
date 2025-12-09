"use client"

import { useState } from "react"
import { PaginationState, SortingState } from "@tanstack/react-table"
import { usePageFilters, usePageSize, filterActions } from "@/lib/store"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { TopNavbar } from "@/components/top-navbar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Icon } from "@/components/ui/icon"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createUserColumns } from "./columns"
import {
  useTenantUsers,
  useAddTenantUser,
  useUpdateTenantUser,
  useRemoveTenantUser,
} from "@/lib/hooks/use-tenants-query"
import { TenantUser } from "@/lib/api/tenants"

export default function UsersManagementPage() {
  // Use TanStack Store for filters and page size
  const pageId = "settings-users"
  const filters = usePageFilters(pageId)
  const searchQuery = filters.search || ""
  const filterRole = filters.role || "all"
  const filterStatus = filters.status || "all"
  const defaultPageSize = usePageSize()

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Pagination
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  })

  // Sorting
  const [sorting, setSorting] = useState<SortingState>([])

  // Dialog states
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<TenantUser | null>(null)

  // Form states
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserRole, setNewUserRole] = useState("member")
  const [editUserRole, setEditUserRole] = useState("")
  const [editUserStatus, setEditUserStatus] = useState(true)

  // Build query params
  const queryParams = {
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
    ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
    ...(filterRole !== "all" && { role: filterRole }),
    ...(filterStatus !== "all" && { is_active: filterStatus === "active" }),
    ...(sorting.length > 0 && {
      ordering: sorting[0].desc ? `-${sorting[0].id}` : sorting[0].id,
    }),
  }

  // Fetch data with TanStack Query
  const { data, isLoading } = useTenantUsers(queryParams)
  const addUserMutation = useAddTenantUser()
  const updateUserMutation = useUpdateTenantUser()
  const removeUserMutation = useRemoveTenantUser()

  // Handlers
  const handleAddUser = async () => {
    if (!newUserEmail) return

    addUserMutation.mutate(
      { user_email: newUserEmail, role: newUserRole, is_active: true },
      {
        onSuccess: () => {
          setIsAddUserOpen(false)
          setNewUserEmail("")
          setNewUserRole("member")
        },
        onError: (error: any) => {
          alert(`Error: ${error?.response?.data?.detail || "Failed to add user"}`)
        },
      }
    )
  }

  const handleEditUser = async () => {
    if (!selectedUser) return

    updateUserMutation.mutate(
      {
        id: selectedUser.id,
        data: {
          role: editUserRole as any,
          is_active: editUserStatus,
        },
      },
      {
        onSuccess: () => {
          setIsEditUserOpen(false)
          setSelectedUser(null)
        },
        onError: (error: any) => {
          alert(`Error: ${error?.response?.data?.detail || "Failed to update user"}`)
        },
      }
    )
  }

  const handleRemoveUser = (user: TenantUser) => {
    if (!confirm(`Are you sure you want to remove ${user.user.email}?`)) return

    removeUserMutation.mutate(user.id, {
      onError: (error: any) => {
        alert(`Error: ${error?.response?.data?.detail || "Failed to remove user"}`)
      },
    })
  }

  const openEditDialog = (user: TenantUser) => {
    setSelectedUser(user)
    setEditUserRole(user.role)
    setEditUserStatus(user.is_active)
    setIsEditUserOpen(true)
  }

  // Column definitions with actions
  const columns = createUserColumns(openEditDialog, handleRemoveUser)

  // Stats
  const users = data?.results || []
  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.is_active).length
  const admins = users.filter((u) => u.role === "admin" || u.role === "owner").length
  const members = users.filter((u) => u.role === "member" || u.role === "manager").length

  return (
    <>
      <header className="bg-background sticky top-0 flex shrink-0 items-center justify-between gap-2 border-b p-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Users & Roles</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <TopNavbar />
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">
              Manage users and their roles in your organization
            </p>
          </div>
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <Icon name="UserPlus" size={16} className="mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Invite a new user to your organization by email
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUserRole} onValueChange={setNewUserRole}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddUser} disabled={addUserMutation.isPending}>
                  {addUserMutation.isPending ? "Adding..." : "Add User"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Admins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{admins}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Icon
              name="Search"
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => {
                filterActions.setPageFilter(pageId, { ...filters, search: e.target.value })
                setPagination((prev) => ({ ...prev, pageIndex: 0 }))
              }}
              className="pl-9"
            />
          </div>

          <Select
            value={filterRole}
            onValueChange={(value) => {
              filterActions.setPageFilter(pageId, { ...filters, role: value })
              setPagination((prev) => ({ ...prev, pageIndex: 0 }))
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterStatus}
            onValueChange={(value) => {
              filterActions.setPageFilter(pageId, { ...filters, status: value })
              setPagination((prev) => ({ ...prev, pageIndex: 0 }))
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <DataTable
          columns={columns}
          data={users}
          pageCount={data?.pageCount || 0}
          pagination={pagination}
          onPaginationChange={setPagination}
          sorting={sorting}
          onSortingChange={setSorting}
          manualPagination
          manualSorting
          isLoading={isLoading}
          emptyMessage="No users found"
          loadingMessage="Loading users..."
        />

        {/* Edit User Dialog */}
        <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user role and status</DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>User</Label>
                  <div className="text-sm">
                    <div className="font-medium">
                      {selectedUser.user.first_name} {selectedUser.user.last_name}
                    </div>
                    <div className="text-muted-foreground">{selectedUser.user.email}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select value={editUserRole} onValueChange={setEditUserRole}>
                    <SelectTrigger id="edit-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editUserStatus ? "active" : "inactive"}
                    onValueChange={(value) => setEditUserStatus(value === "active")}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditUser} disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
