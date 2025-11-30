"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { getContact, getContactNotes, getContactActivities, type AccessLevel } from "@/lib/api/crm"
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
import { format } from "date-fns"

const accessLevelColors: Record<AccessLevel, string> = {
  public: "bg-gray-100 text-gray-800 border-gray-300",
  internal: "bg-blue-100 text-blue-800 border-blue-300",
  restricted: "bg-yellow-100 text-yellow-800 border-yellow-300",
  vip: "bg-purple-100 text-purple-800 border-purple-300",
  vvip: "bg-red-100 text-red-800 border-red-300",
}

const accessLevelLabels: Record<AccessLevel, string> = {
  public: "Public",
  internal: "Internal",
  restricted: "Restricted",
  vip: "VIP",
  vvip: "VVIP",
}

export default function ContactDetailPage() {
  const params = useParams()
  const contactId = params.id as string

  // Fetch contact details
  const { data: contact, isLoading: contactLoading } = useQuery({
    queryKey: ['contact', contactId],
    queryFn: () => getContact(contactId),
  })

  // Fetch notes
  const { data: notesData } = useQuery({
    queryKey: ['contact-notes', contactId],
    queryFn: () => getContactNotes({ contact: contactId }),
  })

  // Fetch activities
  const { data: activitiesData } = useQuery({
    queryKey: ['contact-activities', contactId],
    queryFn: () => getContactActivities({ contact: contactId }),
  })

  const notes = notesData?.results || []
  const activities = activitiesData?.results || []

  if (contactLoading) {
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
        <div className="text-center">
          <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Contact not found</h2>
          <p className="text-muted-foreground mb-4">
            The contact you're looking for doesn't exist or you don't have access.
          </p>
          <Button asChild>
            <Link href="/admin-ops/crm/contacts">Back to Contacts</Link>
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
                  <BreadcrumbLink href="/admin-ops/crm/contacts">Contacts</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{contact?.full_name || 'Contact'}</BreadcrumbPage>
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
          {contact.photo_url ? (
            <img
              src={contact.photo_url}
              alt={contact.full_name}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {contact.first_name?.[0]}
                {contact.last_name?.[0]}
              </span>
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold">
                {contact.prefix} {contact.first_name} {contact.middle_name} {contact.last_name} {contact.suffix}
              </h1>
              <Badge variant="outline" className={accessLevelColors[contact.access_level]}>
                {accessLevelLabels[contact.access_level]}
              </Badge>
              {!contact.is_active && (
                <Badge variant="outline" className="bg-gray-100 text-gray-800">
                  Inactive
                </Badge>
              )}
            </div>
            {contact.tags && contact.tags.length > 0 && (
              <div className="flex gap-1 mt-2">
                {contact.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Positions below name */}
            {contact.positions && contact.positions.length > 0 && (
              <div className="mt-4 space-y-1">
                {contact.positions.map((position) => (
                  <p key={position.id} className="text-sm text-muted-foreground">
                    {position.title} at {position.organization_name}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <Button variant="outline" size="sm" className="rounded-r-none" asChild>
            <Link href={`/admin-ops/crm/contacts/${contactId}/edit`}>
              Edit
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="rounded-l-none border-l-0" asChild>
            <a href={`mailto:${contact.email_primary}`}>
              Email
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Contact Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Contact Details */}
          <div>
            <h3 className="font-semibold mb-4">
              Contact Information
            </h3>
            <div className="space-y-4">
              {/* Email & Phone */}
              {contact.email_primary && (
                <div>
                  <p className="text-sm text-muted-foreground">Primary Email</p>
                  <a href={`mailto:${contact.email_primary}`} className="text-sm text-blue-600 hover:underline">
                    {contact.email_primary}
                  </a>
                </div>
              )}
              {contact.email_secondary && (
                <div>
                  <p className="text-sm text-muted-foreground">Secondary Email</p>
                  <a href={`mailto:${contact.email_secondary}`} className="text-sm text-blue-600 hover:underline">
                    {contact.email_secondary}
                  </a>
                </div>
              )}
              {contact.phone_mobile && (
                <div>
                  <p className="text-sm text-muted-foreground">Mobile</p>
                  <p className="text-sm">{contact.phone_mobile}</p>
                </div>
              )}
              {contact.phone_primary && (
                <div>
                  <p className="text-sm text-muted-foreground">Primary Phone</p>
                  <p className="text-sm">{contact.phone_primary}</p>
                </div>
              )}
              {contact.phone_secondary && (
                <div>
                  <p className="text-sm text-muted-foreground">Secondary Phone</p>
                  <p className="text-sm">{contact.phone_secondary}</p>
                </div>
              )}
              {contact.address && (
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="text-sm">{contact.address}</p>
                  {(contact.city || contact.country) && (
                    <p className="text-sm text-muted-foreground">
                      {contact.city}{contact.city && contact.country ? ', ' : ''}{contact.country}
                    </p>
                  )}
                </div>
              )}

              {/* Social Media */}
              {(contact.linkedin_url || contact.twitter_handle) && (
                <>
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-semibold mb-2">Social Media</p>
                  </div>
                  {contact.linkedin_url && (
                    <div>
                      <p className="text-sm text-muted-foreground">LinkedIn</p>
                      <a
                        href={contact.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View Profile
                      </a>
                    </div>
                  )}
                  {contact.twitter_handle && (
                    <div>
                      <p className="text-sm text-muted-foreground">Twitter</p>
                      <a
                        href={`https://twitter.com/${contact.twitter_handle.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        @{contact.twitter_handle.replace('@', '')}
                      </a>
                    </div>
                  )}
                </>
              )}

              {/* Management Info */}
              <div className="border-t pt-4 mt-4">
                <p className="text-sm font-semibold mb-2">Management</p>
              </div>
              {contact.assigned_to_name && (
                <div>
                  <p className="text-sm text-muted-foreground">Assigned To</p>
                  <p className="text-sm">{contact.assigned_to_name}</p>
                </div>
              )}
              {contact.last_contacted_at && (
                <div>
                  <p className="text-sm text-muted-foreground">Last Contacted</p>
                  <p className="text-sm">{format(new Date(contact.last_contacted_at), 'PPP')}</p>
                </div>
              )}

              {/* Expertise */}
              {contact.expertise_areas && contact.expertise_areas.length > 0 && (
                <>
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-semibold mb-2">Expertise</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {contact.expertise_areas.map((area) => (
                      <Badge key={area} variant="outline">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </>
              )}

              {/* Languages */}
              {contact.languages && contact.languages.length > 0 && (
                <>
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-semibold mb-2">Languages</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {contact.languages.map((lang) => (
                      <Badge key={lang} variant="secondary">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="activities" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="activities" className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity: any) => (
                  <Card key={activity.id} className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{activity.title}</h4>
                          <Badge variant="outline">{activity.activity_type}</Badge>
                          {activity.requires_followup && !activity.followup_completed && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                              Follow-up Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(activity.activity_date), 'PPP p')}
                        </p>
                      </div>
                    </div>
                    {activity.description && (
                      <p className="text-sm mb-3">{activity.description}</p>
                    )}
                    {activity.outcome && (
                      <div className="mb-3">
                        <p className="text-sm font-medium mb-1">Outcome:</p>
                        <p className="text-sm text-muted-foreground">{activity.outcome}</p>
                      </div>
                    )}
                    {activity.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Icon name="MapPin" size={14} />
                        {activity.location}
                      </p>
                    )}
                  </Card>
                ))
              ) : (
                <Card className="p-12 text-center">
                  <Icon name="Calendar" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No activities recorded</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              {notes.length > 0 ? (
                notes.map((note: any) => (
                  <Card key={note.id} className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        {note.title && <h4 className="font-semibold mb-1">{note.title}</h4>}
                        <p className="text-xs text-muted-foreground">
                          {note.author_name} · {format(new Date(note.created_at), 'PPP')}
                        </p>
                      </div>
                      {note.is_private && (
                        <Badge variant="outline" className="bg-gray-50">
                          <Icon name="Lock" size={12} className="mr-1" />
                          Private
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                  </Card>
                ))
              ) : (
                <Card className="p-12 text-center">
                  <Icon name="FileText" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No notes added yet</p>
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
