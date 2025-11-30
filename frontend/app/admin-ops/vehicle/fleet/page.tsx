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
import { createVehicleFleetColumns } from "./columns"

export default function VehicleFleetPage() {
  const router = useRouter()

  const pageId = "admin-ops-vehicle-fleet"
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
    queryKey: ["vehicles", queryParams],
    queryFn: () => vehicleApi.vehicles.list(queryParams),
  })

  // Calculate stats from API data
  const stats = {
    total: data?.count || 0,
    available: data?.results?.filter((v: any) => v.status === 'available').length || 0,
    inUse: data?.results?.filter((v: any) => v.status === 'in_use').length || 0,
    maintenance: data?.results?.filter((v: any) => v.status === 'maintenance').length || 0,
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
                  <BreadcrumbPage>Vehicles</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 max-w-full">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Vehicle Fleet</h1>
              <p className="text-muted-foreground">
                Manage company vehicles and fleet
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
                <Icon name="Car" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  Fleet size
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available</CardTitle>
                <Icon name="Car" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.available}</div>
                <p className="text-xs text-muted-foreground">
                  Ready for booking
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Use</CardTitle>
                <Icon name="Truck" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inUse}</div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
                <Icon name="Wrench" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.maintenance}</div>
                <p className="text-xs text-muted-foreground">
                  Under service
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
                  placeholder="Search vehicles..."
                  value={searchQuery}
                  onChange={(e) => filterActions.setPageFilter(pageId, { ...filters, search: e.target.value })}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => router.push('/admin-ops/vehicle/fleet/new')}>
                <Icon name="Plus" size={16} className="mr-2" />
                Add Vehicle
              </Button>
            </div>
          </div>

          {/* Vehicle Fleet Table */}
          <DataTable
            columns={createVehicleFleetColumns()}
            data={data?.results || []}
            pageCount={data?.pageCount || 0}
            pagination={pagination}
            onPaginationChange={setPagination}
            sorting={sorting}
            onSortingChange={setSorting}
            manualPagination
            manualSorting
            isLoading={isLoading}
            emptyMessage="No vehicles found"
            loadingMessage="Loading vehicles..."
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
