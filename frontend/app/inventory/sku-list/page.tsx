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
import { skuApi, type SKUListItem, type ItemCategory } from "@/lib/api/inventory"
import { Icon } from "@/components/ui/icon"

const categoryLabels: Record<ItemCategory, string> = {
  office_supplies: 'Office Supplies',
  it_equipment: 'IT Equipment',
  furniture: 'Furniture',
  consumables: 'Consumables',
  maintenance: 'Maintenance',
  cleaning: 'Cleaning',
  pantry: 'Pantry',
  safety: 'Safety',
  other: 'Other',
}

const formatCurrency = (value?: number) => {
  if (!value) return '-'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

export default function SKUListPage() {
  // Use TanStack Store for filters
  const pageId = "inventory-sku-list"
  const filters = usePageFilters(pageId)
  const searchQuery = filters.search || ""

  // Debounce search query to reduce API calls (waits 500ms after user stops typing)
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  const categoryFilter = filters.category || "all"

  const [skus, setSkus] = useState<SKUListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  const [stats, setStats] = useState({
    total: 0,
    lowStock: 0,
    needsReorder: 0,
  })

  useEffect(() => {
    fetchSKUs()
    fetchStats()
  }, [debouncedSearchQuery, categoryFilter])

  const fetchSKUs = async () => {
    try {
      setLoading(true)
      const params: Record<string, any> = {}

      if (debouncedSearchQuery) params.search = debouncedSearchQuery
      if (categoryFilter !== 'all') params.category = categoryFilter

      const response = await skuApi.list(params)
      setSkus(response.results)
      setTotal(response.count)
      setStats(prev => ({ ...prev, total: response.count }))
    } catch (error) {
      console.error("Error fetching SKUs:", error)
      setSkus([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const [lowStock, needsReorder] = await Promise.all([
        skuApi.lowStock(),
        skuApi.needsReorder(),
      ])

      setStats(prev => ({
        ...prev,
        lowStock: lowStock.length,
        needsReorder: needsReorder.length,
      }))
    } catch (error) {
      console.error("Error fetching stats:", error)
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
                  <BreadcrumbPage>SKU List</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 max-w-full">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">SKU List</h1>
              <p className="text-muted-foreground">
                Manage inventory items (Stock Keeping Units)
              </p>
            </div>
            <Button asChild>
              <Link href="/inventory/sku-list/new">
                <Icon name="Plus" size={16} className="mr-2" />
                Add SKU
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total SKUs</CardTitle>
                <Icon name="Package" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">All inventory items</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                <Icon name="AlertTriangle" size={16} className="text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.lowStock}</div>
                <p className="text-xs text-muted-foreground">Below minimum level</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Needs Reorder</CardTitle>
                <Icon name="TrendingDown" size={16} className="text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.needsReorder}</div>
                <p className="text-xs text-muted-foreground">At reorder point</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative w-[300px]">
                <Icon name="Search" size={16} className="absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Search SKU code, name, brand..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => filterActions.setPageFilter(pageId, { ...filters, search: e.target.value })}
                />
              </div>

              <Select
                value={categoryFilter}
                onValueChange={(value) => filterActions.setPageFilter(pageId, { ...filters, category: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground">
              {total} {total === 1 ? 'item' : 'items'}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg border bg-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">SKU Code</TableHead>
                  <TableHead className="w-[250px]">Name</TableHead>
                  <TableHead className="w-[120px]">Category</TableHead>
                  <TableHead className="w-[100px]">Brand</TableHead>
                  <TableHead className="w-[80px]">Unit</TableHead>
                  <TableHead className="w-[100px] text-right">Stock</TableHead>
                  <TableHead className="w-[100px] text-right">Min</TableHead>
                  <TableHead className="w-[120px] text-right">Price</TableHead>
                  <TableHead className="w-[80px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : skus.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No SKUs found
                    </TableCell>
                  </TableRow>
                ) : (
                  skus.map((sku) => {
                    const isLowStock = sku.current_stock <= sku.minimum_stock
                    const needsReorder = sku.current_stock <= sku.reorder_point

                    return (
                      <TableRow key={sku.id}>
                        <TableCell>
                          <Link
                            href={`/inventory/sku-list/${sku.id}`}
                            className="font-medium hover:underline"
                          >
                            {sku.sku_code}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{sku.name}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{categoryLabels[sku.category]}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{sku.brand || '-'}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{sku.unit.toUpperCase()}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`text-sm font-medium ${isLowStock ? 'text-red-600' : ''}`}>
                            {sku.current_stock}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm text-muted-foreground">{sku.minimum_stock}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm">{formatCurrency(sku.unit_price)}</span>
                        </TableCell>
                        <TableCell>
                          {needsReorder ? (
                            <Badge variant="destructive" className="text-xs">Reorder</Badge>
                          ) : isLowStock ? (
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
