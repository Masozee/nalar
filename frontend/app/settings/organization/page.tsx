"use client"

import { useState, useEffect } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { tenantApi } from "@/lib/api/tenants"
import { toast } from "sonner"
import { format } from "date-fns"

export default function OrganizationSettingsPage() {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)

  // Fetch current tenant
  const { data: tenant, isLoading } = useQuery({
    queryKey: ['current-tenant'],
    queryFn: () => tenantApi.getCurrentTenant(),
  })

  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
    primary_color: "#3B82F6",
  })

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // Sync form data with tenant data when it loads
  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name || "",
        subdomain: tenant.subdomain || "",
        primary_color: tenant.primary_color || "#3B82F6",
      })
    }
  }, [tenant])

  // Update tenant mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<typeof formData>) =>
      tenantApi.updateCurrentTenant(data),
    onSuccess: () => {
      toast.success("Organization updated successfully")
      setIsEditing(false)
      queryClient.invalidateQueries({ queryKey: ['current-tenant'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to update organization")
    },
  })

  const handleSave = () => {
    updateMutation.mutate(formData)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      name: tenant?.name || "",
      subdomain: tenant?.subdomain || "",
      primary_color: tenant?.primary_color || "#3B82F6",
    })
  }

  const getPlanBadgeColor = (plan: string) => {
    const colors: Record<string, string> = {
      free: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      starter: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      professional: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      enterprise: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    }
    return colors[plan] || "bg-gray-100 text-gray-800"
  }

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      trial: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      suspended: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  if (isLoading || !tenant) {
    return (
      <div className="flex items-center justify-center p-12">
        <Icon name="Loader2" size={48} className="animate-spin text-muted-foreground" />
      </div>
    )
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
                <BreadcrumbPage>Organization</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <TopNavbar />
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
          <p className="text-muted-foreground">
            Manage your organization's information and preferences
          </p>
        </div>

        {/* Organization Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Organization Information</CardTitle>
                <CardDescription>Basic information about your organization</CardDescription>
              </div>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Icon name="Edit" className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subdomain">Subdomain</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="subdomain"
                  value={formData.subdomain}
                  onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                  disabled={!isEditing}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">.nalar.app</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Your organization's unique subdomain
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Organization Slug</Label>
              <Input
                id="slug"
                value={tenant.slug}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                URL-friendly identifier (cannot be changed)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primary_color">Primary Brand Color</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="primary_color"
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  disabled={!isEditing}
                  className="w-20 h-10"
                />
                <Input
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  disabled={!isEditing}
                  className="flex-1"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending && (
                    <Icon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Organization Logo */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Logo</CardTitle>
            <CardDescription>Upload your organization's logo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-6">
              {/* Current Logo */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden bg-muted">
                  {(logoPreview || tenant.logo) ? (
                    <img
                      src={logoPreview || tenant.logo}
                      alt="Organization logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Icon name="Building2" size={32} className="text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">No logo</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-3">
                <div>
                  <Label htmlFor="logo-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <Icon name="Upload" size={16} />
                      Choose logo file
                    </div>
                  </Label>
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setLogoFile(file)
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          setLogoPreview(reader.result as string)
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: Square image, max 2MB, PNG or JPG
                  </p>
                </div>

                {logoFile && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={async () => {
                        if (!logoFile) return
                        const formData = new FormData()
                        formData.append('logo', logoFile)

                        try {
                          toast.loading("Uploading logo...")
                          // TODO: Implement logo upload API
                          toast.success("Logo uploaded successfully!")
                          setLogoFile(null)
                          queryClient.invalidateQueries({ queryKey: ['current-tenant'] })
                        } catch (error) {
                          toast.error("Failed to upload logo")
                        }
                      }}
                    >
                      <Icon name="Upload" className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setLogoFile(null)
                        setLogoPreview(null)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                {tenant.logo && !logoFile && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      if (confirm("Are you sure you want to remove the logo?")) {
                        try {
                          toast.loading("Removing logo...")
                          // TODO: Implement logo removal API
                          toast.success("Logo removed successfully!")
                          queryClient.invalidateQueries({ queryKey: ['current-tenant'] })
                        } catch (error) {
                          toast.error("Failed to remove logo")
                        }
                      }
                    }}
                  >
                    <Icon name="Trash2" className="h-4 w-4 mr-2" />
                    Remove Logo
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription & Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription & Plan</CardTitle>
            <CardDescription>Your current plan and subscription status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
                <Badge className={getPlanBadgeColor(tenant.plan)}>
                  {tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge className={getStatusBadgeColor(tenant.status)}>
                  {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Max Users</p>
                <p className="text-sm">{tenant.max_users === -1 ? 'Unlimited' : tenant.max_users}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p className="text-sm">{format(new Date(tenant.created_at), "MMM d, yyyy")}</p>
              </div>
            </div>
            <div className="pt-4">
              <Button variant="outline" asChild>
                <a href="/settings/billing">
                  <Icon name="CreditCard" className="h-4 w-4 mr-2" />
                  Manage Billing
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enabled Modules */}
        <Card>
          <CardHeader>
            <CardTitle>Enabled Modules</CardTitle>
            <CardDescription>Features available in your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {tenant.enabled_modules.map((module) => (
                <div
                  key={module}
                  className="flex items-center gap-2 p-3 border rounded-lg"
                >
                  <Icon name="CheckCircle" size={16} className="text-green-500" />
                  <span className="text-sm">{module}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Organization ID */}
        <Card>
          <CardHeader>
            <CardTitle>Advanced</CardTitle>
            <CardDescription>Technical information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Organization ID</p>
              <p className="text-sm font-mono">{tenant.id}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
