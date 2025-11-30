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
import { maintenanceRecordsApi, type MaintenanceRecordListItem, type MaintenanceType, type MaintenanceStatus } from "@/lib/api/assets"
import { Icon } from "@/components/ui/icon"

const typeLabels: Record<MaintenanceType, string> = {
  preventive: 'Preventive',
  corrective: 'Corrective',
  inspection: 'Inspection',
}

const statusLabels: Record<MaintenanceStatus, string> = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  pending_parts: 'Pending Parts',
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

export default function MaintenanceRecordsPage() {
  // Use TanStack Store for filters
  const pageId = "assets-maintenance"
  const filters = usePageFilters(pageId)
  const searchQuery = filters.search || ""
  const statusFilter = filters.status || "all"

  // Debounce search query to reduce API calls (waits 500ms after user stops typing)
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const [records, setRecords] = useState<MaintenanceRecordListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [typeFilter, setTypeFilter] = useState<string>("all")

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    totalCost: 0,
    avgCost: 0,
  })

  useEffect(() => {
    fetchRecords()
    fetchStats()
  }, [debouncedSearchQuery, typeFilter, statusFilter])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const params: Record<string, any> = {}

      if (debouncedSearchQuery) params.search = debouncedSearchQuery
      if (typeFilter !== 'all') params.maintenance_type = typeFilter
      if (statusFilter !== 'all') params.status = statusFilter

      const response = await maintenanceRecordsApi.list(params)
      setRecords(response.results)
      setTotal(response.count)
    } catch (error) {
      console.error("Error fetching records:", error)
      setRecords([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const pendingData = await maintenanceRecordsApi.pending()
      const costData = await maintenanceRecordsApi.costSummary()

      const totalCost = costData.by_type.reduce((sum, t) => sum + (t.total_cost || 0), 0)
      const totalCount = costData.by_type.reduce((sum, t) => sum + t.count, 0)

      setStats({
        total: total,
        pending: pendingData.length,
        totalCost,
        avgCost: totalCount > 0 ? totalCost / totalCount : 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const getStatusBadge = (status: MaintenanceStatus) => {
    const config: Record<MaintenanceStatus, string> = {
      scheduled: "bg-blue-500",
      in_progress: "bg-yellow-500",
      completed: "bg-green-500",
      cancelled: "bg-gray-500",
      pending_parts: "bg-orange-500",
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
                  <BreadcrumbLink href="/assets">Assets</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Maintenance Records</BreadcrumbPage>
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
              <h1 className="text-2xl font-bold tracking-tight">Maintenance Records</h1>
              <p className="text-muted-foreground">
                Track asset maintenance and repairs
              </p>
            </div>
            <Button asChild>
              <Link href="/assets/maintenance/new">
                <Icon name="Plus" size={16} className="mr-2" />
                New Record
              </Link>
            </Button>
          </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Icon name="Wrench" size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">All maintenance records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Icon name="AlertCircle" size={16} className="text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Scheduled or in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <Icon name="DollarSign" size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalCost)}</div>
            <p className="text-xs text-muted-foreground">All completed work</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Cost</CardTitle>
            <Icon name="DollarSign" size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.avgCost)}</div>
            <p className="text-xs text-muted-foreground">Per maintenance</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative w-[300px]">
            <Icon name="Search" size={16} className="absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Search maintenance records..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => filterActions.setPageFilter(pageId, { ...filters, search: e.target.value })}
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="preventive">Preventive</SelectItem>
              <SelectItem value="corrective">Corrective</SelectItem>
              <SelectItem value="inspection">Inspection</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(value) => filterActions.setPageFilter(pageId, { ...filters, status: value })}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="pending_parts">Pending Parts</SelectItem>
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
              <TableHead className="w-[200px]">Asset</TableHead>
              <TableHead className="w-[200px]">Title</TableHead>
              <TableHead className="w-[100px]">Type</TableHead>
              <TableHead className="w-[120px]">Scheduled Date</TableHead>
              <TableHead className="w-[120px]">Completed</TableHead>
              <TableHead className="w-[150px]">Vendor</TableHead>
              <TableHead className="w-[150px]">Assigned To</TableHead>
              <TableHead className="w-[100px]">Cost</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No maintenance records found
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="min-w-0">
                      <Link
                        href={`/assets/${record.asset}`}
                        className="font-medium hover:underline block"
                      >
                        {record.asset_code}
                      </Link>
                      <div className="text-sm text-muted-foreground truncate">
                        {record.asset_name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/assets/maintenance/${record.id}`}
                      className="font-medium hover:underline"
                    >
                      {record.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{typeLabels[record.maintenance_type]}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{formatDate(record.scheduled_date)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{formatDate(record.completed_at)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm truncate">{record.vendor || '-'}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm truncate">{record.assigned_to_name || '-'}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{formatCurrency(record.total_cost)}</span>
                  </TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/assets/maintenance/${record.id}`}>View</Link>
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
