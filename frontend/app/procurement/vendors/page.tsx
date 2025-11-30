"use client"

import { useState } from "react"
import Link from "next/link"
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
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { type VendorStatus, type VendorCategory } from "@/lib/api/procurement"
import { Icon } from "@/components/ui/icon"
import { DataTable } from "@/components/ui/data-table"
import { vendorColumns } from "./columns"
import { useVendors } from "@/lib/hooks/use-procurement-query"

const statusLabels: Record<VendorStatus, string> = {
  active: 'Aktif',
  inactive: 'Tidak Aktif',
  blacklisted: 'Blacklist',
  pending: 'Menunggu Verifikasi',
}

const categoryLabels: Record<VendorCategory, string> = {
  goods: 'Barang',
  services: 'Jasa',
  both: 'Barang & Jasa',
}

export default function VendorsPage() {
  // Use TanStack Store for filters
  const pageId = "procurement-vendors"
  const filters = usePageFilters(pageId)
  const searchQuery = filters.search || ""
  const statusFilter = filters.status || "all"
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  // Debounce search query to reduce API calls (waits 500ms after user stops typing)
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Pagination
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Sorting
  const [sorting, setSorting] = useState<SortingState>([])

  // Build query params - use debounced search for API calls
  const queryParams = {
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
    ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
    ...(statusFilter !== 'all' && { status: statusFilter }),
    ...(categoryFilter !== 'all' && { category: categoryFilter }),
    ...(sorting.length > 0 && {
      ordering: sorting[0].desc ? `-${sorting[0].id}` : sorting[0].id,
    }),
  }

  // Fetch data with TanStack Query
  const { data, isLoading } = useVendors(queryParams)

  // Calculate stats from data
  const stats = {
    total: data?.count || 0,
    active: data?.results?.filter(v => v.status === 'active').length || 0,
    pending: data?.results?.filter(v => v.status === 'pending').length || 0,
    blacklisted: data?.results?.filter(v => v.status === 'blacklisted').length || 0,
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
                  <BreadcrumbLink href="/procurement">Procurement</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Vendor List</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 max-w-full">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Vendor Management</h1>
              <p className="text-muted-foreground">
                Manage suppliers and service providers
              </p>
            </div>
            <Button asChild>
              <Link href="/procurement/vendors/new">
                <Icon name="Plus" size={16} className="mr-2" />
                New Vendor
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
                <Icon name="Users" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Registered vendors</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <Badge className="bg-green-500 h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active}</div>
                <p className="text-xs text-muted-foreground">Active vendors</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Badge className="bg-yellow-500 h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">Awaiting verification</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Blacklisted</CardTitle>
                <Badge className="bg-red-500 h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.blacklisted}</div>
                <p className="text-xs text-muted-foreground">Blacklisted vendors</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-[300px]">
              <Icon name="Search" size={16} className="absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => {
                  filterActions.setPageFilter(pageId, { ...filters, search: e.target.value })
                  setPagination((prev) => ({ ...prev, pageIndex: 0 }))
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={(value) => filterActions.setPageFilter(pageId, { ...filters, status: value })}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="text-sm text-muted-foreground">
                {data?.count || 0} {data?.count === 1 ? 'vendor' : 'vendors'}
              </div>
            </div>
          </div>

          {/* Table */}
          <DataTable
            columns={vendorColumns}
            data={data?.results || []}
            pageCount={data?.pageCount || 0}
            pagination={pagination}
            onPaginationChange={setPagination}
            sorting={sorting}
            onSortingChange={setSorting}
            manualPagination
            manualSorting
            isLoading={isLoading}
            emptyMessage="No vendors found"
            loadingMessage="Loading vendors..."
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
