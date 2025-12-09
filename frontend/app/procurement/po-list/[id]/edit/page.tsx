"use client"

import { useState, useEffect } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Icon } from "@/components/ui/icon"
import { useToast } from "@/hooks/use-toast"
import {
  purchaseOrderApi,
  vendorApi,
  type PurchaseOrder,
  type POPriority,
  type POStatus,
  type VendorListItem
} from "@/lib/api/procurement"

const priorityLabels: Record<POPriority, string> = {
  low: 'Rendah',
  normal: 'Normal',
  high: 'Tinggi',
  urgent: 'Urgent',
}

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

// Statuses that prevent editing
const LOCKED_STATUSES: POStatus[] = ['received', 'closed', 'cancelled']

export default function EditPOPage() {
  const params = useParams()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [po, setPo] = useState<PurchaseOrder | null>(null)
  const [vendors, setVendors] = useState<VendorListItem[]>([])
  const [formData, setFormData] = useState({
    vendor: '',
    reference_number: '',
    priority: 'normal' as POPriority,
    order_date: '',
    expected_delivery_date: '',
    department: '',
    delivery_address: '',
    delivery_notes: '',
    currency: 'IDR',
    payment_terms: '30',
    terms_conditions: '',
    internal_notes: '',
  })

  useEffect(() => {
    if (params.id) {
      fetchPO()
      fetchActiveVendors()
    }
  }, [params.id])

  const fetchPO = async () => {
    try {
      setLoading(true)
      const data = await purchaseOrderApi.get(params.id as string)
      setPo(data)

      // Populate form
      setFormData({
        vendor: data.vendor,
        reference_number: data.reference_number || '',
        priority: data.priority,
        order_date: data.order_date.split('T')[0],
        expected_delivery_date: data.expected_delivery_date?.split('T')[0] || '',
        department: data.department || '',
        delivery_address: data.delivery_address || '',
        delivery_notes: data.delivery_notes || '',
        currency: data.currency,
        payment_terms: data.payment_terms.toString(),
        terms_conditions: data.terms_conditions || '',
        internal_notes: data.internal_notes || '',
      })
    } catch (error) {
      console.error("Error fetching PO:", error)
      toast({
        title: "Error",
        description: "Failed to load purchase order",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchActiveVendors = async () => {
    try {
      const data = await vendorApi.active()
      setVendors(data)
    } catch (error) {
      console.error("Error fetching vendors:", error)
    }
  }

  const isLocked = po ? LOCKED_STATUSES.includes(po.status) : false

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isLocked) {
      toast({
        title: "Cannot Edit",
        description: `Purchase orders with status "${statusLabels[po!.status]}" cannot be edited`,
        variant: "destructive",
      })
      return
    }

    if (!formData.vendor) {
      toast({
        title: "Validation Error",
        description: "Please select a vendor",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      await purchaseOrderApi.update(params.id as string, {
        ...formData,
        payment_terms: parseInt(formData.payment_terms),
      })

      toast({
        title: "Success",
        description: "Purchase order updated successfully",
      })

      router.push(`/procurement/po-list/${params.id}`)
    } catch (error: any) {
      console.error("Error updating PO:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update purchase order",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
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
                  <BreadcrumbLink href={`/procurement/po-list/${po.id}`}>{po.po_number}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Edit</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 max-w-4xl mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold tracking-tight">Edit Purchase Order</h1>
                <Badge className={isLocked ? 'bg-red-500' : 'bg-blue-500'}>
                  {statusLabels[po.status]}
                </Badge>
              </div>
              <p className="text-muted-foreground">{po.po_number}</p>
            </div>
          </div>

          {isLocked && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Icon name="Lock" size={20} className="text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900">Editing Locked</p>
                    <p className="text-sm text-amber-700 mt-1">
                      This purchase order cannot be edited because it has status "{statusLabels[po.status]}".
                      Only purchase orders in draft, pending approval, approved, rejected, sent, or partial status can be edited.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="vendor">Vendor *</Label>
                  <Select
                    value={formData.vendor}
                    onValueChange={(value) => setFormData({ ...formData, vendor: value })}
                    disabled={isLocked}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name} ({vendor.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="reference_number">Reference Number</Label>
                  <Input
                    id="reference_number"
                    value={formData.reference_number}
                    onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                    placeholder="Optional reference number"
                    disabled={isLocked}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: POPriority) => setFormData({ ...formData, priority: value })}
                      disabled={isLocked}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(priorityLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="Requesting department"
                      disabled={isLocked}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="order_date">Order Date *</Label>
                    <Input
                      id="order_date"
                      type="date"
                      value={formData.order_date}
                      onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                      required
                      disabled={isLocked}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="expected_delivery_date">Expected Delivery Date</Label>
                    <Input
                      id="expected_delivery_date"
                      type="date"
                      value={formData.expected_delivery_date}
                      onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
                      disabled={isLocked}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="delivery_address">Delivery Address</Label>
                  <Textarea
                    id="delivery_address"
                    value={formData.delivery_address}
                    onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                    placeholder="Enter delivery address"
                    rows={3}
                    disabled={isLocked}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="delivery_notes">Delivery Notes</Label>
                  <Textarea
                    id="delivery_notes"
                    value={formData.delivery_notes}
                    onChange={(e) => setFormData({ ...formData, delivery_notes: e.target.value })}
                    placeholder="Special delivery instructions"
                    rows={2}
                    disabled={isLocked}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Terms */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Terms</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData({ ...formData, currency: value })}
                      disabled={isLocked}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IDR">IDR (Rupiah)</SelectItem>
                        <SelectItem value="USD">USD (US Dollar)</SelectItem>
                        <SelectItem value="EUR">EUR (Euro)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="payment_terms">Payment Terms (days)</Label>
                    <Input
                      id="payment_terms"
                      type="number"
                      value={formData.payment_terms}
                      onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                      placeholder="30"
                      min="0"
                      disabled={isLocked}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Terms & Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Terms & Notes</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="terms_conditions">Terms & Conditions</Label>
                  <Textarea
                    id="terms_conditions"
                    value={formData.terms_conditions}
                    onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                    placeholder="Enter terms and conditions"
                    rows={4}
                    disabled={isLocked}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="internal_notes">Internal Notes</Label>
                  <Textarea
                    id="internal_notes"
                    value={formData.internal_notes}
                    onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
                    placeholder="Internal notes (not visible to vendor)"
                    rows={3}
                    disabled={isLocked}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" asChild>
                <Link href={`/procurement/po-list/${po.id}`}>
                  <Icon name="X" size={16} className="mr-2" />
                  Cancel
                </Link>
              </Button>
              <Button type="submit" disabled={isLocked || saving}>
                {saving ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Icon name="Save" size={16} className="mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
