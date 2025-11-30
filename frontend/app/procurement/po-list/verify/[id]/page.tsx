"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { purchaseOrderApi, type PurchaseOrder, type POStatus } from "@/lib/api/procurement"
import { Icon } from "@/components/ui/icon"

const statusLabels: Record<POStatus, string> = {
  draft: 'Draf',
  pending_approval: 'Menunggu Persetujuan',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  sent: 'Dikirim ke Vendor',
  partial: 'Penerimaan Sebagian',
  received: 'Diterima Lengkap',
  cancelled: 'Dibatalkan',
  closed: 'Selesai',
}

const statusColors: Record<POStatus, string> = {
  draft: 'bg-gray-500',
  pending_approval: 'bg-yellow-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
  sent: 'bg-blue-500',
  partial: 'bg-orange-500',
  received: 'bg-green-600',
  cancelled: 'bg-gray-400',
  closed: 'bg-gray-700',
}

const formatCurrency = (amount: string) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(parseFloat(amount))
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function POVerifyPage() {
  const params = useParams()
  const [po, setPo] = useState<PurchaseOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchPO()
    }
  }, [params.id])

  const fetchPO = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await purchaseOrderApi.get(params.id as string)
      setPo(data)
    } catch (error: any) {
      console.error("Error fetching PO:", error)
      setError(error.message || "Failed to load purchase order")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <SidebarProvider style={{ "--sidebar-width": "350px" } as React.CSSProperties}>
        <AppSidebar />
        <SidebarInset>
          <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <div className="text-muted-foreground">Loading...</div>
            <div className="ml-auto">
              <TopNavbar />
            </div>
          </header>
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="text-center space-y-2">
              <Icon name="Loader2" size={40} className="animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Verifying purchase order...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (error || !po) {
    return (
      <SidebarProvider style={{ "--sidebar-width": "350px" } as React.CSSProperties}>
        <AppSidebar />
        <SidebarInset>
          <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <div className="text-muted-foreground">Verification Failed</div>
            <div className="ml-auto">
              <TopNavbar />
            </div>
          </header>
          <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <Icon name="AlertCircle" size={40} className="text-red-600" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Invalid Purchase Order</h2>
              <p className="text-muted-foreground max-w-md">
                {error || "The purchase order could not be found or verified. Please check the QR code and try again."}
              </p>
            </div>
            <Button asChild>
              <Link href="/procurement/po-list">
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Back to PO List
              </Link>
            </Button>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  const isValid = po.status !== 'cancelled' && po.status !== 'rejected'

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
                  <BreadcrumbLink href="/procurement/po-list">PO List</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Verify PO</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 max-w-2xl mx-auto">
          {/* Verification Status */}
          <div className={`w-24 h-24 rounded-full flex items-center justify-center ${isValid ? 'bg-green-100' : 'bg-red-100'}`}>
            <Icon name={isValid ? "CheckCircle" : "XCircle"} size={56} className={isValid ? "text-green-600" : "text-red-600"} />
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">
              {isValid ? 'Valid Purchase Order' : 'Invalid Purchase Order'}
            </h1>
            <p className="text-muted-foreground">
              {isValid
                ? 'This purchase order has been verified and is authentic.'
                : 'This purchase order has been cancelled or rejected.'}
            </p>
          </div>

          {/* PO Details Card */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Purchase Order Details</span>
                <Badge className={statusColors[po.status]}>
                  {statusLabels[po.status]}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">PO Number</p>
                  <p className="font-semibold text-lg">{po.po_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-medium">{formatDate(po.order_date)}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground">Vendor</p>
                <p className="font-medium">{po.vendor_name}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-semibold text-xl">{formatCurrency(po.total_amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Currency</p>
                  <p className="font-medium">{po.currency}</p>
                </div>
              </div>

              {po.expected_delivery_date && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Expected Delivery</p>
                    <p className="font-medium">{formatDate(po.expected_delivery_date)}</p>
                  </div>
                </>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-sm">{formatDate(po.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="text-sm">{formatDate(po.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Info */}
          <Card className="w-full border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-blue-900">Verification Information</p>
                  <p className="text-sm text-blue-700">
                    This QR code verification confirms the authenticity of this purchase order.
                    For full details and document management, please access the system.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button asChild>
              <Link href={`/procurement/po-list/${po.id}`}>
                <Icon name="Eye" size={16} className="mr-2" />
                View Full Details
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/procurement/po-list">
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Back to PO List
              </Link>
            </Button>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
