"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { purchaseOrderApi, vendorApi, type POPriority, type VendorListItem } from "@/lib/api/procurement"

// Dynamically import PDF preview
const PDFPreview = dynamic(
  () => import('@/components/pdf/po-pdf-preview'),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full">Loading PDF Preview...</div> }
)

const priorityLabels: Record<POPriority, string> = {
  low: 'Rendah',
  normal: 'Normal',
  high: 'Tinggi',
  urgent: 'Urgent',
}

interface LineItem {
  line_number: number
  item_code: string
  item_name: string
  description: string
  unit: string
  quantity: string
  unit_price: string
  discount_percent: string
  total_price: string
}

export default function NewPOPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [vendors, setVendors] = useState<VendorListItem[]>([])
  const [items, setItems] = useState<LineItem[]>([])
  const [formData, setFormData] = useState({
    vendor: '',
    reference_number: '',
    priority: 'normal' as POPriority,
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    department: '',
    delivery_address: '',
    delivery_notes: '',
    currency: 'IDR',
    payment_terms: '30',
    discount_percent: '0',
    tax_percent: '0',
    terms_conditions: '',
    internal_notes: '',
  })

  useEffect(() => {
    fetchActiveVendors()
  }, [])

  const fetchActiveVendors = async () => {
    try {
      const data = await vendorApi.active()
      setVendors(data)
    } catch (error) {
      console.error("Error fetching vendors:", error)
      toast({
        title: "Error",
        description: "Failed to load vendors",
        variant: "destructive",
      })
    }
  }

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.total_price || '0'), 0)
    const discountAmount = (subtotal * parseFloat(formData.discount_percent)) / 100
    const afterDiscount = subtotal - discountAmount
    const taxAmount = (afterDiscount * parseFloat(formData.tax_percent)) / 100
    const totalAmount = afterDiscount + taxAmount

    return {
      subtotal: subtotal.toString(),
      discount_amount: discountAmount.toString(),
      tax_amount: taxAmount.toString(),
      total_amount: totalAmount.toString(),
    }
  }

  // Add new item
  const addItem = () => {
    const newItem: LineItem = {
      line_number: items.length + 1,
      item_code: '',
      item_name: '',
      description: '',
      unit: 'pcs',
      quantity: '1',
      unit_price: '0',
      discount_percent: '0',
      total_price: '0',
    }
    setItems([...items, newItem])
  }

  // Update item
  const updateItem = (index: number, field: keyof LineItem, value: string) => {
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }

    // Recalculate total price for this item
    if (field === 'quantity' || field === 'unit_price' || field === 'discount_percent') {
      const qty = parseFloat(updatedItems[index].quantity || '0')
      const price = parseFloat(updatedItems[index].unit_price || '0')
      const disc = parseFloat(updatedItems[index].discount_percent || '0')
      const subtotal = qty * price
      const total = subtotal - (subtotal * disc / 100)
      updatedItems[index].total_price = total.toString()
    }

    setItems(updatedItems)
  }

  // Remove item
  const removeItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index)
    // Renumber items
    updatedItems.forEach((item, i) => {
      item.line_number = i + 1
    })
    setItems(updatedItems)
  }

  const totals = calculateTotals()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.vendor) {
      toast({
        title: "Validation Error",
        description: "Please select a vendor",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const po = await purchaseOrderApi.create({
        ...formData,
        payment_terms: parseInt(formData.payment_terms),
        status: 'draft',
        subtotal: totals.subtotal,
        discount_amount: totals.discount_amount,
        tax_amount: totals.tax_amount,
        total_amount: totals.total_amount,
        payment_status: 'unpaid',
        paid_amount: '0',
      })

      toast({
        title: "Success",
        description: "Purchase order created successfully",
      })

      router.push(`/procurement/po-list/${po.id}`)
    } catch (error: any) {
      console.error("Error creating PO:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create purchase order",
        variant: "destructive",
      })
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
                  <BreadcrumbLink href="/procurement">Procurement</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/procurement/po-list">PO List</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>New Purchase Order</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 max-w-full">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Create Purchase Order</h1>
              <p className="text-muted-foreground">Create a new purchase order</p>
            </div>
          </div>

          {/* Side by Side Layout */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Panel - Form (5/12) */}
            <div className="col-span-5">
              <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="vendor">Vendor *</Label>
                  <Select value={formData.vendor} onValueChange={(value) => setFormData({ ...formData, vendor: value })}>
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
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value: POPriority) => setFormData({ ...formData, priority: value })}>
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
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="expected_delivery_date">Expected Delivery Date</Label>
                    <Input
                      id="expected_delivery_date"
                      type="date"
                      value={formData.expected_delivery_date}
                      onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
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
                    <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
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
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="discount_percent">Discount (%)</Label>
                    <Input
                      id="discount_percent"
                      type="number"
                      value={formData.discount_percent}
                      onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="tax_percent">Tax (%)</Label>
                    <Input
                      id="tax_percent"
                      type="number"
                      value={formData.tax_percent}
                      onChange={(e) => setFormData({ ...formData, tax_percent: e.target.value })}
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Line Items</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Icon name="Plus" size={16} className="mr-2" />
                  Add Item
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No items added yet. Click "Add Item" to add line items.
                    </p>
                  ) : (
                    items.map((item, index) => (
                      <Card key={index} className="relative">
                        <CardContent className="pt-6">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            onClick={() => removeItem(index)}
                          >
                            <Icon name="X" size={14} />
                          </Button>

                          <div className="grid gap-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="grid gap-1.5">
                                <Label className="text-xs">Item Code</Label>
                                <Input
                                  value={item.item_code}
                                  onChange={(e) => updateItem(index, 'item_code', e.target.value)}
                                  placeholder="SKU/Code"
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div className="grid gap-1.5">
                                <Label className="text-xs">Unit</Label>
                                <Input
                                  value={item.unit}
                                  onChange={(e) => updateItem(index, 'unit', e.target.value)}
                                  placeholder="pcs, kg, etc"
                                  className="h-8 text-sm"
                                />
                              </div>
                            </div>

                            <div className="grid gap-1.5">
                              <Label className="text-xs">Item Name *</Label>
                              <Input
                                value={item.item_name}
                                onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                                placeholder="Item name"
                                className="h-8 text-sm"
                                required
                              />
                            </div>

                            <div className="grid gap-1.5">
                              <Label className="text-xs">Description</Label>
                              <Textarea
                                value={item.description}
                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                placeholder="Item description"
                                rows={2}
                                className="text-sm"
                              />
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                              <div className="grid gap-1.5">
                                <Label className="text-xs">Quantity</Label>
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                  placeholder="0"
                                  min="0"
                                  step="0.01"
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div className="grid gap-1.5">
                                <Label className="text-xs">Unit Price</Label>
                                <Input
                                  type="number"
                                  value={item.unit_price}
                                  onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                                  placeholder="0"
                                  min="0"
                                  step="0.01"
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div className="grid gap-1.5">
                                <Label className="text-xs">Disc %</Label>
                                <Input
                                  type="number"
                                  value={item.discount_percent}
                                  onChange={(e) => updateItem(index, 'discount_percent', e.target.value)}
                                  placeholder="0"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div className="grid gap-1.5">
                                <Label className="text-xs">Total</Label>
                                <Input
                                  value={parseFloat(item.total_price || '0').toLocaleString('id-ID')}
                                  disabled
                                  className="h-8 text-sm bg-muted"
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}

                  {items.length > 0 && (
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span className="font-medium">Rp {parseFloat(totals.subtotal).toLocaleString('id-ID')}</span>
                      </div>
                      {parseFloat(formData.discount_percent) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Discount ({formData.discount_percent}%):</span>
                          <span className="text-red-600">- Rp {parseFloat(totals.discount_amount).toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      {parseFloat(formData.tax_percent) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Tax ({formData.tax_percent}%):</span>
                          <span>Rp {parseFloat(totals.tax_amount).toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-base font-bold border-t pt-2">
                        <span>Total Amount:</span>
                        <span>Rp {parseFloat(totals.total_amount).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  )}
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
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" asChild>
                <Link href="/procurement/po-list">
                  <Icon name="X" size={16} className="mr-2" />
                  Cancel
                </Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Icon name="Save" size={16} className="mr-2" />
                    Create Purchase Order
                  </>
                )}
              </Button>
            </div>
              </form>

              <div className="text-sm text-muted-foreground border-t pt-4 mt-6">
                <p>Note: After creating the purchase order, you can add line items and submit it for approval.</p>
              </div>
            </div>

            {/* Right Panel - PDF Preview (7/12) */}
            <div className="col-span-7">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>PDF Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[calc(100vh-200px)] border rounded overflow-hidden">
                    <PDFPreview
                      po={{
                        id: 'draft',
                        po_number: 'DRAFT',
                        reference_number: formData.reference_number,
                        vendor: formData.vendor,
                        vendor_name: vendors.find(v => v.id === formData.vendor)?.name || 'Select a vendor',
                        status: 'draft',
                        priority: formData.priority,
                        order_date: formData.order_date,
                        expected_delivery_date: formData.expected_delivery_date,
                        actual_delivery_date: undefined,
                        requested_by: undefined,
                        requested_by_name: undefined,
                        department: formData.department,
                        delivery_address: formData.delivery_address,
                        delivery_notes: formData.delivery_notes,
                        currency: formData.currency,
                        subtotal: totals.subtotal,
                        discount_percent: formData.discount_percent,
                        discount_amount: totals.discount_amount,
                        tax_percent: formData.tax_percent,
                        tax_amount: totals.tax_amount,
                        total_amount: totals.total_amount,
                        payment_terms: parseInt(formData.payment_terms) || 30,
                        payment_status: 'unpaid',
                        paid_amount: '0',
                        approved_by: undefined,
                        approved_by_name: undefined,
                        approved_at: undefined,
                        rejection_reason: '',
                        terms_conditions: formData.terms_conditions,
                        internal_notes: formData.internal_notes,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                      }}
                      items={items.map(item => ({
                        id: `draft-${item.line_number}`,
                        purchase_order: 'draft',
                        line_number: item.line_number,
                        item_code: item.item_code,
                        item_name: item.item_name,
                        description: item.description,
                        unit: item.unit,
                        quantity: item.quantity,
                        received_quantity: '0',
                        unit_price: item.unit_price,
                        discount_percent: item.discount_percent,
                        total_price: item.total_price,
                        notes: '',
                      }))}
                      mode="viewer"
                    />
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
