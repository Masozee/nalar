"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icon } from "@/components/ui/icon"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface TenantUser {
  id: string
  user: {
    id: number
    email: string
    username: string
    first_name: string
    last_name: string
    full_name: string
    is_active: boolean
  }
  role: string
  role_display: string
  is_owner: boolean
  is_active: boolean
  can_manage_users: boolean
  joined_at: string
}

export function UsersRolesSettings() {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<TenantUser[]>([])
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserRole, setNewUserRole] = useState("member")

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/v1/tenant-users/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.results || data)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/v1/tenant-users/roles/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setRoles(data)
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error)
    }
  }

  const handleAddUser = async () => {
    try {
      const response = await fetch("/api/v1/tenant-users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          user_email: newUserEmail,
          role: newUserRole,
          is_active: true,
        }),
      })

      if (response.ok) {
        await fetchUsers()
        setShowAddDialog(false)
        setNewUserEmail("")
        setNewUserRole("member")
        alert("User added successfully!")
      } else {
        const error = await response.json()
        alert(`Failed to add user: ${JSON.stringify(error)}`)
      }
    } catch (error) {
      console.error("Failed to add user:", error)
      alert("Failed to add user")
    }
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/v1/tenant-users/${userId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        await fetchUsers()
        alert("User role updated successfully!")
      } else {
        alert("Failed to update user role")
      }
    } catch (error) {
      console.error("Failed to update role:", error)
      alert("Failed to update role")
    }
  }

  const handleRemoveUser = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this user?")) return

    try {
      const response = await fetch(`/api/v1/tenant-users/${userId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      if (response.ok) {
        await fetchUsers()
        alert("User removed successfully!")
      } else {
        alert("Failed to remove user")
      }
    } catch (error) {
      console.error("Failed to remove user:", error)
      alert("Failed to remove user")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Users & Roles</CardTitle>
              <CardDescription>
                Manage users and their roles in your organization
              </CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Icon name="UserPlus" className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>
                    Add an existing user to your organization
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">User Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={newUserRole} onValueChange={setNewUserRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddUser}>Add User</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Icon name="Loader2" className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading users...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((tenantUser) => (
                  <TableRow key={tenantUser.id}>
                    <TableCell className="font-medium">
                      {tenantUser.user.full_name}
                      {tenantUser.is_owner && (
                        <Badge variant="outline" className="ml-2">
                          Owner
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{tenantUser.user.email}</TableCell>
                    <TableCell>
                      <Select
                        value={tenantUser.role}
                        onValueChange={(value) =>
                          handleUpdateRole(tenantUser.id, value)
                        }
                        disabled={tenantUser.is_owner}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge variant={tenantUser.is_active ? "default" : "secondary"}>
                        {tenantUser.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveUser(tenantUser.id)}
                        disabled={tenantUser.is_owner}
                      >
                        <Icon name="Trash2" className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Role Descriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>
            Understanding different user roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Badge>Owner</Badge>
              <p className="text-sm text-muted-foreground">
                Full access to all features, including billing and organization deletion
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Badge>Admin</Badge>
              <p className="text-sm text-muted-foreground">
                Manage users, settings, and all modules
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Badge>Manager</Badge>
              <p className="text-sm text-muted-foreground">
                Manage specific modules and approve requests
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Badge>Member</Badge>
              <p className="text-sm text-muted-foreground">
                Standard access to assigned modules
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Badge>Viewer</Badge>
              <p className="text-sm text-muted-foreground">
                Read-only access to assigned modules
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
