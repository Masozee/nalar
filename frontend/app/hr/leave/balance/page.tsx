"use client"

import { useState } from "react"
import { PaginationState, SortingState } from "@tanstack/react-table"

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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { DataTable } from "@/components/ui/data-table"
import { leaveBalanceColumns } from "./columns"
import { useLeaveBalances } from "@/lib/hooks/use-hr-query"
import { Icon } from "@/components/ui/icon"

export default function LeaveBalancePage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>("all")

  const pageId = "hr-leave-balance"
  const filters = usePageFilters(pageId)
  const searchQuery = filters.search || ""

  // Debounce search query to reduce API calls (waits 500ms after user stops typing)
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Build query params
  const queryParams = {
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
    year: selectedYear,
    ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
    ...(leaveTypeFilter !== "all" && { leave_type: leaveTypeFilter }),
    ...(sorting.length > 0 && {
      ordering: sorting[0].desc ? `-${sorting[0].id}` : sorting[0].id,
    }),
  }

  // Fetch data with TanStack Query
  const { data, isLoading } = useLeaveBalances(queryParams)

  // Get unique employees
  const uniqueEmployees = new Set((data?.results || []).map(b => b.employee?.id || b.employee).filter(Boolean))

  // Calculate metrics by employee (sum all leave types per employee)
  const employeeStats = (data?.results || []).reduce((acc, balance) => {
    const empId = balance.employee?.id || balance.employee
    if (!acc[empId]) {
      acc[empId] = {
        entitled: 0,
        used: 0,
        remaining: 0,
        carriedOver: 0
      }
    }
    acc[empId].entitled += balance.entitled_days
    acc[empId].used += balance.used_days
    acc[empId].remaining += balance.remaining_days
    acc[empId].carriedOver += balance.carried_over
    return acc
  }, {} as Record<string, { entitled: number, used: number, remaining: number, carriedOver: number }>)

  // Calculate averages per employee
  const employeeCount = Object.keys(employeeStats || {}).length
  const employeeValues = Object.values(employeeStats || {})

  const totalUsed = employeeValues.reduce((sum, e) => sum + (e?.used || 0), 0)
  const totalEntitled = employeeValues.reduce((sum, e) => sum + (e?.entitled || 0), 0)
  const totalRemaining = employeeValues.reduce((sum, e) => sum + (e?.remaining || 0), 0)
  const totalCarriedOver = employeeValues.reduce((sum, e) => sum + (e?.carriedOver || 0), 0)

  const avgStats = employeeCount > 0 ? {
    avgRemaining: isNaN(totalRemaining / employeeCount) ? 0 : Math.round(totalRemaining / employeeCount),
    avgCarriedOver: isNaN(totalCarriedOver / employeeCount) ? 0 : Math.round(totalCarriedOver / employeeCount),
    avgUtilization: totalEntitled > 0 ? Math.round((totalUsed / totalEntitled) * 100) : 0
  } : { avgRemaining: 0, avgCarriedOver: 0, avgUtilization: 0 }

  // Count employees with carried over leave
  const employeesWithCarryOver = employeeValues.filter(e => (e?.carriedOver || 0) > 0).length

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString())

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
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/hr">HR</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Leave Balance</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Leave Balance</h1>
              <p className="text-muted-foreground">
                View employee leave entitlements and balances for {selectedYear}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Icon name="Download" size={16} className="mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Employees</CardTitle>
                <Icon name="Users" size={16} className="text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{uniqueEmployees.size}</div>
                <p className="text-xs text-muted-foreground">{data?.results?.length || 0} leave records</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Utilization</CardTitle>
                <Icon name="TrendingUp" size={16} className="text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgStats.avgUtilization || 0}%</div>
                <p className="text-xs text-muted-foreground">Of entitled days used</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Balance</CardTitle>
                <Icon name="Award" size={16} className="text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgStats.avgRemaining || 0}</div>
                <p className="text-xs text-muted-foreground">Days per employee</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Carried Over</CardTitle>
                <Icon name="Calendar" size={16} className="text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{employeesWithCarryOver || 0}</div>
                <p className="text-xs text-muted-foreground">{avgStats.avgCarriedOver || 0} days avg.</p>
              </CardContent>
            </Card>
          </div>

          {/* Search, Filter and Year Selection */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => {
                    filterActions.setPageFilter(pageId, { ...filters, search: e.target.value })
                    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
                  }}
                  className="pl-9"
                />
              </div>
              <Select value={leaveTypeFilter} onValueChange={(value) => {
                setLeaveTypeFilter(value)
                setPagination((prev) => ({ ...prev, pageIndex: 0 }))
              }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Leave Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="sick">Sick</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="maternity">Maternity</SelectItem>
                  <SelectItem value="paternity">Paternity</SelectItem>
                  <SelectItem value="compassionate">Compassionate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Select value={selectedYear} onValueChange={(value) => {
              setSelectedYear(value)
              setPagination((prev) => ({ ...prev, pageIndex: 0 }))
            }}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Leave Balance Table */}
          <DataTable
            columns={leaveBalanceColumns}
            data={data?.results || []}
            pageCount={data?.pageCount || 0}
            pagination={pagination}
            onPaginationChange={setPagination}
            sorting={sorting}
            onSortingChange={setSorting}
            manualPagination
            manualSorting
            isLoading={isLoading}
            emptyMessage="No leave balance records found"
            loadingMessage="Loading leave balances..."
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
