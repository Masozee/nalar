"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { advanceRequestsColumns } from "./columns"
import { useExpenseAdvances } from "@/lib/hooks/use-finance-query"
import type { ExpenseAdvanceListItem } from "@/lib/api/finance"
import { Icon } from "@/components/ui/icon"

const formatCurrency = (amount: string | number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(typeof amount === 'string' ? parseFloat(amount) : amount)
}

export default function AdvanceRequestsPage() {
  const router = useRouter()

  // Use TanStack Store for filters
  const pageId = "finance-advance-requests"
  const filters = usePageFilters(pageId)
  const searchQuery = filters.search || ""
  const statusFilter = filters.status || "all"

  // Debounce search query to reduce API calls (waits 500ms after user stops typing)
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [sorting, setSorting] = useState<SortingState>([])

  // Build query params - use debounced search for API calls
  const queryParams = {
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
    ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(sorting.length > 0 && {
      ordering: sorting[0].desc ? `-${sorting[0].id}` : sorting[0].id,
    }),
  }

  // Fetch data with TanStack Query
  const { data, isLoading } = useExpenseAdvances(queryParams)

  const stats = {
    total: data?.count || 0,
    pending: (data?.results || []).filter((a: ExpenseAdvanceListItem) => a.status === 'pending').length,
    approved: (data?.results || []).filter((a: ExpenseAdvanceListItem) => a.status === 'approved').length,
    disbursed: (data?.results || []).filter((a: ExpenseAdvanceListItem) => a.status === 'disbursed').length,
    settled: (data?.results || []).filter((a: ExpenseAdvanceListItem) => a.status === 'settled').length,
    totalAmount: (data?.results || []).reduce((sum: number, a: ExpenseAdvanceListItem) => sum + parseFloat(a.amount), 0),
    totalUnsettled: (data?.results || [])
      .filter((a: ExpenseAdvanceListItem) => a.status === 'disbursed')
      .reduce((sum: number, a: ExpenseAdvanceListItem) => sum + a.balance, 0),
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
                  <BreadcrumbLink href="/finance">Finance</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Advance Requests</BreadcrumbPage>
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
              <h1 className="text-3xl font-bold">Cash Advance Requests</h1>
              <p className="text-muted-foreground mt-1">
                Manage cash advances and uang muka for employees
              </p>
            </div>
            <Button asChild>
              <Link href="/finance/advance-requests/new">
                <Icon name="Plus" size={16} className="mr-2" />
                New Advance
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <Icon name="DollarSign" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Icon name="Clock" size={16} className="text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <Icon name="CheckCircle" size={16} className="text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.approved}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disbursed</CardTitle>
                <Icon name="DollarSign" size={16} className="text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.disbursed}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Settled</CardTitle>
                <Icon name="CheckCircle" size={16} className="text-teal-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.settled}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unsettled</CardTitle>
                <Icon name="XCircle" size={16} className="text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{formatCurrency(stats.totalUnsettled.toString())}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative w-[400px]">
              <Icon name="Search" size={16} className="absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search by advance number, purpose, or requester..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => {
                  filterActions.setPageFilter(pageId, { ...filters, search: e.target.value })
                  setPagination((prev) => ({ ...prev, pageIndex: 0 }))
                }}
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => {
              filterActions.setPageFilter(pageId, { ...filters, status: value })
              setPagination((prev) => ({ ...prev, pageIndex: 0 }))
            }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="disbursed">Disbursed</SelectItem>
                <SelectItem value="settled">Settled</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Advances Table */}
          <DataTable
            columns={advanceRequestsColumns}
            data={data?.results || []}
            pageCount={data?.pageCount || 0}
            pagination={pagination}
            onPaginationChange={setPagination}
            sorting={sorting}
            onSortingChange={setSorting}
            manualPagination
            manualSorting
            isLoading={isLoading}
            emptyMessage="No cash advances found"
            loadingMessage="Loading cash advances..."
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
