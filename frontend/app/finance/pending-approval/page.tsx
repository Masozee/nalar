"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { usePageFilters, filterActions } from "@/lib/store"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { DataTable } from "@/components/ui/data-table"
import { pendingApprovalColumns } from "./columns"
import { usePendingApprovalRequests } from "@/lib/hooks/use-finance-query"
import { Icon } from "@/components/ui/icon"

const formatCurrency = (amount: string) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(parseFloat(amount))
}

const getWaitingDays = (requestDate: string) => {
  const now = new Date()
  const request = new Date(requestDate)
  const diff = Math.floor((now.getTime() - request.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

export default function PendingApprovalPage() {
  const router = useRouter()

  // Use TanStack Store for filters
  const pageId = "finance-pending-approval"
  const filters = usePageFilters(pageId)
  const searchQuery = filters.search || ""

  // Fetch data with TanStack Query
  const { data: expenses = [], isLoading } = usePendingApprovalRequests()

  // Filter expenses locally (since this endpoint doesn't support pagination)
  const filteredExpenses = searchQuery
    ? expenses.filter(
        (exp) =>
          exp.request_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exp.requester_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (exp.department && exp.department.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : expenses

  // Sort by request date (oldest first)
  const sortedExpenses = [...filteredExpenses].sort(
    (a, b) => new Date(a.request_date).getTime() - new Date(b.request_date).getTime()
  )

  const totalAmount = expenses.reduce((sum, exp) => sum + parseFloat(exp.total_amount), 0)
  const urgentCount = expenses.filter((exp) => getWaitingDays(exp.request_date) > 3).length
  const highValueCount = expenses.filter((exp) => parseFloat(exp.total_amount) > 5000000).length

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
                  <BreadcrumbLink href="/finance">Finance</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Pending Approval</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 max-w-full">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Pending Approval</h1>
            <p className="text-muted-foreground mt-1">
              Review and approve expense reimbursement requests
            </p>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <Icon name="Clock" size={16} className="text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{expenses.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Awaiting approval
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Urgent</CardTitle>
                <Icon name="AlertCircle" size={16} className="text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{urgentCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Waiting &gt; 3 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Value</CardTitle>
                <Icon name="TrendingUp" size={16} className="text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{highValueCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  &gt; Rp 5,000,000
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <Icon name="DollarSign" size={16} className="text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalAmount.toString())}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Pending amount
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-[400px]">
              <Icon name="Search" size={16} className="absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search by request number, title, requester, or department..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => filterActions.setPageFilter(pageId, { ...filters, search: e.target.value })}
              />
            </div>
          </div>

          {/* Pending Requests Table */}
          <DataTable
            columns={pendingApprovalColumns}
            data={sortedExpenses}
            isLoading={isLoading}
            emptyMessage="No pending requests found"
            loadingMessage="Loading pending requests..."
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
