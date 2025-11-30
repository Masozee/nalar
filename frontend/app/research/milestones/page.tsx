"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { usePageFilters, filterActions } from "@/lib/store"
import { useDebounce } from "@/lib/hooks/use-debounce"
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
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { grantMilestoneApi } from "@/lib/api/research"
import { Icon } from "@/components/ui/icon"
import { DataTable } from "@/components/ui/data-table"
import { milestoneColumns } from "./columns"

export default function MilestonesPage() {
  const pageId = "research-milestones"
  const filters = usePageFilters(pageId)
  const searchQuery = filters.search || ""

  // Debounce search query to reduce API calls (waits 500ms after user stops typing)
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  const statusFilter = filters.status || "all"

  const { data: milestonesData, isLoading } = useQuery({
    queryKey: ["milestones"],
    queryFn: () => grantMilestoneApi.list(),
  })

  const milestones = milestonesData?.results || []

  const filteredMilestones = useMemo(() => {
    return milestones.filter((milestone) => {
      const matchesSearch =
        milestone.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        (milestone.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

      const matchesStatus = statusFilter === "all" || milestone.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [milestones, debouncedSearchQuery, statusFilter])

  const pendingCount = milestones.filter((m) => m.status === "pending").length
  const inProgressCount = milestones.filter((m) => m.status === "in_progress").length
  const completedCount = milestones.filter((m) => m.status === "completed").length
  const delayedCount = milestones.filter((m) => m.status === "delayed").length

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
                  <BreadcrumbPage>Milestones</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Grant Milestones</h1>
              <p className="text-muted-foreground">
                Track project milestones and deliverables
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Icon name="Calendar" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingCount}</div>
                <p className="text-xs text-muted-foreground">Upcoming milestones</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Icon name="Loading" size={16} className="text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inProgressCount}</div>
                <p className="text-xs text-muted-foreground">Currently working</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <Icon name="CheckCircle" size={16} className="text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedCount}</div>
                <p className="text-xs text-muted-foreground">Finished</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Delayed</CardTitle>
                <Icon name="AlertCircle" size={16} className="text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{delayedCount}</div>
                <p className="text-xs text-muted-foreground">Past due</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Icon name="Search" size={16} className="absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search milestones..."
                value={searchQuery}
                onChange={(e) => filterActions.setPageFilter(pageId, { ...filters, search: e.target.value })}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={(value) => filterActions.setPageFilter(pageId, { ...filters, status: value })}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <DataTable
            columns={milestoneColumns}
            data={filteredMilestones}
            isLoading={isLoading}
            emptyMessage="No milestones found"
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
