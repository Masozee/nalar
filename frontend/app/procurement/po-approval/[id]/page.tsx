"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
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
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { purchaseOrderApi, poItemApi, type PurchaseOrder, type POItem, type POPriority } from "@/lib/api/procurement"
import { Icon } from "@/components/ui/icon"

const priorityLabels: Record<POPriority, string> = {
  low: 'Rendah',
  normal: 'Normal',
  high: 'Tinggi',
  urgent: 'Urgent',
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

export default function POApprovalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [po, setPo] = useState<PurchaseOrder | null>(null)
  const [items, setItems] = useState<POItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [processing, setProcessing] = useState(false)

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

  const handleApprove = async () => {
    try {
      setProcessing(true)
      await purchaseOrderApi.approve(params.id as string, { action: 'approve' })
      setShowApproveDialog(false)
      router.push('/procurement/po-approval')
    } catch (error) {
      console.error("Error approving PO:", error)
      alert("Failed to approve PO")
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason")
      return
    }

    try {
      setProcessing(true)
      await purchaseOrderApi.approve(params.id as string, {
        action: 'reject',
        reason: rejectionReason
      })
      setShowRejectDialog(false)
      router.push('/procurement/po-approval')
    } catch (error) {
      console.error("Error rejecting PO:", error)
      alert("Failed to reject PO")
    } finally {
      setProcessing(false)
    }
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

  if (!po || po.status !== 'pending_approval') {
    return (
      <SidebarProvider style={{ "--sidebar-width": "350px" } as React.CSSProperties}>
        <AppSidebar />
        <SidebarInset>
          <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <div className="text-muted-foreground">PO not found or not pending approval</div>
            <div className="ml-auto">
              <TopNavbar />
            </div>
          </header>
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
            <p className="text-muted-foreground">Purchase order not found or not pending approval</p>
            <Button asChild>
              <Link href="/procurement/po-approval">
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Back to Approval Queue
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
                  <BreadcrumbLink href="/procurement/po-approval">PO Approval</BreadcrumbLink>
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
          {/* Header with Actions */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{po.po_number}</h1>
                <Badge className="bg-yellow-500">Pending Approval</Badge>
                {getPriorityBadge(po.priority)}
              </div>
              <p className="text-muted-foreground">Vendor: {po.vendor_name}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => setShowRejectDialog(true)}
              >
                <Icon name="XCircle" size={16} className="mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => setShowApproveDialog(true)}
              >
                <Icon name="CheckCircle" size={16} className="mr-2" />
                Approve
              </Button>
              <Button variant="outline" asChild>
                <Link href="/procurement/po-approval">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                <Icon name="Package" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{items.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Order Date</CardTitle>
                <Icon name="Calendar" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm">{formatDate(po.order_date)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expected Delivery</CardTitle>
                <Icon name="Calendar" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm">{formatDate(po.expected_delivery_date)}</div>
              </CardContent>
            </Card>
          </div>

          {/* PO Information */}
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

          {/* Line Items */}
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
                  {parseFloat(po.discount_amount) > 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-right">Discount ({po.discount_percent}%)</TableCell>
                      <TableCell className="text-right text-red-600">- {formatCurrency(po.discount_amount)}</TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell colSpan={7} className="text-right">Tax ({po.tax_percent}%)</TableCell>
                    <TableCell className="text-right">{formatCurrency(po.tax_amount)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={7} className="text-right font-bold text-lg">Total Amount</TableCell>
                    <TableCell className="text-right font-bold text-lg">{formatCurrency(po.total_amount)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          {po.delivery_address && (
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Delivery Address</label>
                  <p className="mt-1 whitespace-pre-wrap">{po.delivery_address}</p>
                </div>
                {po.delivery_notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Delivery Notes</label>
                    <p className="mt-1 whitespace-pre-wrap">{po.delivery_notes}</p>
                  </div>
                )}
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
        </div>
      </SidebarInset>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Purchase Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve PO {po.po_number} for {formatCurrency(po.total_amount)}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={processing}>
              {processing ? 'Processing...' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Purchase Order</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting PO {po.po_number}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing}>
              {processing ? 'Processing...' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
