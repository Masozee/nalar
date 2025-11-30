"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { createOrganization, type OrganizationFormData, type AccessLevel, type OrganizationType } from "@/lib/api/crm"
import { AppSidebar } from "@/components/app-sidebar"
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
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icon } from "@/components/ui/icon"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

const accessLevelOptions: { value: AccessLevel; label: string }[] = [
  { value: 'public', label: 'Public' },
  { value: 'internal', label: 'Internal' },
  { value: 'restricted', label: 'Restricted' },
  { value: 'vip', label: 'VIP' },
  { value: 'vvip', label: 'VVIP' },
]

const organizationTypeOptions: { value: OrganizationType; label: string }[] = [
  { value: 'government', label: 'Government' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'ngo', label: 'NGO/Non-Profit' },
  { value: 'education', label: 'Education' },
  { value: 'media', label: 'Media' },
  { value: 'partner', label: 'Partner' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'donor', label: 'Donor' },
  { value: 'other', label: 'Other' },
]

export default function NewOrganizationPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [formData, setFormData] = useState<Partial<OrganizationFormData>>({
    access_level: 'public',
    organization_type: 'other',
  })
  const [tagsInput, setTagsInput] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: OrganizationFormData) => createOrganization(data),
    onSuccess: (newOrg) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      toast({
        title: "Success",
        description: "Organization created successfully",
      })
      router.push(`/admin-ops/crm/organizations/${newOrg.id}`)
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create organization",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name) {
      toast({
        title: "Error",
        description: "Organization name is required",
        variant: "destructive",
      })
      return
    }

    // Parse comma-separated tags
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)

    // Use the base64 preview as logo if file was uploaded
    let logoUrl = logoPreview || formData.logo

    // Check if base64 is too large
    if (logoPreview && logoPreview.length > 500000) {
      toast({
        title: "Error",
        description: "Image file is too large. Please use a smaller image or provide a URL instead.",
        variant: "destructive",
      })
      return
    }

    createMutation.mutate({
      ...formData,
      name: formData.name,
      tags,
      logo: logoUrl,
    } as OrganizationFormData)
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": "350px" } as React.CSSProperties}>
      <AppSidebar />
      <SidebarInset>
        <header className="bg-background sticky top-0 flex shrink-0 items-center justify-between gap-2 border-b p-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin-ops">Admin Ops</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin-ops/crm">CRM</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin-ops/crm/organizations">Organizations</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>New</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">New Organization</h1>
              <p className="text-muted-foreground">Create a new organization</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Organization Name *</Label>
                    <Input
                      id="name"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="organization_type">Type</Label>
                      <Select
                        value={formData.organization_type}
                        onValueChange={(value) => setFormData({ ...formData, organization_type: value as OrganizationType })}
                      >
                        <SelectTrigger id="organization_type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {organizationTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        value={formData.industry || ''}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website || ''}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city || ''}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={formData.country || ''}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="access_level">Access Level</Label>
                    <Select
                      value={formData.access_level}
                      onValueChange={(value) => setFormData({ ...formData, access_level: value as AccessLevel })}
                    >
                      <SelectTrigger id="access_level">
                        <SelectValue placeholder="Select access level" />
                      </SelectTrigger>
                      <SelectContent>
                        {accessLevelOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="logo">Logo</Label>
                    {logoPreview && (
                      <div className="mb-2">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-32 h-32 object-contain border rounded"
                        />
                      </div>
                    )}
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload an image file for the organization logo
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="e.g. partner, government, research"
                    />
                  </div>
                </div>
              </Card>

              <div className="flex items-center gap-4">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <Icon name="Loading" size={16} className="mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Icon name="Plus" size={16} className="mr-2" />
                      Create Organization
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin-ops/crm/organizations')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
