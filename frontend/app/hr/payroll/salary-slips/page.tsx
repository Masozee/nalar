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
import { salarySlipColumns } from "./columns"
import { useSalarySlips } from "@/lib/hooks/use-hr-query"
import { Icon } from "@/components/ui/icon"

export default function SalarySlipsPage() {
  const router = useRouter()
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const [paidFilter, setPaidFilter] = useState<string>("all")
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString())

  const pageId = "hr-payroll-salary-slips"
  const filters = usePageFilters(pageId)
  const searchQuery = filters.search || ""

  // Debounce search query to reduce API calls (waits 500ms after user stops typing)
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Build query params
  const queryParams = {
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
    year: selectedYear,
    month: selectedMonth,
    ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
    ...(paidFilter !== "all" && { paid: paidFilter === "paid" }),
    ...(sorting.length > 0 && {
      ordering: sorting[0].desc ? `-${sorting[0].id}` : sorting[0].id,
    }),
  }

  // Fetch data with TanStack Query
  const { data, isLoading } = useSalarySlips(queryParams)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const totalStats = (data?.results || []).reduce(
    (acc, slip) => ({
      totalBasic: acc.totalBasic + slip.basic_salary,
      totalAllowances: acc.totalAllowances + slip.allowances,
      totalDeductions: acc.totalDeductions + slip.deductions,
      totalTax: acc.totalTax + slip.tax,
      totalGross: acc.totalGross + slip.gross_salary,
      totalNet: acc.totalNet + slip.net_salary,
      paidSlips: acc.paidSlips + (slip.paid ? 1 : 0),
    }),
    {
      totalBasic: 0,
      totalAllowances: 0,
      totalDeductions: 0,
      totalTax: 0,
      totalGross: 0,
      totalNet: 0,
      paidSlips: 0,
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
                  <BreadcrumbPage>Salary Slips</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Salary Slips</h1>
              <p className="text-muted-foreground">
                View and manage employee salary slips for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Icon name="Download" size={16} className="mr-2" />
                Export All
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Gross</CardTitle>
                <Icon name="TrendingUp" size={16} className="text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalStats.totalGross)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(totalStats.totalBasic)} basic + {formatCurrency(totalStats.totalAllowances)} allowances
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
                <Icon name="TrendingDown" size={16} className="text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalStats.totalDeductions + totalStats.totalTax)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(totalStats.totalTax)} tax + {formatCurrency(totalStats.totalDeductions)} deductions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Net</CardTitle>
                <Icon name="DollarSign" size={16} className="text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalStats.totalNet)}</div>
                <p className="text-xs text-muted-foreground">After all deductions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid Slips</CardTitle>
                <Icon name="CheckCircle" size={16} className="text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStats.paidSlips}/{data?.results?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {(data?.results?.length || 0) - totalStats.paidSlips} pending
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
              <Select value={paidFilter} onValueChange={(value) => {
                setPaidFilter(value)
                setPagination((prev) => ({ ...prev, pageIndex: 0 }))
              }}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
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

          {/* Salary Slips Table */}
          <DataTable
            columns={salarySlipColumns}
            data={data?.results || []}
            pageCount={data?.pageCount || 0}
            pagination={pagination}
            onPaginationChange={setPagination}
            sorting={sorting}
            onSortingChange={setSorting}
            manualPagination
            manualSorting
            isLoading={isLoading}
            emptyMessage="No salary slips found for this period"
            loadingMessage="Loading salary slips..."
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
