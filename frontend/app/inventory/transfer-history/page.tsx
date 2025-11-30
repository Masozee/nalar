"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

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
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { stockTransferApi, warehouseApi, type StockTransfer, type TransferStatus } from "@/lib/api/inventory"
import { Icon } from "@/components/ui/icon"

const statusLabels: Record<TransferStatus, string> = {
  draft: 'Draft',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  in_transit: 'In Transit',
  partial: 'Partial',
  received: 'Received',
  cancelled: 'Cancelled',
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function TransferHistoryPage() {
  // Use TanStack Store for filters
  const pageId = "inventory-transfer-history"
  const filters = usePageFilters(pageId)
  const searchQuery = filters.search || ""

  // Debounce search query to reduce API calls (waits 500ms after user stops typing)
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  const statusFilter = filters.status || "completed"

  const [transfers, setTransfers] = useState<StockTransfer[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all")

  const [stats, setStats] = useState({
    total: 0,
    received: 0,
    cancelled: 0,
    rejected: 0,
  })

  useEffect(() => {
    fetchWarehouses()
  }, [])

  useEffect(() => {
    fetchTransfers()
  }, [debouncedSearchQuery, statusFilter, warehouseFilter])

  const fetchWarehouses = async () => {
    try {
      const response = await warehouseApi.list()
      setWarehouses(response.results)
    } catch (error) {
      console.error("Error fetching warehouses:", error)
    }
  }

  const fetchTransfers = async () => {
    try {
      setLoading(true)
      const params: Record<string, any> = {}
      if (debouncedSearchQuery) params.search = debouncedSearchQuery

      // For history, only filter by specific status if not "completed"
      if (statusFilter !== 'completed') {
        params.status = statusFilter
      }

      if (warehouseFilter !== 'all') {
        params.source_warehouse = warehouseFilter
      }

      const response = await stockTransferApi.list(params)

      // Filter results to only show completed transfers if "completed" is selected
      let filteredResults = response.results
      if (statusFilter === 'completed') {
        filteredResults = response.results.filter(t =>
          t.status === 'received' || t.status === 'cancelled' || t.status === 'rejected'
        )
      }

      setTransfers(filteredResults)
      setTotal(filteredResults.length)

      // Calculate stats
      const received = filteredResults.filter(t => t.status === 'received').length
      const cancelled = filteredResults.filter(t => t.status === 'cancelled').length
      const rejected = filteredResults.filter(t => t.status === 'rejected').length

      setStats({
        total: filteredResults.length,
        received,
        cancelled,
        rejected,
      })
    } catch (error) {
      console.error("Error fetching transfers:", error)
      setTransfers([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: TransferStatus) => {
    const config: Record<TransferStatus, string> = {
      draft: "bg-gray-500",
      pending_approval: "bg-yellow-500",
      approved: "bg-green-500",
      rejected: "bg-red-500",
      in_transit: "bg-blue-500",
      partial: "bg-orange-500",
      received: "bg-green-600",
      cancelled: "bg-gray-400",
    }

    return (
      <Badge className={config[status]}>
        {statusLabels[status]}
      </Badge>
    )
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
                  <BreadcrumbLink href="/assets">Asset & Inventory</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Transfer History</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 max-w-full">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Stock Transfer History</h1>
            <p className="text-muted-foreground">
              View completed and historical stock transfers
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total History</CardTitle>
                <Icon name="History" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Completed transfers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Received</CardTitle>
                <Icon name="CheckCircle" size={16} className="text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.received}</div>
                <p className="text-xs text-muted-foreground">Successfully completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                <Icon name="XCircle" size={16} className="text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.cancelled}</div>
                <p className="text-xs text-muted-foreground">Cancelled transfers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <Icon name="XCircle" size={16} className="text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.rejected}</div>
                <p className="text-xs text-muted-foreground">Rejected requests</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative w-[300px]">
                <Icon name="Search" size={16} className="absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Search transfer number..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => filterActions.setPageFilter(pageId, { ...filters, search: e.target.value })}
                />
              </div>

              <Select value={statusFilter} onValueChange={(value) => filterActions.setPageFilter(pageId, { ...filters, status: value })}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">All Completed</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Source Warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Warehouses</SelectItem>
                  {warehouses.map((wh) => (
                    <SelectItem key={wh.id} value={wh.id}>
                      {wh.code} - {wh.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground">
              {total} {total === 1 ? 'transfer' : 'transfers'}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg border bg-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Transfer Number</TableHead>
                  <TableHead className="w-[150px]">Source</TableHead>
                  <TableHead className="w-[150px]">Destination</TableHead>
                  <TableHead className="w-[120px]">Request Date</TableHead>
                  <TableHead className="w-[120px]">Completed Date</TableHead>
                  <TableHead className="w-[100px] text-right">Total Items</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[150px]">Requester</TableHead>
                  <TableHead className="w-[200px]">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : transfers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No transfer history found
                    </TableCell>
                  </TableRow>
                ) : (
                  transfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell>
                        <Link
                          href={`/inventory/transfer-history/${transfer.id}`}
                          className="font-medium hover:underline"
                        >
                          {transfer.transfer_number}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{transfer.source_warehouse_name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{transfer.destination_warehouse_name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{formatDate(transfer.request_date)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {formatDate(transfer.received_date || transfer.cancelled_date)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-medium">{transfer.total_items}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                      <TableCell>
                        <span className="text-sm">{transfer.requested_by_name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm truncate">{transfer.notes || '-'}</span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
