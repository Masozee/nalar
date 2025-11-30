"use client"

import { useEffect, useState, useMemo } from "react"
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
import { purchaseOrderApi } from "@/lib/api/procurement"
import { Icon } from "@/components/ui/icon"
import { DataTable } from "@/components/ui/data-table"
import { goodsReceiptColumns } from "./columns"
import { usePOReceipts } from "@/lib/hooks/use-procurement-query"

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

export default function GoodsReceiptPage() {
  const [availablePOs, setAvailablePOs] = useState<any[]>([])
  const [poFilter, setPoFilter] = useState<string>("all")

  const pageId = "procurement-goods-receipt"
  const filters = usePageFilters(pageId)
  const searchQuery = filters.search || ""

  // Debounce search query to reduce API calls (waits 500ms after user stops typing)
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Sorting
  const [sorting, setSorting] = useState<SortingState>([])

  // Fetch available POs for filter dropdown
  useEffect(() => {
    const fetchAvailablePOs = async () => {
      try {
        const params = { status: 'sent' }
        const response = await purchaseOrderApi.list(params)
        setAvailablePOs(response.results)
      } catch (error) {
        console.error("Error fetching available POs:", error)
      }
    }
    fetchAvailablePOs()
  }, [])

  // Build query params
  const queryParams = {
    ...(poFilter !== 'all' && { purchase_order: poFilter }),
  }

  // Fetch data with TanStack Query (returns paginated result, but we'll use client-side filtering)
  const { data: receiptsData, isLoading } = usePOReceipts(queryParams)

  // Filter data client-side for search - use debounced search for filtering
  const filteredData = useMemo(() => {
    if (!receiptsData?.results) return []

    let filtered = receiptsData.results

    if (debouncedSearchQuery) {
      filtered = filtered.filter(r =>
        r.receipt_number.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        r.delivery_note_number?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      )
    }

    return filtered
  }, [receiptsData, debouncedSearchQuery])

  // Calculate stats from filtered data
  const stats = useMemo(() => {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonth = filteredData.filter(r =>
      new Date(r.receipt_date) >= firstDayOfMonth
    ).length

    return {
      total: filteredData.length,
      thisMonth,
      pendingPOs: availablePOs.length,
    }
  }, [filteredData, availablePOs])

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
                  <BreadcrumbPage>Goods Receipt</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 max-w-full">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Goods Receipt</h1>
              <p className="text-muted-foreground">
                Record incoming goods from purchase orders
              </p>
            </div>
            <Button asChild>
              <Link href="/procurement/goods-receipt/new">
                <Icon name="Plus" size={16} className="mr-2" />
                New Receipt
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Receipts</CardTitle>
                <Icon name="PackageCheck" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">All goods receipts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Icon name="TrendingUp" size={16} className="text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.thisMonth}</div>
                <p className="text-xs text-muted-foreground">Received this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending POs</CardTitle>
                <Icon name="Package" size={16} className="text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingPOs}</div>
                <p className="text-xs text-muted-foreground">Awaiting goods receipt</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative w-[300px]">
                <Icon name="Search" size={16} className="absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Search receipt number, delivery note..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => filterActions.setPageFilter(pageId, { ...filters, search: e.target.value })}
                />
              </div>

              <Select value={poFilter} onValueChange={setPoFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Purchase Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All POs</SelectItem>
                  {availablePOs.map((po) => (
                    <SelectItem key={po.id} value={po.id}>
                      {po.po_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground">
              {filteredData.length} {filteredData.length === 1 ? 'receipt' : 'receipts'}
            </div>
          </div>

          {/* Table */}
          <DataTable
            columns={goodsReceiptColumns}
            data={filteredData}
            sorting={sorting}
            onSortingChange={setSorting}
            isLoading={isLoading}
            emptyMessage="No goods receipts found"
            loadingMessage="Loading goods receipts..."
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
