"use client"

import { useState } from "react"
import Link from "next/link"
import { PaginationState, SortingState } from "@tanstack/react-table"

import { usePageFilters, usePageSize, filterActions } from "@/lib/store"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNavbar } from "@/components/top-navbar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Icon } from "@/components/ui/icon"
import { DataTable } from "@/components/ui/data-table"
import { assetColumns } from "./columns"
import { useAssets, useAssetStatistics } from "@/lib/hooks/use-assets-query"

export default function AssetsPageNew() {
  // Use TanStack Store for filters and page size
  const pageId = "assets"
  const filters = usePageFilters(pageId)
  const searchQuery = filters.search || ""
  const categoryFilter = filters.category || "all"
  const statusFilter = filters.status || "all"
  const defaultPageSize = usePageSize()

  // Debounce search query to reduce API calls (waits 500ms after user stops typing)
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Pagination with user's preferred page size
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  })

  // Sorting
  const [sorting, setSorting] = useState<SortingState>([])

  // Build query params - use debounced search for API calls
  const queryParams = {
    page: pagination.pageIndex + 1, // Django uses 1-based indexing
    page_size: pagination.pageSize,
    ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
    ...(categoryFilter !== "all" && { category: categoryFilter }),
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(sorting.length > 0 && {
      ordering: sorting[0].desc
        ? `-${sorting[0].id}`
        : sorting[0].id,
    }),
  }

  // Fetch data with TanStack Query
  const { data, isLoading } = useAssets(queryParams)
  const { data: stats } = useAssetStatistics()

  const formatCurrency = (value?: number) => {
    if (!value) return "-"
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "350px" } as React.CSSProperties}
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
                <BreadcrumbItem>
                  <BreadcrumbPage>Assets</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 max-w-full">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Assets</h1>
              <p className="text-muted-foreground">
                Manage and track organizational assets
              </p>
            </div>
            <Button asChild>
              <Link href="/assets/new">
                <Icon name="Plus" size={16} className="mr-2" />
                Add Asset
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Assets
                </CardTitle>
                <Icon
                  name="Package"
                  size={16}
                  className="text-muted-foreground"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  All active assets
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <Icon name="Package" size={16} className="text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.by_status.find((s) => s.status === "active")?.count ||
                    0}
                </div>
                <p className="text-xs text-muted-foreground">
                  In use or available
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Under Maintenance
                </CardTitle>
                <Icon
                  name="AlertTriangle"
                  size={16}
                  className="text-yellow-500"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.by_status.find((s) => s.status === "maintenance")
                    ?.count || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently serviced
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Value
                </CardTitle>
                <Icon
                  name="TrendingUp"
                  size={16}
                  className="text-muted-foreground"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats?.total_purchase_value)}
                </div>
                <p className="text-xs text-muted-foreground">Purchase value</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative w-[300px]">
                <Icon
                  name="Search"
                  size={16}
                  className="absolute left-2.5 top-2.5 text-muted-foreground"
                />
                <Input
                  placeholder="Search assets..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => {
                    filterActions.setPageFilter(pageId, { ...filters, search: e.target.value })
                    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
                  }}
                />
              </div>

              <Select
                value={categoryFilter}
                onValueChange={(value) => {
                  filterActions.setPageFilter(pageId, { ...filters, category: value })
                  setPagination((prev) => ({ ...prev, pageIndex: 0 }))
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="it_equipment">IT Equipment</SelectItem>
                  <SelectItem value="furniture">Furniture</SelectItem>
                  <SelectItem value="vehicle">Vehicle</SelectItem>
                  <SelectItem value="office_equipment">
                    Office Equipment
                  </SelectItem>
                  <SelectItem value="building">Building</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  filterActions.setPageFilter(pageId, { ...filters, status: value })
                  setPagination((prev) => ({ ...prev, pageIndex: 0 }))
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground">
              {data?.count || 0} {data?.count === 1 ? "asset" : "assets"}
            </div>
          </div>

          {/* Table */}
          <DataTable
            columns={assetColumns}
            data={data?.results || []}
            pageCount={data?.pageCount || 0}
            pagination={pagination}
            onPaginationChange={setPagination}
            sorting={sorting}
            onSortingChange={setSorting}
            manualPagination
            manualSorting
            isLoading={isLoading}
            emptyMessage="No assets found"
            loadingMessage="Loading assets..."
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
