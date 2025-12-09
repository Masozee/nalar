"use client"

import { useState } from "react"
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
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Icon } from "@/components/ui/icon"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/ui/data-table"
import { useCurrentSubscription, useCurrentTenant, useInvoices } from "@/lib/hooks/use-tenants-query"
import { usePageSize } from "@/lib/store"
import { format } from "date-fns"
import { PaginationState } from "@tanstack/react-table"
import { invoiceColumns } from "./invoice-columns"

export default function BillingPage() {
  // Page state
  const defaultPageSize = usePageSize()
  const [activeTab, setActiveTab] = useState("overview")

  // Fetch data with TanStack Query
  const { data: subscription, isLoading: subscriptionLoading } = useCurrentSubscription()
  const { data: tenant, isLoading: tenantLoading } = useCurrentTenant()

  // Invoice pagination
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  })

  const invoiceQueryParams = {
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
  }

  const { data: invoicesData, isLoading: invoicesLoading } = useInvoices(invoiceQueryParams)
  const invoices = invoicesData?.results || []

  const isLoading = subscriptionLoading || tenantLoading

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    try {
      return format(new Date(dateString), "MMM d, yyyy")
    } catch {
      return dateString
    }
  }

  const getPlanBadgeColor = (plan: string) => {
    const colors: Record<string, string> = {
      free: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      starter: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      professional: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      enterprise: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    }
    return colors[plan] || "bg-gray-100 text-gray-800"
  }

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      trial: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      suspended: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  return (
    <>
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
                <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Billing & Subscription</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <TopNavbar />
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Billing & Subscription</h1>
            <p className="text-muted-foreground">
              Manage your subscription plan and billing settings
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
            {/* Current Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Your active subscription details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <Badge className={getPlanBadgeColor(tenant?.plan || "free")}>
                    {tenant?.plan?.toUpperCase() || "FREE"}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className={getStatusBadgeColor(tenant?.status || "trial")}>
                    {tenant?.status?.toUpperCase() || "TRIAL"}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Started</span>
                  <span className="font-medium">{formatDate(subscription?.start_date || null)}</span>
                </div>
                {subscription?.trial_end_date && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Trial Ends</span>
                      <span className="font-medium text-yellow-600">
                        {formatDate(subscription.trial_end_date)}
                      </span>
                    </div>
                  </>
                )}
                {subscription?.end_date && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Renews On</span>
                      <span className="font-medium">{formatDate(subscription.end_date)}</span>
                    </div>
                  </>
                )}
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Auto Renew</span>
                  <span className="font-medium">
                    {subscription?.auto_renew ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Plan Limits */}
            <Card>
              <CardHeader>
                <CardTitle>Plan Limits</CardTitle>
                <CardDescription>Usage limits for your current plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Max Users</span>
                  <span className="font-medium">{tenant?.max_users || 0}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Enabled Modules</span>
                  <span className="font-medium">
                    {tenant?.enabled_modules?.length || 0} modules
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Available Plans */}
            <Card>
              <CardHeader>
                <CardTitle>Available Plans</CardTitle>
                <CardDescription>Choose the plan that fits your needs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Free Plan */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Free</CardTitle>
                      <CardDescription>For individuals</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-3xl font-bold">$0</div>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <Icon name="Check" size={16} className="text-green-600" />
                          5 users
                        </li>
                        <li className="flex items-center gap-2">
                          <Icon name="Check" size={16} className="text-green-600" />
                          Basic modules
                        </li>
                        <li className="flex items-center gap-2">
                          <Icon name="Check" size={16} className="text-green-600" />
                          Community support
                        </li>
                      </ul>
                      <Button
                        variant={tenant?.plan === "free" ? "outline" : "default"}
                        className="w-full"
                        disabled={tenant?.plan === "free"}
                      >
                        {tenant?.plan === "free" ? "Current Plan" : "Downgrade"}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Starter Plan */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Starter</CardTitle>
                      <CardDescription>For small teams</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-3xl font-bold">$29<span className="text-sm text-muted-foreground">/mo</span></div>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <Icon name="Check" size={16} className="text-green-600" />
                          25 users
                        </li>
                        <li className="flex items-center gap-2">
                          <Icon name="Check" size={16} className="text-green-600" />
                          All modules
                        </li>
                        <li className="flex items-center gap-2">
                          <Icon name="Check" size={16} className="text-green-600" />
                          Email support
                        </li>
                      </ul>
                      <Button
                        variant={tenant?.plan === "starter" ? "outline" : "default"}
                        className="w-full"
                        disabled={tenant?.plan === "starter"}
                      >
                        {tenant?.plan === "starter" ? "Current Plan" : "Upgrade"}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Professional Plan */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Professional</CardTitle>
                      <CardDescription>For growing companies</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-3xl font-bold">$99<span className="text-sm text-muted-foreground">/mo</span></div>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <Icon name="Check" size={16} className="text-green-600" />
                          100 users
                        </li>
                        <li className="flex items-center gap-2">
                          <Icon name="Check" size={16} className="text-green-600" />
                          All modules + API
                        </li>
                        <li className="flex items-center gap-2">
                          <Icon name="Check" size={16} className="text-green-600" />
                          Priority support
                        </li>
                      </ul>
                      <Button
                        variant={tenant?.plan === "professional" ? "outline" : "default"}
                        className="w-full"
                        disabled={tenant?.plan === "professional"}
                      >
                        {tenant?.plan === "professional" ? "Current Plan" : "Upgrade"}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Enterprise Plan */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Enterprise</CardTitle>
                      <CardDescription>For large organizations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-3xl font-bold">Custom</div>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <Icon name="Check" size={16} className="text-green-600" />
                          Unlimited users
                        </li>
                        <li className="flex items-center gap-2">
                          <Icon name="Check" size={16} className="text-green-600" />
                          Custom modules
                        </li>
                        <li className="flex items-center gap-2">
                          <Icon name="Check" size={16} className="text-green-600" />
                          Dedicated support
                        </li>
                      </ul>
                      <Button
                        variant={tenant?.plan === "enterprise" ? "outline" : "default"}
                        className="w-full"
                        disabled={tenant?.plan === "enterprise"}
                      >
                        {tenant?.plan === "enterprise" ? "Current Plan" : "Contact Sales"}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
            </TabsContent>

            <TabsContent value="invoices" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription History</CardTitle>
                  <CardDescription>View all your invoices and payment history</CardDescription>
                </CardHeader>
                <CardContent>
                  {invoicesLoading ? (
                    <div className="flex items-center justify-center p-12">
                      <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
                    </div>
                  ) : invoices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                      <Icon name="FileText" size={48} className="text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Invoices Yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Your invoice history will appear here once you have transactions
                      </p>
                    </div>
                  ) : (
                    <DataTable
                      columns={invoiceColumns}
                      data={invoices}
                      pageCount={invoicesData?.pageCount || 0}
                      pagination={pagination}
                      onPaginationChange={setPagination}
                      manualPagination
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </>
  )
}
