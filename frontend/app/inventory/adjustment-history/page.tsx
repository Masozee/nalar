"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

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
import { stockMovementApi, warehouseApi, type StockMovement, type MovementType } from "@/lib/api/inventory"
import { Icon } from "@/components/ui/icon"

const movementTypeLabels: Record<MovementType, string> = {
  in: 'Stock In',
  out: 'Stock Out',
  adjustment: 'Adjustment',
  transfer_in: 'Transfer In',
  transfer_out: 'Transfer Out',
  opname: 'Stock Opname',
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

export default function AdjustmentHistoryPage() {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all")

  const [stats, setStats] = useState({
    total: 0,
    adjustments: 0,
    transfers: 0,
  })

  useEffect(() => {
    fetchWarehouses()
  }, [])

  useEffect(() => {
    fetchMovements()
  }, [searchQuery, typeFilter, warehouseFilter])

  const fetchWarehouses = async () => {
    try {
      const response = await warehouseApi.list()
      setWarehouses(response.results)
    } catch (error) {
      console.error("Error fetching warehouses:", error)
    }
  }

  const fetchMovements = async () => {
    try {
      setLoading(true)
      const params: Record<string, any> = {}
      if (typeFilter !== 'all') params.movement_type = typeFilter
      if (warehouseFilter !== 'all') params.warehouse = warehouseFilter

      const response = await stockMovementApi.list(params)
      setMovements(response.results)
      setTotal(response.count)

      // Calculate stats
      const adjustments = response.results.filter(m => m.movement_type === 'adjustment').length
      const transfers = response.results.filter(m =>
        m.movement_type === 'transfer_in' || m.movement_type === 'transfer_out'
      ).length

      setStats({
        total: response.count,
        adjustments,
        transfers,
      })
    } catch (error) {
      console.error("Error fetching movements:", error)
      setMovements([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const getMovementBadge = (type: MovementType) => {
    const config: Record<MovementType, string> = {
      in: "bg-green-500",
      out: "bg-red-500",
      adjustment: "bg-blue-500",
      transfer_in: "bg-purple-500",
      transfer_out: "bg-orange-500",
      opname: "bg-yellow-500",
    }

    return (
      <Badge className={config[type]}>
        {movementTypeLabels[type]}
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
                  <BreadcrumbPage>Adjustment History</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 max-w-full">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Stock Movement History</h1>
            <p className="text-muted-foreground">
              View all stock adjustments and movements
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Movements</CardTitle>
                <Icon name="History" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">All transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Adjustments</CardTitle>
                <Icon name="TrendingUp" size={16} className="text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.adjustments}</div>
                <p className="text-xs text-muted-foreground">Manual adjustments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transfers</CardTitle>
                <Icon name="TrendingDown" size={16} className="text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.transfers}</div>
                <p className="text-xs text-muted-foreground">Between warehouses</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(movementTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Warehouse" />
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
              {total} {total === 1 ? 'movement' : 'movements'}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg border bg-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Date & Time</TableHead>
                  <TableHead className="w-[150px]">SKU Code</TableHead>
                  <TableHead className="w-[200px]">Item Name</TableHead>
                  <TableHead className="w-[150px]">Warehouse</TableHead>
                  <TableHead className="w-[120px]">Type</TableHead>
                  <TableHead className="w-[100px] text-right">Quantity</TableHead>
                  <TableHead className="w-[100px] text-right">Before</TableHead>
                  <TableHead className="w-[100px] text-right">After</TableHead>
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
                ) : movements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No movements found
                    </TableCell>
                  </TableRow>
                ) : (
                  movements.map((movement) => {
                    const isPositive = Number(movement.quantity) > 0

                    return (
                      <TableRow key={movement.id}>
                        <TableCell>
                          <span className="text-sm">{formatDate(movement.movement_date)}</span>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/inventory/sku-list/${movement.sku}`}
                            className="font-medium hover:underline"
                          >
                            {movement.sku_code}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{movement.sku_name}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{movement.warehouse_name}</span>
                        </TableCell>
                        <TableCell>{getMovementBadge(movement.movement_type)}</TableCell>
                        <TableCell className="text-right">
                          <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? '+' : ''}{Number(movement.quantity).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm text-muted-foreground">{Number(movement.quantity_before).toFixed(2)}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm font-medium">{Number(movement.quantity_after).toFixed(2)}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm truncate">{movement.notes || '-'}</span>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
