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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { assetsApi, type AssetListItem, type AssetCategory, type AssetStatus } from "@/lib/api/assets"
import { Icon } from "@/components/ui/icon"

const categoryLabels: Record<AssetCategory, string> = {
  it_equipment: 'IT Equipment',
  furniture: 'Furniture',
  vehicle: 'Vehicle',
  office_equipment: 'Office Equipment',
  building: 'Building',
  land: 'Land',
  other: 'Other',
}

const statusLabels: Record<AssetStatus, string> = {
  active: 'Active',
  maintenance: 'Maintenance',
  repair: 'Repair',
  retired: 'Retired',
  lost: 'Lost',
  damaged: 'Damaged',
}

const getInitials = (name?: string) => {
  if (!name) return '??'
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const formatCurrency = (value?: number) => {
  if (!value) return '-'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<AssetListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    maintenance: 0,
    totalValue: 0,
  })

  useEffect(() => {
    fetchAssets()
    fetchStats()
  }, [searchQuery, categoryFilter, statusFilter])

  const fetchAssets = async () => {
    try {
      setLoading(true)
      const params: Record<string, any> = {}

      if (searchQuery) params.search = searchQuery
      if (categoryFilter !== 'all') params.category = categoryFilter
      if (statusFilter !== 'all') params.status = statusFilter

      const response = await assetsApi.list(params)
      setAssets(response.results)
      setTotal(response.count)
    } catch (error) {
      console.error("Error fetching assets:", error)
      setAssets([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const statsData = await assetsApi.statistics()
      const activeCount = statsData.by_status.find(s => s.status === 'active')?.count || 0
      const maintenanceCount = statsData.by_status.find(s => s.status === 'maintenance')?.count || 0

      setStats({
        total: statsData.total,
        active: activeCount,
        maintenance: maintenanceCount,
        totalValue: statsData.total_purchase_value,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const getStatusBadge = (status: AssetStatus) => {
    const config: Record<AssetStatus, string> = {
      active: "bg-green-500",
      maintenance: "bg-yellow-500",
      repair: "bg-orange-500",
      retired: "bg-gray-500",
      lost: "bg-red-500",
      damaged: "bg-red-600",
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
                  <BreadcrumbPage>Assets</BreadcrumbPage>
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
              <h1 className="text-2xl font-bold tracking-tight">Assets</h1>
              <p className="text-muted-foreground">
                Manage and track organizational assets
              </p>
            </div>
            <Button asChild>
              <Link href="/assets/new">
                <Icon name="Plus" size={16} className="mr-2" />
                Add Asset
              </Link>
            </Button>
          </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Icon name="Package" size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All active assets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Icon name="Package" size={16} className="text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">In use or available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Maintenance</CardTitle>
            <Icon name="AlertTriangle" size={16} className="text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.maintenance}</div>
            <p className="text-xs text-muted-foreground">Currently serviced</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Icon name="TrendingUp" size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">Purchase value</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative w-[300px]">
            <Icon name="Search" size={16} className="absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="it_equipment">IT Equipment</SelectItem>
              <SelectItem value="furniture">Furniture</SelectItem>
              <SelectItem value="vehicle">Vehicle</SelectItem>
              <SelectItem value="office_equipment">Office Equipment</SelectItem>
              <SelectItem value="building">Building</SelectItem>
              <SelectItem value="land">Land</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="repair">Repair</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
              <SelectItem value="damaged">Damaged</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">
          {total} {total === 1 ? 'asset' : 'assets'}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Asset</TableHead>
              <TableHead className="w-[120px]">Category</TableHead>
              <TableHead className="w-[150px]">Brand / Model</TableHead>
              <TableHead className="w-[120px]">Location</TableHead>
              <TableHead className="w-[150px]">Current Holder</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[120px]">Purchase Date</TableHead>
              <TableHead className="w-[100px] text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : assets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No assets found
                </TableCell>
              </TableRow>
            ) : (
              assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell>
                    <div className="min-w-0">
                      <Link
                        href={`/assets/${asset.id}`}
                        className="font-medium hover:underline block"
                      >
                        {asset.asset_code}
                      </Link>
                      <div className="text-sm text-muted-foreground truncate">
                        {asset.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{categoryLabels[asset.category]}</span>
                  </TableCell>
                  <TableCell>
                    {asset.brand && asset.model ? (
                      <div className="text-sm">
                        <div className="font-medium">{asset.brand}</div>
                        <div className="text-muted-foreground">{asset.model}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm truncate">
                      {asset.location || asset.department || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {asset.current_holder ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(asset.current_holder.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">
                            {asset.current_holder.full_name || asset.current_holder.email}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Available</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(asset.status)}</TableCell>
                  <TableCell>
                    <span className="text-sm">{formatDate(asset.purchase_date)}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm font-medium">
                      {formatCurrency(asset.current_value || asset.purchase_price)}
                    </span>
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
