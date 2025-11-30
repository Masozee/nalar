"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { DataTable } from "@/components/ui/data-table"
import { settlementColumns } from "./columns"
import { useExpenseAdvances } from "@/lib/hooks/use-finance-query"
import type { ExpenseAdvanceListItem } from "@/lib/api/finance"
import { Icon } from "@/components/ui/icon"

const formatCurrency = (amount: string | number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(typeof amount === 'string' ? parseFloat(amount) : amount)
}

const getDaysOutstanding = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

export default function SettlementPage() {
  const router = useRouter()

  const pageId = "finance-settlement"
  const filters = usePageFilters(pageId)
  const searchQuery = filters.search || ""

  // Debounce search query to reduce API calls (waits 500ms after user stops typing)
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Fetch disbursed advances (status = 'disbursed')
  const { data, isLoading } = useExpenseAdvances({ status: 'disbursed' })

  // Filter advances locally - use debounced search for filtering
  const filteredAdvances = debouncedSearchQuery
    ? (data?.results || []).filter(
        (adv: ExpenseAdvanceListItem) =>
          adv.advance_number.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          adv.purpose.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          adv.requester_name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      )
    : (data?.results || [])

  // Sort by balance (highest first)
  const sortedAdvances = [...filteredAdvances].sort((a, b) => b.balance - a.balance)

  const stats = {
    total: data?.results?.length || 0,
    totalBalance: (data?.results || []).reduce((sum, a) => sum + a.balance, 0),
    totalAdvanced: (data?.results || []).reduce((sum, a) => sum + parseFloat(a.amount), 0),
    totalSettled: (data?.results || []).reduce((sum, a) => sum + parseFloat(a.settled_amount), 0),
    urgent: (data?.results || []).filter((a) => getDaysOutstanding(a.created_at) > 30).length,
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
                  <BreadcrumbLink href="/finance">Finance</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Settlement</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 max-w-full">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Advance Settlement</h1>
            <p className="text-muted-foreground mt-1">
              Track and settle disbursed cash advances
            </p>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Settlement</CardTitle>
                <Icon name="Clock" size={16} className="text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Disbursed advances
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
                <Icon name="AlertTriangle" size={16} className="text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalBalance)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  To be settled
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Advanced</CardTitle>
                <Icon name="TrendingUp" size={16} className="text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalAdvanced)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Disbursed amount
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue (&gt;30 days)</CardTitle>
                <Icon name="AlertTriangle" size={16} className="text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.urgent}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Needs attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative w-[400px]">
              <Icon name="Search" size={16} className="absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search by advance number, purpose, or requester..."
                value={searchQuery}
                onChange={(e) => filterActions.setPageFilter(pageId, { ...filters, search: e.target.value })}
                className="pl-8"
              />
            </div>
          </div>

          {/* Settlement Table */}
          <DataTable
            columns={settlementColumns}
            data={sortedAdvances}
            isLoading={isLoading}
            emptyMessage="No advances pending settlement"
            loadingMessage="Loading advances..."
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
