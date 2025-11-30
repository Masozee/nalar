"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
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
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { grantApi } from "@/lib/api/research"
import { Icon } from "@/components/ui/icon"
import { DataTable } from "@/components/ui/data-table"
import { grantColumns } from "../grants/columns"

export default function GrantApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const { data: grantsData, isLoading } = useQuery({
    queryKey: ["grants", "applications"],
    queryFn: () => grantApi.list({ status__in: "draft,submitted,under_review" }),
  })

  const grants = grantsData?.results || []

  const filteredGrants = useMemo(() => {
    return grants.filter((grant) => {
      const matchesSearch =
        grant.grant_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grant.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grant.pi_name.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesSearch
    })
  }, [grants, searchQuery])

  const draftCount = grants.filter((g) => g.status === "draft").length
  const submittedCount = grants.filter((g) => g.status === "submitted").length
  const underReviewCount = grants.filter((g) => g.status === "under_review").length

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <header className="bg-background sticky top-0 flex shrink-0 items-center justify-between gap-2 border-b p-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
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
                <BreadcrumbItem>
                  <BreadcrumbPage>Grant Applications</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Grant Applications</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Track draft and submitted grant applications
              </p>
            </div>
            <Button asChild>
              <Link href="/research/grants/new">
                <Icon name="Plus" size={16} className="mr-2" />
                New Application
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Draft</CardTitle>
                <Icon name="FileText" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{draftCount}</div>
                <p className="text-xs text-muted-foreground">In progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Submitted</CardTitle>
                <Icon name="Send" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{submittedCount}</div>
                <p className="text-xs text-muted-foreground">Awaiting review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Under Review</CardTitle>
                <Icon name="Eye" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{underReviewCount}</div>
                <p className="text-xs text-muted-foreground">Being evaluated</p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Icon name="Search" size={16} className="absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Table */}
          <DataTable
            columns={grantColumns}
            data={filteredGrants}
            isLoading={isLoading}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
