"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { getContact, updateContact, type ContactFormData, type AccessLevel, type ContactType } from "@/lib/api/crm"
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
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

const accessLevelOptions: { value: AccessLevel; label: string }[] = [
  { value: 'public', label: 'Public' },
  { value: 'internal', label: 'Internal' },
  { value: 'restricted', label: 'Restricted' },
  { value: 'vip', label: 'VIP' },
  { value: 'vvip', label: 'VVIP' },
]

const contactTypeOptions: { value: ContactType; label: string }[] = [
  { value: 'individual', label: 'Individual' },
  { value: 'organization', label: 'Organization' },
]

export default function EditContactPage() {
  const params = useParams()
  const router = useRouter()
  const contactId = params.id as string
  const queryClient = useQueryClient()
  

  const [formData, setFormData] = useState<Partial<ContactFormData>>({})
  const [tagsInput, setTagsInput] = useState('')
  const [expertiseInput, setExpertiseInput] = useState('')
  const [languagesInput, setLanguagesInput] = useState('')

  // Fetch contact details
  const { data: contact, isLoading } = useQuery({
    queryKey: ['contact', contactId],
    queryFn: () => getContact(contactId),
  })

  // Initialize form data when contact is loaded
  useEffect(() => {
    if (contact) {
      setFormData({
        first_name: contact.first_name,
        last_name: contact.last_name,
        middle_name: contact.middle_name,
        prefix: contact.prefix,
        suffix: contact.suffix,
        email_primary: contact.email_primary,
        email_secondary: contact.email_secondary,
        phone_primary: contact.phone_primary,
        phone_secondary: contact.phone_secondary,
        phone_mobile: contact.phone_mobile,
        linkedin_url: contact.linkedin_url,
        twitter_handle: contact.twitter_handle,
        address: contact.address,
        city: contact.city,
        country: contact.country,
        biography: contact.biography,
        expertise_areas: contact.expertise_areas,
        languages: contact.languages,
        access_level: contact.access_level,
        contact_type: contact.contact_type,
        photo_url: contact.photo_url,
        tags: contact.tags,
        is_active: contact.is_active,
      })
      setTagsInput(contact.tags?.join(', ') || '')
      setExpertiseInput(contact.expertise_areas?.join(', ') || '')
      setLanguagesInput(contact.languages?.join(', ') || '')
    }
  }, [contact])

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<ContactFormData>) => updateContact(contactId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact', contactId] })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast({
        title: "Success",
        description: "Contact updated successfully",
      })
      router.push(`/admin-ops/crm/contacts/${contactId}`)
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update contact",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Parse comma-separated inputs
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    const expertise_areas = expertiseInput.split(',').map(e => e.trim()).filter(Boolean)
    const languages = languagesInput.split(',').map(l => l.trim()).filter(Boolean)

    updateMutation.mutate({
      ...formData,
      tags,
      expertise_areas,
      languages,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="flex flex-col items-center gap-2">
          <Icon name="Loading" size={32} className="animate-spin" />
          <p className="text-muted-foreground">Loading contact...</p>
        </div>
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <p className="text-muted-foreground">Contact not found</p>
      </div>
    )
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
                  <BreadcrumbLink href="/admin-ops/crm/contacts">Contacts</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Edit Contact</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Edit Contact</h1>
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>

          <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prefix">Prefix</Label>
                  <Input
                    id="prefix"
                    value={formData.prefix || ''}
                    onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                    placeholder="Dr., Prof., etc."
                  />
                </div>
                <div>
                  <Label htmlFor="suffix">Suffix</Label>
                  <Input
                    id="suffix"
                    value={formData.suffix || ''}
                    onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                    placeholder="Ph.D., MBA, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    required
                    value={formData.first_name || ''}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="middle_name">Middle Name</Label>
                  <Input
                    id="middle_name"
                    value={formData.middle_name || ''}
                    onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    required
                    value={formData.last_name || ''}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
              </div>
            </Card>

            {/* Contact Details */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Contact Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="email_primary">Primary Email</Label>
                  <Input
                    id="email_primary"
                    type="email"
                    value={formData.email_primary || ''}
                    onChange={(e) => setFormData({ ...formData, email_primary: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="email_secondary">Secondary Email</Label>
                  <Input
                    id="email_secondary"
                    type="email"
                    value={formData.email_secondary || ''}
                    onChange={(e) => setFormData({ ...formData, email_secondary: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone_mobile">Mobile Phone</Label>
                  <Input
                    id="phone_mobile"
                    value={formData.phone_mobile || ''}
                    onChange={(e) => setFormData({ ...formData, phone_mobile: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone_primary">Primary Phone</Label>
                  <Input
                    id="phone_primary"
                    value={formData.phone_primary || ''}
                    onChange={(e) => setFormData({ ...formData, phone_primary: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="phone_secondary">Secondary Phone</Label>
                  <Input
                    id="phone_secondary"
                    value={formData.phone_secondary || ''}
                    onChange={(e) => setFormData({ ...formData, phone_secondary: e.target.value })}
                  />
                </div>
              </div>
            </Card>

            {/* Address */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Address</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Street Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city || ''}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div>
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

            {/* Social Media */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Social Media</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                  <Input
                    id="linkedin_url"
                    type="url"
                    value={formData.linkedin_url || ''}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div>
                  <Label htmlFor="twitter_handle">Twitter Handle</Label>
                  <Input
                    id="twitter_handle"
                    value={formData.twitter_handle || ''}
                    onChange={(e) => setFormData({ ...formData, twitter_handle: e.target.value })}
                    placeholder="@username"
                  />
                </div>
              </div>
            </Card>

            {/* Professional Information */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Professional Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="biography">Biography</Label>
                  <Textarea
                    id="biography"
                    value={formData.biography || ''}
                    onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                    rows={5}
                  />
                </div>
                <div>
                  <Label htmlFor="expertise">Expertise Areas (comma-separated)</Label>
                  <Input
                    id="expertise"
                    value={expertiseInput}
                    onChange={(e) => setExpertiseInput(e.target.value)}
                    placeholder="Policy, Economics, Technology"
                  />
                </div>
                <div>
                  <Label htmlFor="languages">Languages (comma-separated)</Label>
                  <Input
                    id="languages"
                    value={languagesInput}
                    onChange={(e) => setLanguagesInput(e.target.value)}
                    placeholder="English, Indonesian, Mandarin"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Settings */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Settings</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="access_level">Access Level</Label>
                  <Select
                    value={formData.access_level}
                    onValueChange={(value: AccessLevel) => setFormData({ ...formData, access_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
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

                <div>
                  <Label htmlFor="contact_type">Contact Type</Label>
                  <Select
                    value={formData.contact_type}
                    onValueChange={(value: ContactType) => setFormData({ ...formData, contact_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contactTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="photo_url">Photo URL</Label>
                  <Input
                    id="photo_url"
                    type="url"
                    value={formData.photo_url || ''}
                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="VIP, Speaker, Partner"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active ?? true}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="is_active" className="cursor-pointer">
                    Active
                  </Label>
                </div>
              </div>
            </Card>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
