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
import { Button } from "@/components/ui/button"
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
import { stockTransferApi, warehouseApi, type StockTransfer, type TransferStatus, type TransferPriority } from "@/lib/api/inventory"
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

const priorityLabels: Record<TransferPriority, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent',
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export default function TransferRequestsPage() {
  // Use TanStack Store for filters
  const pageId = "inventory-transfer-requests"
  const filters = usePageFilters(pageId)
  const searchQuery = filters.search || ""

  // Debounce search query to reduce API calls (waits 500ms after user stops typing)
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  const statusFilter = filters.status || "all"

  const [transfers, setTransfers] = useState<StockTransfer[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all")

  const [stats, setStats] = useState({
    total: 0,
    pendingApproval: 0,
    inTransit: 0,
    received: 0,
  })

  useEffect(() => {
    fetchWarehouses()
  }, [])

  useEffect(() => {
    fetchTransfers()
  }, [debouncedSearchQuery, statusFilter, priorityFilter, warehouseFilter])

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
      if (statusFilter !== 'all') params.status = statusFilter
      if (priorityFilter !== 'all') params.priority = priorityFilter
      if (warehouseFilter !== 'all') {
        params.source_warehouse = warehouseFilter
      }

      const response = await stockTransferApi.list(params)
      setTransfers(response.results)
      setTotal(response.count)

      // Calculate stats
      const pendingApproval = response.results.filter(t => t.status === 'pending_approval').length
      const inTransit = response.results.filter(t => t.status === 'in_transit').length
      const received = response.results.filter(t => t.status === 'received').length

      setStats({
        total: response.count,
        pendingApproval,
        inTransit,
        received,
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

  const getPriorityBadge = (priority: TransferPriority) => {
    const config: Record<TransferPriority, string> = {
      low: "bg-gray-500",
      normal: "bg-blue-500",
      high: "bg-orange-500",
      urgent: "bg-red-500",
    }

    return (
      <Badge className={config[priority]}>
        {priorityLabels[priority]}
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
                  <BreadcrumbPage>Transfer Requests</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 max-w-full">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Stock Transfer Requests</h1>
              <p className="text-muted-foreground">
                Manage stock transfers between warehouses
              </p>
            </div>
            <Button asChild>
              <Link href="/inventory/transfer-requests/new">
                <Icon name="Plus" size={16} className="mr-2" />
                New Transfer
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transfers</CardTitle>
                <Icon name="Upload" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">All transfer requests</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <Icon name="Clock" size={16} className="text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingApproval}</div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Transit</CardTitle>
                <Icon name="Truck" size={16} className="text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inTransit}</div>
                <p className="text-xs text-muted-foreground">Being shipped</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Received</CardTitle>
                <Icon name="CheckCircle" size={16} className="text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.received}</div>
                <p className="text-xs text-muted-foreground">Completed transfers</p>
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
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
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
                  <TableHead className="w-[100px]">Priority</TableHead>
                  <TableHead className="w-[120px]">Requested Date</TableHead>
                  <TableHead className="w-[100px] text-right">Total Items</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[150px]">Requester</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
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
                      No transfer requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  transfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell>
                        <Link
                          href={`/inventory/transfer-requests/${transfer.id}`}
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
                      <TableCell>{getPriorityBadge(transfer.priority)}</TableCell>
                      <TableCell>
                        <span className="text-sm">{formatDate(transfer.request_date)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-medium">{transfer.total_items}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                      <TableCell>
                        <span className="text-sm">{transfer.requested_by_name}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/inventory/transfer-requests/${transfer.id}`}>View</Link>
                        </Button>
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
