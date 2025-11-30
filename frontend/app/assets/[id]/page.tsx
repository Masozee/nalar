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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { assetsApi, type Asset, type AssetStatus, type AssetCategory } from "@/lib/api/assets"
import { Icon } from "@/components/ui/icon"

const categoryLabels: Record<AssetCategory, string> = {
  it_equipment: 'IT Equipment',
  furniture: 'Furniture',
  vehicle: 'Vehicle',
  office_equipment: 'Office Equipment',
  building: 'Building',
  land: 'Land',
  other: 'Other',
}

const statusLabels: Record<AssetStatus, string> = {
  active: 'Active',
  maintenance: 'Maintenance',
  repair: 'Repair',
  retired: 'Retired',
  lost: 'Lost',
  damaged: 'Damaged',
}

const getInitials = (name?: string) => {
  if (!name) return '??'
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const formatCurrency = (value?: number) => {
  if (!value) return '-'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export default function AssetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [asset, setAsset] = useState<Asset | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchAsset(params.id as string)
    }
  }, [params.id])

  const fetchAsset = async (id: string) => {
    try {
      setLoading(true)
      const data = await assetsApi.get(id)
      setAsset(data)
    } catch (error) {
      console.error("Error fetching asset:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: AssetStatus) => {
    const config: Record<AssetStatus, string> = {
      active: "bg-green-500",
      maintenance: "bg-yellow-500",
      repair: "bg-orange-500",
      retired: "bg-gray-500",
      lost: "bg-red-500",
      damaged: "bg-red-600",
    }

    return (
      <Badge className={config[status]}>
        {statusLabels[status]}
      </Badge>
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
                  <BreadcrumbLink href="/assets">Assets</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{asset?.asset_code || 'Loading...'}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        {loading ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <p className="text-muted-foreground">Loading asset details...</p>
          </div>
        ) : !asset ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
            <Icon name="Package" size={48} className="text-muted-foreground" />
            <p className="text-muted-foreground">Asset not found</p>
            <Button asChild variant="outline">
              <Link href="/assets">
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Back to Assets
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-6 p-6">
            {/* Back Button */}
            <Button asChild variant="ghost" className="w-fit">
              <Link href="/assets">
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Back to Assets
              </Link>
            </Button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{asset.name}</h1>
          <p className="text-muted-foreground">{asset.asset_code}</p>
        </div>
        <div className="flex gap-2">
          {getStatusBadge(asset.status)}
          <Button variant="outline" size="sm">
            <Icon name="Edit" size={16} className="mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm">
            <Icon name="Trash2" size={16} className="mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Asset Code</label>
                  <p className="text-sm mt-1">{asset.asset_code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <p className="text-sm mt-1">{categoryLabels[asset.category]}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Brand</label>
                  <p className="text-sm mt-1">{asset.brand || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Model</label>
                  <p className="text-sm mt-1">{asset.model || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Serial Number</label>
                  <p className="text-sm mt-1">{asset.serial_number || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Department</label>
                  <p className="text-sm mt-1">{asset.department || '-'}</p>
                </div>
              </div>

              {asset.description && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="text-sm mt-1">{asset.description}</p>
                  </div>
                </>
              )}

              {asset.location && (
                <div className="flex items-start gap-2 pt-2">
                  <Icon name="MapPin" size={16} className="text-muted-foreground mt-0.5" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Location</label>
                    <p className="text-sm mt-1">{asset.location}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Purchase Information */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Purchase Date</label>
                  <p className="text-sm mt-1">{formatDate(asset.purchase_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Purchase Price</label>
                  <p className="text-sm mt-1">{formatCurrency(asset.purchase_price)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Supplier</label>
                  <p className="text-sm mt-1">{asset.supplier || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Invoice Number</label>
                  <p className="text-sm mt-1">{asset.invoice_number || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warranty Information */}
          {asset.warranty_expiry && (
            <Card>
              <CardHeader>
                <CardTitle>Warranty Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Warranty Expiry</label>
                    <p className="text-sm mt-1">{formatDate(asset.warranty_expiry)}</p>
                  </div>
                  {asset.warranty_info && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">Warranty Info</label>
                      <p className="text-sm mt-1">{asset.warranty_info}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Depreciation */}
          {asset.depreciation_method && (
            <Card>
              <CardHeader>
                <CardTitle>Depreciation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Method</label>
                    <p className="text-sm mt-1">{asset.depreciation_method}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Rate</label>
                    <p className="text-sm mt-1">{asset.depreciation_rate ? `${asset.depreciation_rate}%` : '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Useful Life</label>
                    <p className="text-sm mt-1">{asset.useful_life_years ? `${asset.useful_life_years} years` : '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Current Value</label>
                    <p className="text-sm mt-1 font-semibold">{formatCurrency(asset.current_value)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {asset.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{asset.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Current Holder */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current Holder</CardTitle>
            </CardHeader>
            <CardContent>
              {asset.current_holder ? (
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {getInitials(asset.current_holder.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {asset.current_holder.full_name || asset.current_holder.email}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {asset.current_holder.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="CheckCircle" size={16} />
                  <p className="text-sm">Available for assignment</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/assets/assignment?asset=${asset.id}`}>
                  <Icon name="User" size={16} className="mr-2" />
                  Assign Asset
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/assets/maintenance?asset=${asset.id}`}>
                  <Icon name="Wrench" size={16} className="mr-2" />
                  Schedule Maintenance
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/assets/${asset.id}/history`}>
                  <Icon name="FileText" size={16} className="mr-2" />
                  View History
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Created</label>
                <p className="text-sm mt-1">{formatDate(asset.created_at)}</p>
              </div>
              <Separator />
              <div>
                <label className="text-xs font-medium text-muted-foreground">Last Updated</label>
                <p className="text-sm mt-1">{formatDate(asset.updated_at)}</p>
              </div>
              <Separator />
              <div>
                <label className="text-xs font-medium text-muted-foreground">Active Status</label>
                <p className="text-sm mt-1">{asset.is_active ? 'Active' : 'Inactive'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}
