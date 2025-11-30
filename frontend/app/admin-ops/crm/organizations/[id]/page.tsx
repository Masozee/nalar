"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { getOrganization, getContacts, type OrganizationType } from "@/lib/api/crm"
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
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import Link from "next/link"

const orgTypeLabels: Record<OrganizationType, string> = {
  government: "Government",
  corporate: "Corporate",
  ngo: "NGO/Non-Profit",
  education: "Education",
  media: "Media",
  partner: "Partner",
  vendor: "Vendor",
  donor: "Donor",
  other: "Other",
}

const orgTypeColors: Record<OrganizationType, string> = {
  government: "bg-blue-100 text-blue-800 border-blue-300",
  corporate: "bg-purple-100 text-purple-800 border-purple-300",
  ngo: "bg-green-100 text-green-800 border-green-300",
  education: "bg-indigo-100 text-indigo-800 border-indigo-300",
  media: "bg-orange-100 text-orange-800 border-orange-300",
  partner: "bg-teal-100 text-teal-800 border-teal-300",
  vendor: "bg-yellow-100 text-yellow-800 border-yellow-300",
  donor: "bg-pink-100 text-pink-800 border-pink-300",
  other: "bg-gray-100 text-gray-800 border-gray-300",
}

export default function OrganizationDetailPage() {
  const params = useParams()
  const organizationId = params.id as string

  // Fetch organization details
  const { data: organization, isLoading: orgLoading } = useQuery({
    queryKey: ['organization', organizationId],
    queryFn: () => getOrganization(organizationId),
  })

  // Fetch contacts from this organization
  const { data: contactsData } = useQuery({
    queryKey: ['organization-contacts', organizationId],
    queryFn: () => getContacts({ 'positions__organization': organizationId }),
    enabled: !!organizationId,
  })

  const contacts = contactsData?.results || []

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="flex flex-col items-center gap-2">
          <Icon name="Loading" size={32} className="animate-spin" />
          <p className="text-muted-foreground">Loading organization...</p>
        </div>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <Icon name="Building" size={48} className="mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Organization not found</h2>
          <p className="text-muted-foreground mb-4">
            The organization you're looking for doesn't exist or you don't have access.
          </p>
          <Button asChild>
            <Link href="/admin-ops/crm/organizations">Back to Organizations</Link>
          </Button>
        </div>
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
                  <BreadcrumbLink href="/admin-ops/crm/organizations">Organizations</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{organization?.name || 'Organization'}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {organization.logo ? (
            <img
              src={organization.logo}
              alt={organization.name}
              className="w-20 h-20 rounded object-contain"
            />
          ) : (
            <div className="w-20 h-20 rounded bg-primary/10 flex items-center justify-center">
              <Icon name="Building" size={32} className="text-primary" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold">{organization.name}</h1>
              <Badge variant="outline" className={orgTypeColors[organization.organization_type]}>
                {orgTypeLabels[organization.organization_type]}
              </Badge>
              {!organization.is_active && (
                <Badge variant="outline" className="bg-gray-100 text-gray-800">
                  Inactive
                </Badge>
              )}
            </div>
            {organization.industry && (
              <p className="text-lg text-muted-foreground">{organization.industry}</p>
            )}
            {organization.tags && organization.tags.length > 0 && (
              <div className="flex gap-1 mt-2">
                {organization.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        {organization.email && (
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <Button variant="outline" size="sm" className="rounded-r-none" asChild>
              <Link href={`/admin-ops/crm/organizations/${organizationId}/edit`}>
                Edit
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="rounded-l-none border-l-0" asChild>
              <a href={`mailto:${organization.email}`}>
                Email
              </a>
            </Button>
          </div>
        )}
        {!organization.email && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin-ops/crm/organizations/${organizationId}/edit`}>
              Edit
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Organization Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Contact Information */}
          <div>
            <h3 className="font-semibold mb-4">
              Organization Information
            </h3>
            <div className="space-y-3">
              {organization.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a href={`mailto:${organization.email}`} className="text-sm text-blue-600 hover:underline">
                    {organization.email}
                  </a>
                </div>
              )}
              {organization.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="text-sm">{organization.phone}</p>
                </div>
              )}
              {organization.website && (
                <div>
                  <p className="text-sm text-muted-foreground">Website</p>
                  <a
                    href={organization.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {organization.website}
                  </a>
                </div>
              )}
              {organization.address && (
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="text-sm">{organization.address}</p>
                  {(organization.city || organization.country) && (
                    <p className="text-sm text-muted-foreground">
                      {organization.city}{organization.city && organization.country ? ', ' : ''}{organization.country}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="contacts">
                Contacts {contacts.length > 0 && `(${contacts.length})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Description */}
              {organization.description && (
                <Card className="p-6">
                  <h3 className="font-semibold mb-3">About</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {organization.description}
                  </p>
                </Card>
              )}

              {/* Statistics */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Contacts</p>
                    <p className="text-2xl font-bold">
                      {organization.contact_count || contacts.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Organization Type</p>
                    <p className="text-sm font-medium">
                      {orgTypeLabels[organization.organization_type]}
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="contacts" className="space-y-4">
              {contacts.length > 0 ? (
                <Card>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left p-4 font-medium text-sm">Name</th>
                          <th className="text-left p-4 font-medium text-sm">Position</th>
                          <th className="text-left p-4 font-medium text-sm">Email</th>
                          <th className="text-left p-4 font-medium text-sm">Phone</th>
                          <th className="text-right p-4 font-medium text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.map((contact: any) => (
                          <tr key={contact.id} className="border-b last:border-0 hover:bg-muted/50">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                {contact.photo_url ? (
                                  <img
                                    src={contact.photo_url}
                                    alt={contact.full_name}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-xs font-medium text-primary">
                                      {contact.first_name?.[0]}
                                      {contact.last_name?.[0]}
                                    </span>
                                  </div>
                                )}
                                <Link
                                  href={`/admin-ops/crm/contacts/${contact.id}`}
                                  className="font-medium hover:underline"
                                >
                                  {contact.full_name || `${contact.first_name} ${contact.last_name}`}
                                </Link>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="text-sm text-muted-foreground">
                                {contact.primary_position?.title || '—'}
                              </span>
                            </td>
                            <td className="p-4">
                              {contact.email_primary ? (
                                <a
                                  href={`mailto:${contact.email_primary}`}
                                  className="text-sm text-blue-600 hover:underline"
                                >
                                  {contact.email_primary}
                                </a>
                              ) : (
                                <span className="text-sm text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="p-4">
                              <span className="text-sm">
                                {contact.phone_mobile || contact.phone_primary || '—'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/admin-ops/crm/contacts/${contact.id}`}>
                                  <Icon name="ArrowRight" size={16} />
                                </Link>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              ) : (
                <Card className="p-12 text-center">
                  <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No contacts at this organization yet</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin-ops/crm/contacts/new">
                      Add Contact
                    </Link>
                  </Button>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
