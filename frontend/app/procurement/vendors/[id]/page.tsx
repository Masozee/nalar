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
} from "@/components/ui/table"
import { vendorApi, type Vendor, type VendorStatus, type VendorCategory, type VendorEvaluation, type POListItem } from "@/lib/api/procurement"
import { Icon } from "@/components/ui/icon"

const statusLabels: Record<VendorStatus, string> = {
  active: 'Aktif',
  inactive: 'Tidak Aktif',
  blacklisted: 'Blacklist',
  pending: 'Menunggu Verifikasi',
}

const categoryLabels: Record<VendorCategory, string> = {
  goods: 'Barang',
  services: 'Jasa',
  both: 'Barang & Jasa',
}

const formatCurrency = (amount: string) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(parseFloat(amount))
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function VendorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [evaluations, setEvaluations] = useState<VendorEvaluation[]>([])
  const [purchaseOrders, setPurchaseOrders] = useState<POListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchVendor()
      fetchEvaluations()
      fetchPurchaseOrders()
    }
  }, [params.id])

  const fetchVendor = async () => {
    try {
      setLoading(true)
      const data = await vendorApi.get(params.id as string)
      setVendor(data)
    } catch (error) {
      console.error("Error fetching vendor:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEvaluations = async () => {
    try {
      const data = await vendorApi.evaluations(params.id as string)
      setEvaluations(data)
    } catch (error) {
      console.error("Error fetching evaluations:", error)
    }
  }

  const fetchPurchaseOrders = async () => {
    try {
      const data = await vendorApi.purchaseOrders(params.id as string)
      setPurchaseOrders(data)
    } catch (error) {
      console.error("Error fetching purchase orders:", error)
    }
  }

  const getStatusBadge = (status: VendorStatus) => {
    const config: Record<VendorStatus, string> = {
      active: "bg-green-500",
      inactive: "bg-gray-500",
      blacklisted: "bg-red-500",
      pending: "bg-yellow-500",
    }

    return (
      <Badge className={config[status]}>
        {statusLabels[status]}
      </Badge>
    )
  }

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
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
            <p className="text-muted-foreground">Loading vendor details...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!vendor) {
    return (
      <SidebarProvider style={{ "--sidebar-width": "350px" } as React.CSSProperties}>
        <AppSidebar />
        <SidebarInset>
          <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <div className="text-muted-foreground">Vendor not found</div>
            <div className="ml-auto">
              <TopNavbar />
            </div>
          </header>
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
            <p className="text-muted-foreground">Vendor not found</p>
            <Button asChild>
              <Link href="/procurement/vendors">
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Back to Vendors
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
                  <BreadcrumbLink href="/procurement/vendors">Vendors</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{vendor.code}</BreadcrumbPage>
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
                <h1 className="text-3xl font-bold">{vendor.name}</h1>
                {getStatusBadge(vendor.status)}
              </div>
              <p className="text-muted-foreground">Vendor Code: {vendor.code}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/procurement/vendors/${vendor.id}/edit`}>
                  <Icon name="Edit" size={16} className="mr-2" />
                  Edit
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/procurement/vendors">
                  <Icon name="ArrowLeft" size={16} className="mr-2" />
                  Back
                </Link>
              </Button>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rating</CardTitle>
                <Icon name="Star" size={16} className="text-yellow-400" />
              </CardHeader>
              <CardContent>
                {renderRating(vendor.rating)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Category</CardTitle>
                <Icon name="Building" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{categoryLabels[vendor.category]}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Payment Terms</CardTitle>
                <Icon name="Calendar" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{vendor.payment_terms} days</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Credit Limit</CardTitle>
                <Icon name="CreditCard" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{formatCurrency(vendor.credit_limit)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="info" className="w-full">
            <TabsList>
              <TabsTrigger value="info">Information</TabsTrigger>
              <TabsTrigger value="evaluations">Evaluations ({evaluations.length})</TabsTrigger>
              <TabsTrigger value="orders">Purchase Orders ({purchaseOrders.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-6 mt-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Address</label>
                      <div className="flex items-start gap-2 mt-1">
                        <Icon name="MapPin" size={16} className="mt-0.5 text-muted-foreground" />
                        <div>
                          <p>{vendor.address}</p>
                          <p>{vendor.city}, {vendor.province} {vendor.postal_code}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                        <div className="flex items-center gap-2 mt-1">
                          <Icon name="Phone" size={16} className="text-muted-foreground" />
                          <p>{vendor.phone}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <div className="flex items-center gap-2 mt-1">
                          <Icon name="Mail" size={16} className="text-muted-foreground" />
                          <p>{vendor.email}</p>
                        </div>
                      </div>
                      {vendor.website && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Website</label>
                          <p className="mt-1">
                            <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {vendor.website}
                            </a>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Person */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Person</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <p className="mt-1">{vendor.contact_person}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="mt-1">{vendor.contact_phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="mt-1">{vendor.contact_email || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Legal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Legal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Vendor Type</label>
                      <p className="mt-1">{vendor.vendor_type.toUpperCase()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">NPWP</label>
                      <p className="mt-1">{vendor.npwp || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">NIB</label>
                      <p className="mt-1">{vendor.nib || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">SIUP Number</label>
                      <p className="mt-1">{vendor.siup_number || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Banking Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Banking Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Bank Name</label>
                      <p className="mt-1">{vendor.bank_name || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Branch</label>
                      <p className="mt-1">{vendor.bank_branch || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Account Number</label>
                      <p className="mt-1">{vendor.bank_account_number || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Account Name</label>
                      <p className="mt-1">{vendor.bank_account_name || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {vendor.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{vendor.notes}</p>
                  </CardContent>
                </Card>
              )}

              {vendor.status === 'blacklisted' && vendor.blacklist_reason && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-red-700">Blacklist Reason</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-red-700">{vendor.blacklist_reason}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="evaluations" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Evaluations</CardTitle>
                </CardHeader>
                <CardContent>
                  {evaluations.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No evaluations yet</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Period</TableHead>
                          <TableHead className="text-center">Quality</TableHead>
                          <TableHead className="text-center">Delivery</TableHead>
                          <TableHead className="text-center">Price</TableHead>
                          <TableHead className="text-center">Service</TableHead>
                          <TableHead className="text-center">Overall</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {evaluations.map((evaluation) => (
                          <TableRow key={evaluation.id}>
                            <TableCell>{formatDate(evaluation.evaluation_date)}</TableCell>
                            <TableCell>
                              {formatDate(evaluation.period_start)} - {formatDate(evaluation.period_end)}
                            </TableCell>
                            <TableCell className="text-center">{evaluation.quality_score}</TableCell>
                            <TableCell className="text-center">{evaluation.delivery_score}</TableCell>
                            <TableCell className="text-center">{evaluation.price_score}</TableCell>
                            <TableCell className="text-center">{evaluation.service_score}</TableCell>
                            <TableCell className="text-center font-bold">{evaluation.overall_score}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Purchase Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {purchaseOrders.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No purchase orders yet</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>PO Number</TableHead>
                          <TableHead>Order Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Total Amount</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {purchaseOrders.map((po) => (
                          <TableRow key={po.id}>
                            <TableCell>
                              <Link href={`/procurement/po-list/${po.id}`} className="font-medium hover:underline">
                                {po.po_number}
                              </Link>
                            </TableCell>
                            <TableCell>{formatDate(po.order_date)}</TableCell>
                            <TableCell>
                              <Badge>{po.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(po.total_amount)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/procurement/po-list/${po.id}`}>View</Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
