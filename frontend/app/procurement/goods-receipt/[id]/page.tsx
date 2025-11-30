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
import { Badge } from "@/components/ui/badge"
import { poReceiptApi, type POReceipt, type POReceiptItem, purchaseOrderApi, type PurchaseOrder } from "@/lib/api/procurement"
import { Icon } from "@/components/ui/icon"

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const getQuantityBadge = (received: number, ordered: number) => {
  if (received === ordered) {
    return <Badge variant="outline" className="bg-green-100 text-green-800">Complete</Badge>
  } else if (received < ordered) {
    return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Partial</Badge>
  } else {
    return <Badge variant="outline" className="bg-red-100 text-red-800">Over</Badge>
  }
}

export default function GoodsReceiptDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [receipt, setReceipt] = useState<POReceipt | null>(null)
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchReceipt()
    }
  }, [params.id])

  const fetchReceipt = async () => {
    try {
      setLoading(true)
      const receiptData = await poReceiptApi.get(params.id as string)
      setReceipt(receiptData)

      // Fetch related PO
      if (receiptData.purchase_order) {
        const poData = await purchaseOrderApi.get(receiptData.purchase_order)
        setPurchaseOrder(poData)
      }
    } catch (error) {
      console.error("Error fetching receipt:", error)
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
            <p className="text-muted-foreground">Loading goods receipt details...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!receipt) {
    return (
      <SidebarProvider style={{ "--sidebar-width": "350px" } as React.CSSProperties}>
        <AppSidebar />
        <SidebarInset>
          <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <div className="text-muted-foreground">Receipt not found</div>
            <div className="ml-auto">
              <TopNavbar />
            </div>
          </header>
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
            <p className="text-muted-foreground">Goods receipt not found</p>
            <Button asChild>
              <Link href="/procurement/goods-receipt">
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Back to Goods Receipt
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
                  <BreadcrumbLink href="/procurement/goods-receipt">Goods Receipt</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Details</BreadcrumbPage>
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
              <h1 className="text-3xl font-bold mb-2">{receipt.receipt_number}</h1>
              <p className="text-muted-foreground">
                Received on {formatDate(receipt.receipt_date)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/procurement/goods-receipt/${receipt.id}/edit`}>
                  <Icon name="Edit" size={16} className="mr-2" />
                  Edit
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/procurement/goods-receipt">
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
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                <Icon name="Package" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{receipt.items.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receipt Date</CardTitle>
                <Icon name="Calendar" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">{formatDate(receipt.receipt_date)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Delivery Date</CardTitle>
                <Icon name="Truck" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">
                  {receipt.delivery_date ? formatDate(receipt.delivery_date) : '-'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Received By</CardTitle>
                <Icon name="User" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">{receipt.received_by_name || '-'}</div>
              </CardContent>
            </Card>
          </div>

          {/* Receipt Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="FileText" size={20} />
                Receipt Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Receipt Number</label>
                  <p className="mt-1 font-medium">{receipt.receipt_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Related PO</label>
                  <p className="mt-1">
                    {purchaseOrder ? (
                      <Link
                        href={`/procurement/po-list/${purchaseOrder.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {purchaseOrder.po_number}
                      </Link>
                    ) : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Receipt Date</label>
                  <p className="mt-1">{formatDate(receipt.receipt_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Delivery Date</label>
                  <p className="mt-1">{receipt.delivery_date ? formatDate(receipt.delivery_date) : '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Delivery Note Number</label>
                  <p className="mt-1">{receipt.delivery_note_number || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Received By</label>
                  <p className="mt-1">{receipt.received_by_name || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PO Information */}
          {purchaseOrder && (
            <Card>
              <CardHeader>
                <CardTitle>Related Purchase Order</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">PO Number</label>
                    <p className="mt-1">
                      <Link
                        href={`/procurement/po-list/${purchaseOrder.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {purchaseOrder.po_number}
                      </Link>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Vendor</label>
                    <p className="mt-1">{purchaseOrder.vendor_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Order Date</label>
                    <p className="mt-1">{formatDate(purchaseOrder.order_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Expected Delivery</label>
                    <p className="mt-1">{formatDate(purchaseOrder.expected_delivery)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
                    <p className="mt-1 font-semibold">{formatCurrency(parseFloat(purchaseOrder.total_amount))}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <p className="mt-1">
                      <Badge variant="outline">{purchaseOrder.status}</Badge>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Receipt Items */}
          <Card>
            <CardHeader>
              <CardTitle>Received Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">No</TableHead>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Ordered Qty</TableHead>
                    <TableHead className="text-right">Received Qty</TableHead>
                    <TableHead className="text-center">Unit</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipt.items.map((item, index) => {
                    const total = item.quantity_received * parseFloat(item.po_item_data?.unit_price || '0')
                    return (
                      <TableRow key={item.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">
                          {item.po_item_data?.item_name || '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.po_item_data?.description || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.po_item_data?.quantity || 0}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {item.quantity_received}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.po_item_data?.unit || '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          {getQuantityBadge(
                            item.quantity_received,
                            item.po_item_data?.quantity || 0
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(parseFloat(item.po_item_data?.unit_price || '0'))}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(total)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={8} className="text-right font-semibold">
                      Total Value
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(
                        receipt.items.reduce((sum, item) => {
                          return sum + (item.quantity_received * parseFloat(item.po_item_data?.unit_price || '0'))
                        }, 0)
                      )}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>

          {/* Notes */}
          {receipt.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{receipt.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
