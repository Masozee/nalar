"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { PaginationState, SortingState } from "@tanstack/react-table"
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
import { Button } from "@/components/ui/button"
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
import { grantApi } from "@/lib/api/research"
import { Icon } from "@/components/ui/icon"
import { DataTable } from "@/components/ui/data-table"
import { grantColumns } from "./columns"

export default function GrantListPage() {
  const pageId = "research-grants"
  const filters = usePageFilters(pageId)
  const searchQuery = filters.search || ""

  // Debounce search query to reduce API calls (waits 500ms after user stops typing)
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  const statusFilter = filters.status || "all"

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const [grantTypeFilter, setGrantTypeFilter] = useState<string>("all")

  // Build query params
  const queryParams = {
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
    ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(grantTypeFilter !== "all" && { grant_type: grantTypeFilter }),
    ...(sorting.length > 0 && {
      ordering: sorting[0].desc ? `-${sorting[0].id}` : sorting[0].id,
    }),
  }

  // Fetch grants with server-side pagination and sorting
  const { data: grantsData, isLoading } = useQuery({
    queryKey: ["grants", queryParams],
    queryFn: () => grantApi.list(queryParams),
  })

  // Fetch summary
  const { data: summaryData } = useQuery({
    queryKey: ["grants", "summary"],
    queryFn: () => grantApi.summary(),
  })

  const grants = grantsData?.results || []
  const totalGrants = grantsData?.count || 0
  const activeGrants = summaryData?.by_status?.active || 0
  const totalApprovedAmount = summaryData?.total_approved_amount || 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

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
                  <BreadcrumbPage>Grants</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Research Grants</h1>
              <p className="text-muted-foreground">
                Manage research grants and funding applications
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Icon name="Download" size={16} className="mr-2" />
                Export
              </Button>
              <Button size="sm" asChild>
                <Link href="/research/grants/new">
                  <Icon name="Plus" size={16} className="mr-2" />
                  New Grant
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Grants</CardTitle>
                <Icon name="FlaskConical" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalGrants}</div>
                <p className="text-xs text-muted-foreground">All statuses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Grants</CardTitle>
                <Icon name="Target" size={16} className="text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeGrants}</div>
                <p className="text-xs text-muted-foreground">Currently running</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Approved</CardTitle>
                <Icon name="DollarSign" size={16} className="text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalApprovedAmount)}</div>
                <p className="text-xs text-muted-foreground">Approved funding</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search grants..."
                  value={searchQuery}
                  onChange={(e) => {
                    filterActions.setPageFilter(pageId, { ...filters, search: e.target.value })
                    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
                  }}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={(value) => {
                filterActions.setPageFilter(pageId, { ...filters, status: value })
                setPagination((prev) => ({ ...prev, pageIndex: 0 }))
              }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={grantTypeFilter} onValueChange={(value) => {
                setGrantTypeFilter(value)
                setPagination((prev) => ({ ...prev, pageIndex: 0 }))
              }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="international">International</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grants Table */}
          <DataTable
            columns={grantColumns}
            data={grants}
            pageCount={Math.ceil(totalGrants / pagination.pageSize)}
            pagination={pagination}
            onPaginationChange={setPagination}
            sorting={sorting}
            onSortingChange={setSorting}
            manualPagination
            manualSorting
            isLoading={isLoading}
            emptyMessage="No grants found"
            loadingMessage="Loading grants..."
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
