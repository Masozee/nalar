"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PaginationState, SortingState } from "@tanstack/react-table"
import { usePageFilters, usePageSize, filterActions } from "@/lib/store"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { useQuery } from "@tanstack/react-query"
import { getContacts } from "@/lib/api/crm"
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
import { Icon } from "@/components/ui/icon"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTable } from "@/components/ui/data-table"
import { createContactColumns } from "./columns"

export default function ContactsPage() {
  const router = useRouter()

  // Use TanStack Store for filters and page size
  const pageId = "crm-contacts"
  const filters = usePageFilters(pageId)
  const searchQuery = filters.search || ""
  const accessLevelFilter = filters.access_level || "all"
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
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
    ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
    ...(accessLevelFilter !== "all" && { access_level: accessLevelFilter }),
    ...(sorting.length > 0 && {
      ordering: sorting[0].desc ? `-${sorting[0].id}` : sorting[0].id,
    }),
  }

  // Fetch data with TanStack Query
  const { data, isLoading } = useQuery({
    queryKey: ["contacts", queryParams],
    queryFn: () => getContacts(queryParams),
  })

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
                  <BreadcrumbPage>Contacts</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
              <p className="text-muted-foreground">
                Manage contact relationships and access levels
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Icon name="Download" size={16} className="mr-2" />
                Export
              </Button>
              <Button size="sm" onClick={() => router.push('/admin-ops/crm/contacts/new')}>
                <Icon name="Plus" size={16} className="mr-2" />
                Add Contact
              </Button>
            </div>
          </div>

      {/* Search and Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-64">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => {
              filterActions.setPageFilter(pageId, { search: e.target.value })
              setPagination((prev) => ({ ...prev, pageIndex: 0 }))
            }}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={accessLevelFilter}
            onValueChange={(value) => {
              filterActions.setPageFilter(pageId, { access_level: value })
              setPagination((prev) => ({ ...prev, pageIndex: 0 }))
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Access Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Access Levels</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="internal">Internal</SelectItem>
              <SelectItem value="restricted">Restricted</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
              <SelectItem value="vvip">VVIP</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground">
            {data?.count || 0} {data?.count === 1 ? "contact" : "contacts"}
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      <DataTable
        columns={createContactColumns()}
        data={data?.results || []}
        pageCount={data?.pageCount || 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        manualPagination
        manualSorting
        isLoading={isLoading}
        emptyMessage="No contacts found"
        loadingMessage="Loading contacts..."
      />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
