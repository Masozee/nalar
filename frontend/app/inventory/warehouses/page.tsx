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
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { warehouseApi } from "@/lib/api/inventory"
import { Icon } from "@/components/ui/icon"
import { DataTable } from "@/components/ui/data-table"
import { warehouseColumns, type Warehouse } from "./columns"

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  const pageId = "inventory-warehouses"
  const filters = usePageFilters(pageId)
  const searchQuery = filters.search || ""

  // Debounce search query to reduce API calls (waits 500ms after user stops typing)
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  useEffect(() => {
    fetchWarehouses()
  }, [debouncedSearchQuery])

  const fetchWarehouses = async () => {
    try {
      setLoading(true)
      const params: Record<string, any> = {}
      if (debouncedSearchQuery) params.search = debouncedSearchQuery

      const response = await warehouseApi.list(params)
      setWarehouses(response.results)
      setTotal(response.count)
    } catch (error) {
      console.error("Error fetching warehouses:", error)
      setWarehouses([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
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
                  <BreadcrumbPage>Warehouses</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 max-w-full">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Warehouses</h1>
              <p className="text-muted-foreground">
                Manage warehouse and storage locations
              </p>
            </div>
            <Button asChild>
              <Link href="/inventory/warehouses/new">
                <Icon name="Plus" size={16} className="mr-2" />
                Add Warehouse
              </Link>
            </Button>
          </div>

          {/* Stats Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Warehouses</CardTitle>
              <Icon name="Warehouse" size={16} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{total}</div>
              <p className="text-xs text-muted-foreground">Active storage locations</p>
            </CardContent>
          </Card>

          {/* Filters */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-[300px]">
              <Icon name="Search" size={16} className="absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search warehouses..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => filterActions.setPageFilter(pageId, { ...filters, search: e.target.value })}
              />
            </div>

            <div className="text-sm text-muted-foreground">
              {total} {total === 1 ? 'warehouse' : 'warehouses'}
            </div>
          </div>

          {/* Table */}
          <DataTable
            columns={warehouseColumns}
            data={warehouses}
            isLoading={loading}
            emptyMessage="No warehouses found"
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
