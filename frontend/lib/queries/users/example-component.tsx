/**
 * Example Client Component using TanStack Query
 *
 * This demonstrates how to use the query and mutation hooks
 * in a real component.
 */

"use client"

import { useState } from "react"
import { useUsers, useUser } from "./queries"
import { useUpdateUser, useDeleteUser } from "./mutations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function UserListExample() {
  const [search, setSearch] = useState("")
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  // Query: Fetch users list with search filter
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
    refetch: refetchUsers,
  } = useUsers(
    { search, page_size: 10 },
    {
      // Optional: Add query options
      staleTime: 5 * 60 * 1000, // 5 minutes
      // enabled: true, // Control when query runs
    }
  )

  // Query: Fetch single user details
  const {
    data: selectedUser,
    isLoading: isLoadingUser,
  } = useUser(selectedUserId || "", {
    enabled: !!selectedUserId, // Only fetch when user is selected
  })

  // Mutation: Update user
  const updateUserMutation = useUpdateUser({
    onSuccess: (updatedUser) => {
      console.log("User updated:", updatedUser)
      alert("User updated successfully!")
    },
    onError: (error) => {
      console.error("Failed to update user:", error)
      alert("Failed to update user")
    },
  })

  // Mutation: Delete user
  const deleteUserMutation = useDeleteUser({
    onSuccess: () => {
      alert("User deleted successfully!")
      setSelectedUserId(null)
    },
    onError: (error) => {
      console.error("Failed to delete user:", error)
      alert("Failed to delete user")
    },
  })

  // Handlers
  const handleToggleActive = (userId: string, currentStatus: boolean) => {
    updateUserMutation.mutate({
      id: userId,
      data: { is_active: !currentStatus },
    })
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(userId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <Card>
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Button onClick={() => refetchUsers()} variant="outline">
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingUsers && <p>Loading users...</p>}

          {usersError && (
            <p className="text-red-500">
              Error loading users: {usersError.message}
            </p>
          )}

          {usersData && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Total users: {usersData.count}
              </p>

              {usersData.results.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border rounded hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <p className="font-medium">{user.full_name || user.username}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedUserId(user.id)}
                    >
                      View
                    </Button>

                    <Button
                      size="sm"
                      variant={user.is_active ? "outline" : "default"}
                      onClick={() => handleToggleActive(user.id, user.is_active)}
                      disabled={updateUserMutation.isPending}
                    >
                      {user.is_active ? "Deactivate" : "Activate"}
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={deleteUserMutation.isPending}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected User Details */}
      {selectedUserId && (
        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingUser && <p>Loading user details...</p>}

            {selectedUser && (
              <div className="space-y-2">
                <p><strong>ID:</strong> {selectedUser.id}</p>
                <p><strong>Username:</strong> {selectedUser.username}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Full Name:</strong> {selectedUser.full_name}</p>
                <p><strong>Active:</strong> {selectedUser.is_active ? "Yes" : "No"}</p>
                <p><strong>Staff:</strong> {selectedUser.is_staff ? "Yes" : "No"}</p>
                <p><strong>Created:</strong> {new Date(selectedUser.created_at).toLocaleString()}</p>

                <Button
                  variant="outline"
                  onClick={() => setSelectedUserId(null)}
                  className="mt-4"
                >
                  Close
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading States */}
      {updateUserMutation.isPending && (
        <p className="text-sm text-muted-foreground">Updating user...</p>
      )}
      {deleteUserMutation.isPending && (
        <p className="text-sm text-muted-foreground">Deleting user...</p>
      )}
    </div>
  )
}
