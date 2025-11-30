"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import dynamic from "next/dynamic"

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"
import { purchaseOrderApi, poItemApi, type PurchaseOrder, type POItem, type POStatus, type POPriority, type PaymentStatus } from "@/lib/api/procurement"
import { Icon } from "@/components/ui/icon"

// Create a wrapper component for PDF functionality
const PDFPreview = dynamic(
  () => import('@/components/pdf/po-pdf-preview'),
  { ssr: false, loading: () => <div className="flex items-center justify-center p-6">Loading PDF...</div> }
)

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

const priorityLabels: Record<POPriority, string> = {
  low: 'Rendah',
  normal: 'Normal',
  high: 'Tinggi',
  urgent: 'Urgent',
}

const paymentStatusLabels: Record<PaymentStatus, string> = {
  unpaid: 'Belum Dibayar',
  partial: 'Dibayar Sebagian',
  paid: 'Lunas',
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

export default function PODetailPage() {
  const params = useParams()
  const router = useRouter()
  const [po, setPo] = useState<PurchaseOrder | null>(null)
  const [items, setItems] = useState<POItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchPO()
      fetchItems()
    }
  }, [params.id])

  const fetchPO = async () => {
    try {
      setLoading(true)
      const data = await purchaseOrderApi.get(params.id as string)
      setPo(data)
    } catch (error) {
      console.error("Error fetching PO:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchItems = async () => {
    try {
      const response = await poItemApi.list({ purchase_order: params.id })
      setItems(response.results)
    } catch (error) {
      console.error("Error fetching items:", error)
    }
  }

  const getStatusBadge = (status: POStatus) => {
    const config: Record<POStatus, string> = {
      draft: "bg-gray-500",
      pending_approval: "bg-yellow-500",
      approved: "bg-green-500",
      rejected: "bg-red-500",
      sent: "bg-blue-500",
      partial: "bg-orange-500",
      received: "bg-green-600",
      cancelled: "bg-gray-400",
      closed: "bg-gray-700",
    }

    return (
      <Badge className={config[status]}>
        {statusLabels[status]}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: POPriority) => {
    const config: Record<POPriority, string> = {
      low: "bg-gray-500",
      normal: "bg-blue-500",
      high: "bg-orange-500",
      urgent: "bg-red-500",
    }

    return (
      <Badge className={config[priority]}>
        {priorityLabels[priority]}
      </Badge>
    )
  }

  const getPaymentBadge = (status: PaymentStatus) => {
    const config: Record<PaymentStatus, string> = {
      unpaid: "bg-red-500",
      partial: "bg-yellow-500",
      paid: "bg-green-500",
    }

    return (
      <Badge className={config[status]}>
        {paymentStatusLabels[status]}
      </Badge>
    )
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
            <p className="text-muted-foreground">Loading purchase order...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!po) {
    return (
      <SidebarProvider style={{ "--sidebar-width": "350px" } as React.CSSProperties}>
        <AppSidebar />
        <SidebarInset>
          <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <div className="text-muted-foreground">PO not found</div>
            <div className="ml-auto">
              <TopNavbar />
            </div>
          </header>
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
            <p className="text-muted-foreground">Purchase order not found</p>
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
                  <BreadcrumbPage>{po.po_number}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 max-w-full">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{po.po_number}</h1>
                {getStatusBadge(po.status)}
                {getPriorityBadge(po.priority)}
              </div>
              <p className="text-muted-foreground">Vendor: {po.vendor_name}</p>
            </div>
            <div className="flex gap-2">
              <PDFPreview po={po} items={items} mode="download" />
              <Button variant="outline" asChild>
                <Link href={`/procurement/po-list/${po.id}/edit`}>
                  <Icon name="Edit" size={16} className="mr-2" />
                  Edit
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/procurement/po-list">
                  <Icon name="ArrowLeft" size={16} className="mr-2" />
                  Back
                </Link>
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                <Icon name="DollarSign" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(po.total_amount)}</div>
                <p className="text-xs text-muted-foreground">{po.currency}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                <Icon name="Package" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{items.length}</div>
                <p className="text-xs text-muted-foreground">Line items</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
                <Icon name="DollarSign" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {getPaymentBadge(po.payment_status)}
                <p className="text-xs text-muted-foreground mt-2">
                  {formatCurrency(po.paid_amount)} paid
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Payment Terms</CardTitle>
                <Icon name="Calendar" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{po.payment_terms}</div>
                <p className="text-xs text-muted-foreground">days</p>
              </CardContent>
            </Card>
          </div>

          {/* Side by Side Layout */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left Panel - Form Details */}
            <div className="flex flex-col gap-6">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                  <TabsTrigger value="items" className="flex-1">Items ({items.length})</TabsTrigger>
                  <TabsTrigger value="financial" className="flex-1">Financial</TabsTrigger>
                </TabsList>

            <TabsContent value="details" className="space-y-6 mt-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Purchase Order Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">PO Number</label>
                      <p className="mt-1 font-medium">{po.po_number}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Reference Number</label>
                      <p className="mt-1">{po.reference_number || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Order Date</label>
                      <p className="mt-1">{formatDate(po.order_date)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Expected Delivery</label>
                      <p className="mt-1">{formatDate(po.expected_delivery_date)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Department</label>
                      <p className="mt-1">{po.department || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Requested By</label>
                      <p className="mt-1">{po.requested_by_name || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vendor Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Building" size={20} />
                    Vendor Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Vendor Name</label>
                    <p className="mt-1 text-lg font-medium">{po.vendor_name}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Delivery Address</label>
                    <p className="mt-1 whitespace-pre-wrap">{po.delivery_address || '-'}</p>
                  </div>
                  {po.delivery_notes && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Delivery Notes</label>
                      <p className="mt-1 whitespace-pre-wrap">{po.delivery_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Approval Information */}
              {po.approved_by_name && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="User" size={20} />
                      Approval Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Approved By</label>
                        <p className="mt-1">{po.approved_by_name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Approved At</label>
                        <p className="mt-1">{formatDate(po.approved_at || '')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Rejection Reason */}
              {po.status === 'rejected' && po.rejection_reason && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-red-700">Rejection Reason</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-red-700">{po.rejection_reason}</p>
                  </CardContent>
                </Card>
              )}

              {/* Terms & Conditions */}
              {po.terms_conditions && (
                <Card>
                  <CardHeader>
                    <CardTitle>Terms & Conditions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{po.terms_conditions}</p>
                  </CardContent>
                </Card>
              )}

              {/* Internal Notes */}
              {po.internal_notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Internal Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{po.internal_notes}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="items" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Line Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]">#</TableHead>
                        <TableHead className="w-[120px]">Item Code</TableHead>
                        <TableHead className="w-[250px]">Item Name</TableHead>
                        <TableHead className="w-[80px]">Unit</TableHead>
                        <TableHead className="w-[100px] text-right">Qty</TableHead>
                        <TableHead className="w-[120px] text-right">Unit Price</TableHead>
                        <TableHead className="w-[80px] text-right">Disc %</TableHead>
                        <TableHead className="w-[150px] text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.line_number}</TableCell>
                          <TableCell>{item.item_code || '-'}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.item_name}</p>
                              {item.description && (
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                          <TableCell className="text-right">{item.discount_percent}%</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(item.total_price)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={7} className="text-right font-medium">Subtotal</TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(po.subtotal)}</TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financial" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="font-medium">Subtotal</span>
                      <span className="font-bold text-lg">{formatCurrency(po.subtotal)}</span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b">
                      <span>Discount ({po.discount_percent}%)</span>
                      <span className="text-red-600">- {formatCurrency(po.discount_amount)}</span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b">
                      <span>Tax ({po.tax_percent}%)</span>
                      <span>{formatCurrency(po.tax_amount)}</span>
                    </div>

                    <div className="flex items-center justify-between py-3 border-t-2">
                      <span className="text-xl font-bold">Total Amount</span>
                      <span className="text-2xl font-bold">{formatCurrency(po.total_amount)}</span>
                    </div>

                    <Separator className="my-4" />

                    <div>
                      <h3 className="font-semibold mb-3">Payment Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Payment Status</span>
                          {getPaymentBadge(po.payment_status)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Paid Amount</span>
                          <span className="font-medium">{formatCurrency(po.paid_amount)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Outstanding</span>
                          <span className="font-medium text-red-600">
                            {formatCurrency((parseFloat(po.total_amount) - parseFloat(po.paid_amount)).toString())}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Payment Terms</span>
                          <span>{po.payment_terms} days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
              </Tabs>
            </div>

            {/* Right Panel - PDF Preview */}
            <div className="flex flex-col gap-6">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>PDF Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[calc(100vh-200px)] border rounded overflow-hidden">
                    <PDFPreview po={po} items={items} mode="viewer" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
