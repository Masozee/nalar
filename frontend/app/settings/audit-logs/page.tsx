"use client"

import { useState } from "react"
import { PaginationState, SortingState } from "@tanstack/react-table"
import { usePageFilters, usePageSize, filterActions } from "@/lib/store"
import { useDebounce } from "@/lib/hooks/use-debounce"
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
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Icon } from "@/components/ui/icon"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { auditLogColumns } from "./columns"
import { useAuditLogs, useAuditLogStats } from "@/lib/hooks/use-tenants-query"

export default function AuditLogsPage() {
  // Use TanStack Store for filters and page size
  const pageId = "settings-audit-logs"
  const filters = usePageFilters(pageId)
  const searchQuery = filters.search || ""
  const filterAction = filters.action || "all"
  const filterModel = filters.model || "all"
  const defaultPageSize = usePageSize()

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Pagination
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  })

  // Sorting
  const [sorting, setSorting] = useState<SortingState>([
    { id: "timestamp", desc: true }, // Default sort by newest first
  ])

  // Build query params
  const queryParams = {
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
    ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
    ...(filterAction !== "all" && { action: filterAction }),
    ...(filterModel !== "all" && { model_name: filterModel }),
    ...(sorting.length > 0 && {
      ordering: sorting[0].desc ? `-${sorting[0].id}` : sorting[0].id,
    }),
  }

  // Fetch data with TanStack Query
  const { data, isLoading } = useAuditLogs(queryParams)
  const { data: stats, isLoading: statsLoading } = useAuditLogStats()

  // Extract unique models from data for filter
  const logs = data?.results || []
  const uniqueModels = Array.from(new Set(logs.map((log) => log.model_name)))

  return (
    <>
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
                <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Audit Logs</BreadcrumbPage>
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
            <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
            <p className="text-muted-foreground">
              Track all user actions and system changes
            </p>
          </div>
          <Button variant="outline">
            <Icon name="Download" size={16} className="mr-2" />
            Export Logs
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
              ) : (
                <div className="text-2xl font-bold">{stats?.total_logs || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Top Action
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
              ) : (
                <div className="text-2xl font-bold capitalize">
                  {stats?.top_action || "-"}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Most Active Model
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
              ) : (
                <div className="text-2xl font-bold font-mono text-sm">
                  {stats?.most_active_model || "-"}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-8 w-12 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
              ) : (
                <div className="text-2xl font-bold">{stats?.active_users_count || 0}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Icon
              name="Search"
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => {
                filterActions.setPageFilter(pageId, { ...filters, search: e.target.value })
                setPagination((prev) => ({ ...prev, pageIndex: 0 }))
              }}
              className="pl-9"
            />
          </div>

          <Select
            value={filterAction}
            onValueChange={(value) => {
              filterActions.setPageFilter(pageId, { ...filters, action: value })
              setPagination((prev) => ({ ...prev, pageIndex: 0 }))
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="logout">Logout</SelectItem>
              <SelectItem value="export">Export</SelectItem>
              <SelectItem value="import">Import</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterModel}
            onValueChange={(value) => {
              filterActions.setPageFilter(pageId, { ...filters, model: value })
              setPagination((prev) => ({ ...prev, pageIndex: 0 }))
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Models</SelectItem>
              {uniqueModels.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Audit Logs Table */}
        <DataTable
          columns={auditLogColumns}
          data={logs}
          pageCount={data?.pageCount || 0}
          pagination={pagination}
          onPaginationChange={setPagination}
          sorting={sorting}
          onSortingChange={setSorting}
          manualPagination
          manualSorting
          isLoading={isLoading}
          emptyMessage="No audit logs found"
          loadingMessage="Loading audit logs..."
        />
      </div>
    </>
  )
}
