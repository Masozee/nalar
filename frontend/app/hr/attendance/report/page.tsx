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
import { Icon } from "@/components/ui/icon"
import { DataTable } from "@/components/ui/data-table"
import { attendanceSummaryColumns } from "./columns"
import { useAttendanceSummary } from "@/lib/hooks/use-hr-query"

export default function AttendanceReportPage() {
  const pageId = "hr-attendance-report"
  const filters = usePageFilters(pageId)
  const searchQuery = filters.search || ""

  // Debounce search query to reduce API calls (waits 500ms after user stops typing)
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString())

  // Pagination
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Sorting
  const [sorting, setSorting] = useState<SortingState>([])

  // Build query params
  const queryParams = {
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
    year: selectedYear,
    month: selectedMonth,
    ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
    ...(sorting.length > 0 && {
      ordering: sorting[0].desc ? `-${sorting[0].id}` : sorting[0].id,
    }),
  }

  // Fetch data with TanStack Query
  const { data, isLoading } = useAttendanceSummary(queryParams)

  const totalStats = (data?.results || []).reduce(
    (acc, summary) => ({
      totalEmployees: acc.totalEmployees + 1,
      totalPresent: acc.totalPresent + summary.present_days,
      totalAbsent: acc.totalAbsent + summary.absent_days,
      totalLate: acc.totalLate + summary.late_days,
      totalWFH: acc.totalWFH + summary.wfh_days,
      totalWorkHours: acc.totalWorkHours + summary.total_work_hours,
      totalOvertimeHours: acc.totalOvertimeHours + summary.total_overtime_hours,
    }),
    {
      totalEmployees: 0,
      totalPresent: 0,
      totalAbsent: 0,
      totalLate: 0,
      totalWFH: 0,
      totalWorkHours: 0,
      totalOvertimeHours: 0,
    }
  )

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]

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
                  <BreadcrumbPage>Attendance Report</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Attendance Report</h1>
              <p className="text-muted-foreground">
                Monthly attendance summary for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Icon name="Download" size={16} className="mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Icon name="Users" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStats.totalEmployees}</div>
                <p className="text-xs text-muted-foreground">Active employees tracked</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Present Days</CardTitle>
                <Icon name="CheckCircle" size={16} className="text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStats.totalPresent}</div>
                <p className="text-xs text-muted-foreground">Total attendance days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Work Hours</CardTitle>
                <Icon name="Clock" size={16} className="text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStats.totalWorkHours.toFixed(1)}h</div>
                <p className="text-xs text-muted-foreground">
                  +{totalStats.totalOvertimeHours.toFixed(1)}h overtime
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Absent Days</CardTitle>
                <Icon name="XCircle" size={16} className="text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStats.totalAbsent}</div>
                <p className="text-xs text-muted-foreground">
                  {totalStats.totalLate} late arrivals
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
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
            </div>
            <div className="flex gap-2">
              <Select value={selectedMonth} onValueChange={(value) => {
                setSelectedMonth(value)
                setPagination((prev) => ({ ...prev, pageIndex: 0 }))
              }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          </div>

          {/* Attendance Report Table */}
          <DataTable
            columns={attendanceSummaryColumns}
            data={data?.results || []}
            pageCount={data?.pageCount || 0}
            pagination={pagination}
            onPaginationChange={setPagination}
            sorting={sorting}
            onSortingChange={setSorting}
            manualPagination
            manualSorting
            isLoading={isLoading}
            emptyMessage="No attendance data found for this period"
            loadingMessage="Loading attendance summaries..."
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
