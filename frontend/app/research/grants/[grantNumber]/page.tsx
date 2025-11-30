"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Icon } from "@/components/ui/icon"
import { DataTable } from "@/components/ui/data-table"
import { grantApi, grantMilestoneApi, grantDisbursementApi } from "@/lib/api/research"
import { milestoneColumns } from "./milestone-columns"
import { disbursementColumns } from "./disbursement-columns"

type Props = {
  params: Promise<{
    grantNumber: string
  }>
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800 border-gray-200",
    submitted: "bg-blue-100 text-blue-800 border-blue-200",
    under_review: "bg-yellow-100 text-yellow-800 border-yellow-200",
    approved: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    active: "bg-indigo-100 text-indigo-800 border-indigo-200",
    completed: "bg-purple-100 text-purple-800 border-purple-200",
    cancelled: "bg-gray-100 text-gray-800 border-gray-200",
  }
  return colors[status] || "bg-gray-100 text-gray-800"
}

function formatCurrency(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num)
}

function formatDate(date: string | null | undefined): string {
  if (!date) return "-"
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

export default function GrantDetailPage({ params }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const { grantNumber } = use(params)

  // Fetch grant details
  const { data: grantsResponse, isLoading: grantLoading } = useQuery({
    queryKey: ["grant", grantNumber],
    queryFn: () => grantApi.list({ grant_number: grantNumber }),
  })

  const grant = grantsResponse?.results?.find(g => g.grant_number === grantNumber)

  // Fetch milestones
  const { data: milestonesData } = useQuery({
    queryKey: ["milestones", grant?.id],
    queryFn: () => grantMilestoneApi.list({ grant: grant?.id }),
    enabled: !!grant?.id,
  })

  // Fetch disbursements
  const { data: disbursementsData } = useQuery({
    queryKey: ["disbursements", grant?.id],
    queryFn: () => grantDisbursementApi.list({ grant: grant?.id }),
    enabled: !!grant?.id,
  })

  const milestones = milestonesData?.results || []
  const disbursements = disbursementsData?.results || []

  if (grantLoading) {
    return (
      <SidebarProvider style={{ "--sidebar-width": "16rem" } as React.CSSProperties}>
        <AppSidebar />
        <SidebarInset>
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
                    <BreadcrumbLink href="/research">Research</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/research/grants">Grants</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{grantNumber}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <TopNavbar />
          </header>
          <div className="flex items-center justify-center h-96">
            <div className="text-muted-foreground">Loading grant details...</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!grant) {
    return (
      <SidebarProvider style={{ "--sidebar-width": "16rem" } as React.CSSProperties}>
        <AppSidebar />
        <SidebarInset>
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
                    <BreadcrumbLink href="/research">Research</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/research/grants">Grants</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{grantNumber}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <TopNavbar />
          </header>
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <Icon name="Search" size={48} className="text-muted-foreground" />
            <div className="text-xl font-semibold">Grant Not Found</div>
            <p className="text-muted-foreground">The grant "{grantNumber}" does not exist.</p>
            <Button onClick={() => router.push("/research/grants")}>
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Back to Grants
            </Button>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  const approvedAmount = parseFloat(grant.approved_amount)
  const disbursedAmount = parseFloat(grant.disbursed_amount)
  const disbursementPercentage = approvedAmount > 0 ? (disbursedAmount / approvedAmount) * 100 : 0

  return (
    <SidebarProvider style={{ "--sidebar-width": "16rem" } as React.CSSProperties}>
      <AppSidebar />
      <SidebarInset>
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
                  <BreadcrumbLink href="/research">Research</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/research/grants">Grants</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{grant.grant_number}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold tracking-tight">{grant.grant_number}</h1>
                <Badge variant="outline" className={getStatusColor(grant.status)}>
                  {grant.status_display}
                </Badge>
              </div>
              <h2 className="text-xl text-muted-foreground mb-4">{grant.title}</h2>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Icon name="User" size={16} className="text-muted-foreground" />
                  <span className="font-medium">PI:</span>
                  <span>{grant.pi_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Building" size={16} className="text-muted-foreground" />
                  <span className="font-medium">Type:</span>
                  <span>{grant.grant_type_display}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="DollarSign" size={16} className="text-muted-foreground" />
                  <span className="font-medium">Funding:</span>
                  <span>{grant.funding_source_display}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Icon name="Download" size={16} className="mr-2" />
                Export
              </Button>
              {grant.status === "draft" && (
                <Button variant="outline" size="sm">
                  <Icon name="Edit" size={16} className="mr-2" />
                  Edit
                </Button>
              )}
              {grant.status === "draft" && (
                <Button size="sm">
                  <Icon name="Send" size={16} className="mr-2" />
                  Submit
                </Button>
              )}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Approved Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(approvedAmount)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Requested: {formatCurrency(grant.requested_amount)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Disbursed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(disbursedAmount)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {disbursementPercentage.toFixed(1)}% of budget
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(grant.remaining_budget)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(100 - disbursementPercentage).toFixed(1)}% available
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{grant.duration_months || 0} months</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(grant.start_date)} - {formatDate(grant.end_date)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">
                <Icon name="FileText" size={16} className="mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="milestones">
                <Icon name="Target" size={16} className="mr-2" />
                Milestones ({milestones.length})
              </TabsTrigger>
              <TabsTrigger value="disbursements">
                <Icon name="DollarSign" size={16} className="mr-2" />
                Disbursements ({disbursements.length})
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Grant Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Abstract</h4>
                    <p className="text-sm text-muted-foreground">{grant.abstract || "No abstract provided"}</p>
                  </div>

                  <Separator />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Funder Information</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Funder Name:</span>
                          <p>{grant.funder_name || "-"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Contact:</span>
                          <p className="whitespace-pre-wrap">{grant.funder_contact || "-"}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Important Dates</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Submission Date:</span>
                          <p>{formatDate(grant.submission_date)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Start Date:</span>
                          <p>{formatDate(grant.start_date)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">End Date:</span>
                          <p>{formatDate(grant.end_date)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {grant.review_notes && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-medium mb-2">Review Notes</h4>
                        <p className="text-sm text-muted-foreground">{grant.review_notes}</p>
                        {grant.reviewed_by_name && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Reviewed by: {grant.reviewed_by_name} on {formatDate(grant.reviewed_at)}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Milestones Tab */}
            <TabsContent value="milestones" className="space-y-4 mt-4">
              <DataTable
                columns={milestoneColumns}
                data={milestones}
                emptyMessage="No milestones found for this grant"
              />
            </TabsContent>

            {/* Disbursements Tab */}
            <TabsContent value="disbursements" className="space-y-4 mt-4">
              <DataTable
                columns={disbursementColumns}
                data={disbursements}
                emptyMessage="No disbursements found for this grant"
              />
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
