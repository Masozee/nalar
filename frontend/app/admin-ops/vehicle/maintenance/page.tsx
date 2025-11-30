"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PaginationState, SortingState } from "@tanstack/react-table"
import { useQuery } from "@tanstack/react-query"

import { usePageFilters, usePageSize, filterActions } from "@/lib/store"
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { vehicleApi } from "@/lib/api/admin-ops"
import { Icon } from "@/components/ui/icon"
import { DataTable } from "@/components/ui/data-table"
import { createMaintenanceColumns } from "./columns"

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function VehicleMaintenancePage() {
  const router = useRouter()

  const pageId = "admin-ops-vehicle-maintenance"
  const filters = usePageFilters(pageId)
  const searchQuery = filters.search || ""
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
  const queryParams: Record<string, any> = {
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
  }
  if (debouncedSearchQuery) queryParams.search = debouncedSearchQuery
  if (sorting.length > 0) {
    queryParams.ordering = sorting[0].desc ? `-${sorting[0].id}` : sorting[0].id
  }

  // Fetch data with TanStack Query
  const { data, isLoading } = useQuery({
    queryKey: ["vehicle-maintenance", queryParams],
    queryFn: () => vehicleApi.maintenance.list(queryParams),
  })

  // Calculate stats from API data
  const totalCost = data?.results?.reduce((sum: number, m: any) => sum + Number(m.cost), 0) || 0
  const thisMonth = data?.results?.filter((m: any) => {
    const serviceDate = new Date(m.service_date)
    const now = new Date()
    return serviceDate.getMonth() === now.getMonth() && serviceDate.getFullYear() === now.getFullYear()
  }) || []

  const stats = {
    total: data?.count || 0,
    thisMonth: thisMonth.length,
    totalCost: totalCost,
    avgCost: data?.results?.length > 0 ? totalCost / data.results.length : 0,
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
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin-ops">Admin Ops</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Vehicle Maintenance</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 max-w-full">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Vehicle Maintenance</h1>
              <p className="text-muted-foreground">
                Track vehicle service and maintenance records
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                <Icon name="Wrench" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  All maintenance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Icon name="Calendar" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.thisMonth}</div>
                <p className="text-xs text-muted-foreground">
                  Services done
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                <Icon name="DollarSign" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalCost)}</div>
                <p className="text-xs text-muted-foreground">
                  All time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Cost</CardTitle>
                <Icon name="DollarSign" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.avgCost)}</div>
                <p className="text-xs text-muted-foreground">
                  Per service
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative w-[300px]">
                <Icon name="Search" size={16} className="absolute left-2 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Search maintenance records..."
                  value={searchQuery}
                  onChange={(e) => filterActions.setPageFilter(pageId, { ...filters, search: e.target.value })}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => router.push('/admin-ops/vehicle/maintenance/new')}>
                <Icon name="Plus" size={16} className="mr-2" />
                Add Record
              </Button>
            </div>
          </div>

          {/* Maintenance Table */}
          <DataTable
            columns={createMaintenanceColumns()}
            data={data?.results || []}
            pageCount={data?.pageCount || 0}
            pagination={pagination}
            onPaginationChange={setPagination}
            sorting={sorting}
            onSortingChange={setSorting}
            manualPagination
            manualSorting
            isLoading={isLoading}
            emptyMessage="No maintenance records found"
            loadingMessage="Loading maintenance records..."
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
