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
import { myRequestsColumns } from "./columns"
import { useExpenseRequests } from "@/lib/hooks/use-finance-query"
import type { ExpenseRequest } from "@/lib/api/finance"
import { Icon } from "@/components/ui/icon"

export default function MyRequestsPage() {
  const router = useRouter()

  // Use TanStack Store for filters
  const pageId = "finance-my-requests"
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
    my_requests: true,
    ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(sorting.length > 0 && {
      ordering: sorting[0].desc ? `-${sorting[0].id}` : sorting[0].id,
    }),
  }

  // Fetch data with TanStack Query
  const { data, isLoading } = useExpenseRequests(queryParams)

  const stats = {
    total: data?.count || 0,
    draft: (data?.results || []).filter((e: ExpenseRequest) => e.status === 'draft').length,
    pending: (data?.results || []).filter((e: ExpenseRequest) => e.status === 'submitted' || e.status === 'pending_approval').length,
    approved: (data?.results || []).filter((e: ExpenseRequest) => e.status === 'approved' || e.status === 'processing').length,
    paid: (data?.results || []).filter((e: ExpenseRequest) => e.status === 'paid').length,
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
                  <BreadcrumbPage>My Requests</BreadcrumbPage>
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
              <h1 className="text-3xl font-bold">My Expense Requests</h1>
              <p className="text-muted-foreground mt-1">
                Manage and track your expense reimbursement requests
              </p>
            </div>
            <Button asChild>
              <Link href="/finance/my-requests/new">
                <Icon name="Plus" size={16} className="mr-2" />
                New Request
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <Icon name="FileText" size={16} className="text-muted-foreground" />
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
                <p className="text-xs text-muted-foreground">Submitted + Pending Approval</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <Icon name="Calendar" size={16} className="text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.approved}</div>
                <p className="text-xs text-muted-foreground">Approved + Processing</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid</CardTitle>
                <Icon name="DollarSign" size={16} className="text-teal-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.paid}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-[400px]">
              <Icon name="Search" size={16} className="absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search by request number, title, or department..."
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
          </div>

          {/* Expense Requests Table */}
          <DataTable
            columns={myRequestsColumns}
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
