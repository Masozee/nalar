"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { SortingState } from "@tanstack/react-table"

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { vendorApi } from "@/lib/api/procurement"
import { Icon } from "@/components/ui/icon"
import { DataTable } from "@/components/ui/data-table"
import { vendorEvaluationColumns } from "./columns"
import { useVendorEvaluations } from "@/lib/hooks/use-procurement-query"

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function VendorEvaluationPage() {
  const [vendors, setVendors] = useState<any[]>([])
  const [vendorFilter, setVendorFilter] = useState<string>("all")

  const pageId = "procurement-vendor-evaluation"
  const filters = usePageFilters(pageId)
  const searchQuery = filters.search || ""

  // Debounce search query to reduce API calls (waits 500ms after user stops typing)
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Sorting
  const [sorting, setSorting] = useState<SortingState>([])

  // Fetch vendors for filter dropdown
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await vendorApi.active()
        setVendors(response)
      } catch (error) {
        console.error("Error fetching vendors:", error)
      }
    }
    fetchVendors()
  }, [])

  // Build query params
  const queryParams = {
    ...(vendorFilter !== 'all' && { vendor: vendorFilter }),
  }

  // Fetch data with TanStack Query
  const { data: evaluationsData, isLoading } = useVendorEvaluations(queryParams)

  // Filter data client-side for search - use debounced search for filtering
  const filteredData = useMemo(() => {
    if (!evaluationsData?.results) return []

    let filtered = evaluationsData.results

    if (debouncedSearchQuery) {
      filtered = filtered.filter(e =>
        e.vendor_name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      )
    }

    return filtered
  }, [evaluationsData, debouncedSearchQuery])

  // Calculate stats from filtered data
  const stats = useMemo(() => {
    if (filteredData.length === 0) {
      return { total: 0, avgScore: 0, excellent: 0, needsImprovement: 0 }
    }

    const avgScore = filteredData.reduce((sum, e) => sum + parseFloat(e.overall_score), 0) / filteredData.length
    const excellent = filteredData.filter(e => parseFloat(e.overall_score) >= 4.5).length
    const needsImprovement = filteredData.filter(e => parseFloat(e.overall_score) < 3).length

    return {
      total: filteredData.length,
      avgScore,
      excellent,
      needsImprovement,
    }
  }, [filteredData])

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
                  <BreadcrumbLink href="/procurement">Procurement</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Vendor Evaluation</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 max-w-full">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Vendor Evaluation</h1>
              <p className="text-muted-foreground">
                Periodic vendor performance assessments
              </p>
            </div>
            <Button asChild>
              <Link href="/procurement/vendor-evaluation/new">
                <Icon name="Plus" size={16} className="mr-2" />
                New Evaluation
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Evaluations</CardTitle>
                <Icon name="Star" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">All assessments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <Icon name="TrendingUp" size={16} className="text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgScore.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Out of 5.00</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Excellent (≥4.5)</CardTitle>
                <Icon name="Award" size={16} className="text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.excellent}</div>
                <p className="text-xs text-muted-foreground">High performers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Needs Improvement</CardTitle>
                <Icon name="Star" size={16} className="text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.needsImprovement}</div>
                <p className="text-xs text-muted-foreground">Score &lt; 3.0</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative w-[300px]">
                <Icon name="Search" size={16} className="absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Search vendor name..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => filterActions.setPageFilter(pageId, { ...filters, search: e.target.value })}
                />
              </div>

              <Select value={vendorFilter} onValueChange={setVendorFilter}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.code} - {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground">
              {filteredData.length} {filteredData.length === 1 ? 'evaluation' : 'evaluations'}
            </div>
          </div>

          {/* Table */}
          <DataTable
            columns={vendorEvaluationColumns}
            data={filteredData}
            sorting={sorting}
            onSortingChange={setSorting}
            isLoading={isLoading}
            emptyMessage="No evaluations found"
            loadingMessage="Loading evaluations..."
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
