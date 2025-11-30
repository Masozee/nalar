"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { payrollPeriodColumns } from "./columns"
import { usePayrollPeriods } from "@/lib/hooks/use-hr-query"
import { Icon } from "@/components/ui/icon"

export default function PayrollPeriodsPage() {
  const router = useRouter()
  const pageId = "hr-payroll-periods"
  const filters = usePageFilters(pageId)
  const searchQuery = filters.search || ""

  // Debounce search query to reduce API calls (waits 500ms after user stops typing)
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  const statusFilter = filters.status || "all"

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())

  // Build query params
  const queryParams = {
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
    year: selectedYear,
    ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(sorting.length > 0 && {
      ordering: sorting[0].desc ? `-${sorting[0].id}` : sorting[0].id,
    }),
  }

  // Fetch data with TanStack Query
  const { data, isLoading } = usePayrollPeriods(queryParams)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const totalStats = (data?.results || []).reduce(
    (acc, period) => ({
      totalEmployees: acc.totalEmployees + period.total_employees,
      totalGross: acc.totalGross + period.total_gross_salary,
      totalDeductions: acc.totalDeductions + period.total_deductions,
      totalNet: acc.totalNet + period.total_net_salary,
    }),
    {
      totalEmployees: 0,
      totalGross: 0,
      totalDeductions: 0,
      totalNet: 0,
    }
  )

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
                  <BreadcrumbPage>Payroll Periods</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Payroll Periods</h1>
              <p className="text-muted-foreground">
                Manage payroll periods and salary processing for {selectedYear}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Icon name="Download" size={16} className="mr-2" />
                Export
              </Button>
              <Button size="sm" onClick={() => router.push('/hr/payroll/periods/new')}>
                <Icon name="Plus" size={16} className="mr-2" />
                New Period
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Icon name="Users" size={16} className="text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStats.totalEmployees}</div>
                <p className="text-xs text-muted-foreground">Across all periods</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Gross</CardTitle>
                <Icon name="TrendingUp" size={16} className="text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalStats.totalGross)}</div>
                <p className="text-xs text-muted-foreground">Before deductions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
                <Icon name="DollarSign" size={16} className="text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalStats.totalDeductions)}</div>
                <p className="text-xs text-muted-foreground">Taxes & contributions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Net</CardTitle>
                <Icon name="CheckCircle" size={16} className="text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalStats.totalNet)}</div>
                <p className="text-xs text-muted-foreground">After deductions</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search periods..."
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
              <Select value={statusFilter} onValueChange={(value) => {
                filterActions.setPageFilter(pageId, { ...filters, status: value })
                setPagination((prev) => ({ ...prev, pageIndex: 0 }))
              }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="finalized">Finalized</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
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

          {/* Payroll Periods Table */}
          <DataTable
            columns={payrollPeriodColumns}
            data={data?.results || []}
            pageCount={data?.pageCount || 0}
            pagination={pagination}
            onPaginationChange={setPagination}
            sorting={sorting}
            onSortingChange={setSorting}
            manualPagination
            manualSorting
            isLoading={isLoading}
            emptyMessage="No payroll periods found"
            loadingMessage="Loading payroll periods..."
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
