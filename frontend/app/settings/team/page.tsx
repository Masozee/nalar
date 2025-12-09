"use client"

import { useState } from "react"
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
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Icon } from "@/components/ui/icon"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { tenantUserApi, invitationApi, type TenantUser, type TenantInvitation } from "@/lib/api/tenants"
import { toast } from "sonner"
import { format } from "date-fns"

export default function TeamManagementPage() {
  const queryClient = useQueryClient()
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "member",
    message: "",
  })

  // Fetch team members
  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: () => tenantUserApi.listUsers(),
  })

  // Fetch pending invitations
  const { data: invitationsData, isLoading: invitationsLoading } = useQuery({
    queryKey: ['pending-invitations'],
    queryFn: () => invitationApi.listPendingInvitations(),
  })

  const members = membersData?.results || []
  const invitations = invitationsData?.results || []

  // Send invitation mutation
  const sendInviteMutation = useMutation({
    mutationFn: (data: { email: string; role: string; message?: string }) =>
      invitationApi.sendInvitation(data),
    onSuccess: () => {
      toast.success("Invitation sent successfully")
      setShowInviteDialog(false)
      setInviteForm({ email: "", role: "member", message: "" })
      queryClient.invalidateQueries({ queryKey: ['pending-invitations'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to send invitation")
    },
  })

  // Remove user mutation
  const removeMutation = useMutation({
    mutationFn: (id: string) => tenantUserApi.removeUser(id),
    onSuccess: () => {
      toast.success("User removed from team")
      queryClient.invalidateQueries({ queryKey: ['team-members'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to remove user")
    },
  })

  // Cancel invitation mutation
  const cancelInviteMutation = useMutation({
    mutationFn: (id: string) => invitationApi.cancelInvitation(id),
    onSuccess: () => {
      toast.success("Invitation cancelled")
      queryClient.invalidateQueries({ queryKey: ['pending-invitations'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to cancel invitation")
    },
  })

  const handleInvite = () => {
    sendInviteMutation.mutate(inviteForm)
  }

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      owner: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      admin: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      manager: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      member: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      viewer: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    }
    return colors[role] || "bg-gray-100 text-gray-800"
  }

  return (
    <>
      <header className="bg-background sticky top-0 z-10 flex shrink-0 items-center justify-between gap-2 border-b p-4">
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
                <BreadcrumbPage>Team Management</BreadcrumbPage>
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
            <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
            <p className="text-muted-foreground">
              Manage team members and invite new users to your organization
            </p>
          </div>
          <Button onClick={() => setShowInviteDialog(true)}>
            <Icon name="UserPlus" className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        </div>

        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              {members.length} {members.length === 1 ? 'member' : 'members'} in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {membersLoading ? (
              <div className="flex justify-center py-8">
                <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No team members found
              </div>
            ) : (
              <div className="space-y-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon name="User" size={20} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {member.user.first_name} {member.user.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{member.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getRoleBadgeColor(member.role)}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Remove ${member.user.first_name} from team?`)) {
                            removeMutation.mutate(member.id)
                          }
                        }}
                        disabled={removeMutation.isPending}
                      >
                        <Icon name="Trash" size={16} className="text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Invitations */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>
              Users who have been invited but haven't accepted yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invitationsLoading ? (
              <div className="flex justify-center py-8">
                <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
              </div>
            ) : invitations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending invitations
              </div>
            ) : (
              <div className="space-y-4">
                {invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                        <Icon name="Mail" size={20} className="text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <p className="font-medium">{invitation.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Invited {format(new Date(invitation.invited_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getRoleBadgeColor(invitation.role)}>
                        {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Cancel invitation for ${invitation.email}?`)) {
                            cancelInviteMutation.mutate(invitation.id)
                          }
                        }}
                        disabled={cancelInviteMutation.isPending}
                      >
                        <Icon name="X" size={16} className="text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your organization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={inviteForm.role}
                onValueChange={(value) => setInviteForm({ ...inviteForm, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                  <SelectItem value="member">Member - Standard access</SelectItem>
                  <SelectItem value="manager">Manager - Department management</SelectItem>
                  <SelectItem value="admin">Admin - Full access</SelectItem>
                  <SelectItem value="owner">Owner - Complete control</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Personal Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Welcome to the team!"
                value={inviteForm.message}
                onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={sendInviteMutation.isPending || !inviteForm.email}>
              {sendInviteMutation.isPending && (
                <Icon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
              )}
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
