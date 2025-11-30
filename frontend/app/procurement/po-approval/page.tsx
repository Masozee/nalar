"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { SortingState } from "@tanstack/react-table"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { type POPriority } from "@/lib/api/procurement"
import { Icon } from "@/components/ui/icon"
import { DataTable } from "@/components/ui/data-table"
import { poApprovalColumns } from "./columns"
import { usePendingApprovalPOs } from "@/lib/hooks/use-procurement-query"

const priorityLabels: Record<POPriority, string> = {
  low: 'Rendah',
  normal: 'Normal',
  high: 'Tinggi',
  urgent: 'Urgent',
}

const formatCurrency = (amount: string) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(parseFloat(amount))
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function POApprovalPage() {
  const pageId = "procurement-po-approval"
  const filters = usePageFilters(pageId)
  const searchQuery = filters.search || ""
  const priorityFilter = filters.status || "all"

  // Debounce search query to reduce API calls (waits 500ms after user stops typing)
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Sorting
  const [sorting, setSorting] = useState<SortingState>([])

  // Fetch data with TanStack Query (returns array, not paginated)
  const { data: pendingPOs, isLoading } = usePendingApprovalPOs()

  // Filter data client-side - use debounced search for filtering
  const filteredData = useMemo(() => {
    if (!pendingPOs) return []

    let filtered = pendingPOs

    if (debouncedSearchQuery) {
      filtered = filtered.filter(po =>
        po.po_number.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        po.vendor_name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      )
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(po => po.priority === priorityFilter)
    }

    return filtered
  }, [pendingPOs, debouncedSearchQuery, priorityFilter])

  // Calculate stats from filtered data
  const stats = useMemo(() => {
    const urgent = filteredData.filter(p => p.priority === 'urgent').length
    const high = filteredData.filter(p => p.priority === 'high').length
    const totalValue = filteredData.reduce((sum, p) => sum + parseFloat(p.total_amount), 0)

    return {
      pending: filteredData.length,
      urgent,
      high,
      totalValue,
    }
  }, [filteredData])

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
                  <BreadcrumbPage>PO Approval</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 max-w-full">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">PO Approval Queue</h1>
            <p className="text-muted-foreground">
              Review and approve pending purchase orders
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <Icon name="Clock" size={16} className="text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">Awaiting your review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Urgent Priority</CardTitle>
                <Icon name="AlertTriangle" size={16} className="text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.urgent}</div>
                <p className="text-xs text-muted-foreground">Requires immediate action</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                <Icon name="FileText" size={16} className="text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.high}</div>
                <p className="text-xs text-muted-foreground">High priority items</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <Icon name="CheckCircle" size={16} className="text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.totalValue.toString())}
                </div>
                <p className="text-xs text-muted-foreground">Pending approval value</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative w-[300px]">
                <Icon name="Search" size={16} className="absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Search PO number, vendor..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => filterActions.setPageFilter(pageId, { ...filters, search: e.target.value })}
                />
              </div>

              <Select value={priorityFilter} onValueChange={(value) => filterActions.setPageFilter(pageId, { ...filters, status: value })}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  {Object.entries(priorityLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground">
              {filteredData.length} {filteredData.length === 1 ? 'PO' : 'POs'} pending
            </div>
          </div>

          {/* Table */}
          <DataTable
            columns={poApprovalColumns}
            data={filteredData}
            sorting={sorting}
            onSortingChange={setSorting}
            isLoading={isLoading}
            emptyMessage={
              <div className="flex flex-col items-center gap-2">
                <Icon name="CheckCircle" size={32} className="text-green-500" />
                <p>No pending approvals</p>
                <p className="text-xs">All purchase orders have been reviewed</p>
              </div>
            }
            loadingMessage="Loading pending approvals..."
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
