"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PaginationState, SortingState } from "@tanstack/react-table"

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
import { allRequestsColumns } from "./columns"
import { useExpenseRequests, useExpenseRequestSummary } from "@/lib/hooks/use-finance-query"
import { Icon } from "@/components/ui/icon"

const formatCurrency = (amount: string | number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(typeof amount === 'string' ? parseFloat(amount) : amount)
}

export default function AllRequestsPage() {
  const router = useRouter()

  // Use TanStack Store for filters and page size
  const pageId = "finance-all-requests"
  const filters = usePageFilters(pageId)
  const searchQuery = filters.search || ""
  const statusFilter = filters.status || "all"
  const paymentMethodFilter = filters.paymentMethod || "all"
  const defaultPageSize = usePageSize()

  // Debounce search query to reduce API calls (waits 500ms after user stops typing)
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  })
  const [sorting, setSorting] = useState<SortingState>([])

  // Build query params - use debounced search for API calls
  const queryParams = {
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
    ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(paymentMethodFilter !== "all" && { payment_method: paymentMethodFilter }),
    ...(sorting.length > 0 && {
      ordering: sorting[0].desc ? `-${sorting[0].id}` : sorting[0].id,
    }),
  }

  // Fetch data with TanStack Query
  const { data, isLoading } = useExpenseRequests(queryParams)
  const { data: summary } = useExpenseRequestSummary()

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
                  <BreadcrumbPage>All Requests</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 max-w-full">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">All Expense Requests</h1>
            <p className="text-muted-foreground mt-1">
              View and manage all expense reimbursement requests across the organization
            </p>
          </div>

          {/* Stats */}
          {summary && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                  <Icon name="FileText" size={16} className="text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.total_requests}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    All time
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Requested</CardTitle>
                  <Icon name="TrendingUp" size={16} className="text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(summary.total_requested_amount)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    All requests
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Approved</CardTitle>
                  <Icon name="CheckCircle" size={16} className="text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(summary.total_approved_amount)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Approved amount
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                  <Icon name="DollarSign" size={16} className="text-teal-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(summary.total_paid_amount)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Paid out
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative w-[400px]">
              <Icon name="Search" size={16} className="absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentMethodFilter} onValueChange={(value) => {
              filterActions.setPageFilter(pageId, { ...filters, paymentMethod: value })
              setPagination((prev) => ({ ...prev, pageIndex: 0 }))
            }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="petty_cash">Petty Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Expense Requests Table */}
          <DataTable
            columns={allRequestsColumns}
            data={data?.results || []}
            pageCount={data?.pageCount || 0}
            pagination={pagination}
            onPaginationChange={setPagination}
            sorting={sorting}
            onSortingChange={setSorting}
            manualPagination
            manualSorting
            isLoading={isLoading}
            emptyMessage="No expense requests found"
            loadingMessage="Loading expense requests..."
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
