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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { assetAssignmentsApi, type AssetAssignmentListItem, type AssignmentType, type AssignmentStatus } from "@/lib/api/assets"
import { Icon } from "@/components/ui/icon"

const typeLabels: Record<AssignmentType, string> = {
  permanent: 'Permanent',
  temporary: 'Temporary',
  project: 'Project',
}

const statusLabels: Record<AssignmentStatus, string> = {
  active: 'Active',
  returned: 'Returned',
  transferred: 'Transferred',
  lost: 'Lost',
  damaged: 'Damaged',
}

const getInitials = (name?: string) => {
  if (!name) return '??'
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export default function AssetAssignmentsPage() {
  // Use TanStack Store for filters
  const pageId = "assets-assignment"
  const filters = usePageFilters(pageId)
  const searchQuery = filters.search || ""
  const statusFilter = filters.status || "all"

  // Debounce search query to reduce API calls (waits 500ms after user stops typing)
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const [assignments, setAssignments] = useState<AssetAssignmentListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [typeFilter, setTypeFilter] = useState<string>("all")

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    overdue: 0,
  })

  useEffect(() => {
    fetchAssignments()
    fetchStats()
  }, [debouncedSearchQuery, typeFilter, statusFilter])

  const fetchAssignments = async () => {
    try {
      setLoading(true)
      const params: Record<string, any> = {}

      if (debouncedSearchQuery) params.search = debouncedSearchQuery
      if (typeFilter !== 'all') params.assignment_type = typeFilter
      if (statusFilter !== 'all') params.status = statusFilter

      const response = await assetAssignmentsApi.list(params)
      setAssignments(response.results)
      setTotal(response.count)
    } catch (error) {
      console.error("Error fetching assignments:", error)
      setAssignments([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const overdueData = await assetAssignmentsApi.overdueReturns()
      const allData = await assetAssignmentsApi.list({ status: 'active' })

      setStats({
        total: total,
        active: allData.count,
        overdue: overdueData.length,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const getStatusBadge = (status: AssignmentStatus) => {
    const config: Record<AssignmentStatus, string> = {
      active: "bg-green-500",
      returned: "bg-blue-500",
      transferred: "bg-purple-500",
      lost: "bg-red-500",
      damaged: "bg-orange-500",
    }

    return (
      <Badge className={config[status]}>
        {statusLabels[status]}
      </Badge>
    )
  }

  const isOverdue = (expectedReturn?: string) => {
    if (!expectedReturn) return false
    return new Date(expectedReturn) < new Date()
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
                  <BreadcrumbPage>Asset Assignments</BreadcrumbPage>
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
              <h1 className="text-2xl font-bold tracking-tight">Asset Assignments</h1>
              <p className="text-muted-foreground">
                Track asset assignments to employees
              </p>
            </div>
            <Button asChild>
              <Link href="/assets/assignment/new">
                <Icon name="Plus" size={16} className="mr-2" />
                New Assignment
              </Link>
            </Button>
          </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <Icon name="UserCheck" size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">All assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Icon name="CheckCircle" size={16} className="text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Currently assigned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Returns</CardTitle>
            <Icon name="AlertTriangle" size={16} className="text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">Past return date</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative w-[300px]">
            <Icon name="Search" size={16} className="absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Search assignments..."
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
              <SelectItem value="permanent">Permanent</SelectItem>
              <SelectItem value="temporary">Temporary</SelectItem>
              <SelectItem value="project">Project</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(value) => filterActions.setPageFilter(pageId, { ...filters, status: value })}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
              <SelectItem value="transferred">Transferred</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
              <SelectItem value="damaged">Damaged</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">
          {total} {total === 1 ? 'assignment' : 'assignments'}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Asset</TableHead>
              <TableHead className="w-[180px]">Assigned To</TableHead>
              <TableHead className="w-[120px]">Type</TableHead>
              <TableHead className="w-[120px]">Assigned Date</TableHead>
              <TableHead className="w-[120px]">Expected Return</TableHead>
              <TableHead className="w-[200px]">Purpose</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No assignments found
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>
                    <div className="min-w-0">
                      <Link
                        href={`/assets/${assignment.asset}`}
                        className="font-medium hover:underline block"
                      >
                        {assignment.asset_code}
                      </Link>
                      <div className="text-sm text-muted-foreground truncate">
                        {assignment.asset_name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(assignment.assigned_to_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">
                          {assignment.assigned_to_name}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{typeLabels[assignment.assignment_type]}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{formatDate(assignment.assigned_date)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="text-sm">{formatDate(assignment.expected_return_date)}</span>
                      {isOverdue(assignment.expected_return_date) && assignment.status === 'active' && (
                        <Icon name="AlertTriangle" size={12} className="text-red-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm truncate">{assignment.purpose || '-'}</span>
                  </TableCell>
                  <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/assets/assignment/${assignment.id}`}>View</Link>
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
