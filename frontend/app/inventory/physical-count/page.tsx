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
import { stockOpnameApi, type StockOpname, type OpnameStatus } from "@/lib/api/inventory"
import { Icon } from "@/components/ui/icon"

const statusLabels: Record<OpnameStatus, string> = {
  draft: 'Draft',
  in_progress: 'In Progress',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatCurrency = (value?: number) => {
  if (!value) return '-'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

export default function PhysicalCountPage() {
  // Use TanStack Store for filters
  const pageId = "inventory-physical-count"
  const filters = usePageFilters(pageId)
  const searchQuery = filters.search || ""

  // Debounce search query to reduce API calls (waits 500ms after user stops typing)
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  const statusFilter = filters.status || "all"

  const [opnames, setOpnames] = useState<StockOpname[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    pendingApproval: 0,
    completed: 0,
  })

  useEffect(() => {
    fetchOpnames()
  }, [debouncedSearchQuery, statusFilter])

  const fetchOpnames = async () => {
    try {
      setLoading(true)
      const params: Record<string, any> = {}
      if (debouncedSearchQuery) params.search = debouncedSearchQuery
      if (statusFilter !== 'all') params.status = statusFilter

      const response = await stockOpnameApi.list(params)
      setOpnames(response.results)
      setTotal(response.count)

      // Calculate stats
      const inProgress = response.results.filter(o => o.status === 'in_progress').length
      const pendingApproval = response.results.filter(o => o.status === 'pending_approval').length
      const completed = response.results.filter(o => o.status === 'completed').length

      setStats({
        total: response.count,
        inProgress,
        pendingApproval,
        completed,
      })
    } catch (error) {
      console.error("Error fetching opnames:", error)
      setOpnames([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: OpnameStatus) => {
    const config: Record<OpnameStatus, string> = {
      draft: "bg-gray-500",
      in_progress: "bg-blue-500",
      pending_approval: "bg-yellow-500",
      approved: "bg-green-500",
      rejected: "bg-red-500",
      completed: "bg-green-600",
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
                  <BreadcrumbPage>Physical Count</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 max-w-full">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Physical Count (Stock Opname)</h1>
              <p className="text-muted-foreground">
                Manage inventory physical count sessions
              </p>
            </div>
            <Button asChild>
              <Link href="/inventory/physical-count/new">
                <Icon name="Plus" size={16} className="mr-2" />
                New Count
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Counts</CardTitle>
                <Icon name="ClipboardCheck" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">All count sessions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Icon name="Clock" size={16} className="text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inProgress}</div>
                <p className="text-xs text-muted-foreground">Currently counting</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <Icon name="Calendar" size={16} className="text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingApproval}</div>
                <p className="text-xs text-muted-foreground">Awaiting review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <Icon name="CheckCircle" size={16} className="text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completed}</div>
                <p className="text-xs text-muted-foreground">Finished counts</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative w-[300px]">
                <Icon name="Search" size={16} className="absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Search opname number..."
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
            </div>

            <div className="text-sm text-muted-foreground">
              {total} {total === 1 ? 'count' : 'counts'}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg border bg-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Opname Number</TableHead>
                  <TableHead className="w-[150px]">Warehouse</TableHead>
                  <TableHead className="w-[120px]">Scheduled Date</TableHead>
                  <TableHead className="w-[100px] text-right">Total Items</TableHead>
                  <TableHead className="w-[100px] text-right">Counted</TableHead>
                  <TableHead className="w-[100px] text-right">Variance</TableHead>
                  <TableHead className="w-[150px] text-right">Variance Value</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
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
                ) : opnames.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No physical counts found
                    </TableCell>
                  </TableRow>
                ) : (
                  opnames.map((opname) => (
                    <TableRow key={opname.id}>
                      <TableCell>
                        <Link
                          href={`/inventory/physical-count/${opname.id}`}
                          className="font-medium hover:underline"
                        >
                          {opname.opname_number}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{opname.warehouse_name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{formatDate(opname.scheduled_date)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm">{opname.total_items}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-medium">{opname.counted_items}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`text-sm font-medium ${opname.variance_items > 0 ? 'text-red-600' : ''}`}>
                          {opname.variance_items}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm">{formatCurrency(opname.total_variance_value)}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(opname.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/inventory/physical-count/${opname.id}`}>View</Link>
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
