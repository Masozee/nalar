"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
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
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { grantDisbursementApi } from "@/lib/api/research"
import { Icon } from "@/components/ui/icon"
import { DataTable } from "@/components/ui/data-table"
import { disbursementColumns } from "./columns"

export default function DisbursementsPage() {
  const pageId = "research-disbursements"
  const filters = usePageFilters(pageId)
  const searchQuery = filters.search || ""

  // Debounce search query to reduce API calls (waits 500ms after user stops typing)
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  const statusFilter = filters.status || "all"

  const { data: disbursementsData, isLoading } = useQuery({
    queryKey: ["disbursements"],
    queryFn: () => grantDisbursementApi.list(),
  })

  const disbursements = disbursementsData?.results || []

  const filteredDisbursements = useMemo(() => {
    return disbursements.filter((disbursement) => {
      const matchesSearch =
        disbursement.disbursement_number.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        disbursement.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || disbursement.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [disbursements, debouncedSearchQuery, statusFilter])

  const requestedCount = disbursements.filter((d) => d.status === "requested").length
  const approvedCount = disbursements.filter((d) => d.status === "approved").length
  const disbursedCount = disbursements.filter((d) => d.status === "disbursed").length
  const totalDisbursed = disbursements
    .filter((d) => d.status === "disbursed")
    .reduce((sum, d) => sum + parseFloat(d.amount), 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <header className="bg-background sticky top-0 flex shrink-0 items-center justify-between gap-2 border-b p-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/research">Research</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Disbursements</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Grant Disbursements</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Track grant fund disbursements and payments
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Requested</CardTitle>
                <Icon name="Clock" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{requestedCount}</div>
                <p className="text-xs text-muted-foreground">Pending approval</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <Icon name="CheckCircle" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{approvedCount}</div>
                <p className="text-xs text-muted-foreground">Ready to disburse</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disbursed</CardTitle>
                <Icon name="Download" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{disbursedCount}</div>
                <p className="text-xs text-muted-foreground">Completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Disbursed</CardTitle>
                <Icon name="DollarSign" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalDisbursed)}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Icon name="Search" size={16} className="absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search disbursements..."
                value={searchQuery}
                onChange={(e) => filterActions.setPageFilter(pageId, { ...filters, search: e.target.value })}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={(value) => filterActions.setPageFilter(pageId, { ...filters, status: value })}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="disbursed">Disbursed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <DataTable
            columns={disbursementColumns}
            data={filteredDisbursements}
            isLoading={isLoading}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
