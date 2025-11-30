"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { usePageFilters, filterActions } from "@/lib/store"
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
import { stockRecordApi, warehouseApi, type StockRecord } from "@/lib/api/inventory"
import { Icon } from "@/components/ui/icon"

export default function StockLevelsPage() {
  const [records, setRecords] = useState<StockRecord[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all")

  const pageId = "inventory-stock-levels"
  const filters = usePageFilters(pageId)
  const searchQuery = filters.search || ""

  const [stats, setStats] = useState({
    totalRecords: 0,
    totalQuantity: 0,
    lowStockItems: 0,
  })

  useEffect(() => {
    fetchWarehouses()
  }, [])

  useEffect(() => {
    fetchStockRecords()
  }, [searchQuery, warehouseFilter])

  const fetchWarehouses = async () => {
    try {
      const response = await warehouseApi.list()
      setWarehouses(response.results)
    } catch (error) {
      console.error("Error fetching warehouses:", error)
    }
  }

  const fetchStockRecords = async () => {
    try {
      setLoading(true)
      const params: Record<string, any> = {}
      if (warehouseFilter !== 'all') params.warehouse = warehouseFilter

      const response = await stockRecordApi.list(params)
      setRecords(response.results)
      setTotal(response.count)

      // Calculate stats
      const totalQty = response.results.reduce((sum, r) => sum + Number(r.quantity), 0)
      setStats({
        totalRecords: response.count,
        totalQuantity: totalQty,
        lowStockItems: 0, // Would need SKU data to calculate
      })
    } catch (error) {
      console.error("Error fetching stock records:", error)
      setRecords([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
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
                  <BreadcrumbPage>Stock Levels</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 max-w-full">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Stock Levels</h1>
            <p className="text-muted-foreground">
              View inventory levels across all warehouses
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stock Records</CardTitle>
                <Icon name="Layers" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRecords}</div>
                <p className="text-xs text-muted-foreground">SKU-Warehouse combinations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
                <Icon name="Package" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalQuantity.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Total units in stock</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Warehouses</CardTitle>
                <Icon name="AlertTriangle" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{warehouses.length}</div>
                <p className="text-xs text-muted-foreground">Storage locations</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="All Warehouses" />
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
              {total} {total === 1 ? 'record' : 'records'}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg border bg-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">SKU Code</TableHead>
                  <TableHead className="w-[250px]">Item Name</TableHead>
                  <TableHead className="w-[150px]">Warehouse</TableHead>
                  <TableHead className="w-[120px] text-right">Quantity</TableHead>
                  <TableHead className="w-[120px] text-right">Reserved</TableHead>
                  <TableHead className="w-[120px] text-right">Available</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No stock records found
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record) => {
                    const available = Number(record.quantity) - Number(record.reserved_quantity)
                    const isLow = available < 10 // Simple threshold

                    return (
                      <TableRow key={record.id}>
                        <TableCell>
                          <Link
                            href={`/inventory/sku-list/${record.sku}`}
                            className="font-medium hover:underline"
                          >
                            {record.sku_code}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{record.sku_name}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{record.warehouse_code} - {record.warehouse_name}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm font-medium">{Number(record.quantity).toFixed(2)}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm text-muted-foreground">{Number(record.reserved_quantity).toFixed(2)}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`text-sm font-medium ${isLow ? 'text-yellow-600' : ''}`}>
                            {available.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {isLow ? (
                            <Badge className="bg-yellow-500 text-xs">Low</Badge>
                          ) : (
                            <Badge className="bg-green-500 text-xs">OK</Badge>
                          )}
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
