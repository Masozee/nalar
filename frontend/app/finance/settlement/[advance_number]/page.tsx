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
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { expenseAdvanceApi, type ExpenseAdvance, getAdvanceStatusColor } from "@/lib/api/finance"
import { Icon } from "@/components/ui/icon"

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatCurrency = (amount: string | number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(typeof amount === 'string' ? parseFloat(amount) : amount)
}

export default function SettlementDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [advance, setAdvance] = useState<ExpenseAdvance | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSettleDialog, setShowSettleDialog] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [settledAmount, setSettledAmount] = useState("")
  const [settlementDate, setSettlementDate] = useState("")

  useEffect(() => {
    if (params.advance_number) {
      fetchAdvance()
    }
  }, [params.advance_number])

  const fetchAdvance = async () => {
    try {
      setLoading(true)
      const data = await expenseAdvanceApi.get(params.advance_number as string)
      setAdvance(data)
      // Pre-fill with full balance
      setSettledAmount(data.balance.toString())
      // Pre-fill with today's date
      const today = new Date().toISOString().split('T')[0]
      setSettlementDate(today)
    } catch (error) {
      console.error("Error fetching advance:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSettle = async () => {
    if (!advance) return
    if (!settledAmount || parseFloat(settledAmount) <= 0) {
      alert("Please enter a valid settlement amount")
      return
    }
    try {
      setProcessing(true)
      await expenseAdvanceApi.settle(advance.advance_number, {
        settled_amount: parseFloat(settledAmount),
        settlement_date: settlementDate || undefined,
      })
      setShowSettleDialog(false)
      router.push('/finance/settlement')
    } catch (error) {
      console.error("Error settling advance:", error)
      alert("Failed to settle advance")
    } finally {
      setProcessing(false)
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
            <p className="text-muted-foreground">Loading advance details...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!advance) {
    return (
      <SidebarProvider style={{ "--sidebar-width": "350px" } as React.CSSProperties}>
        <AppSidebar />
        <SidebarInset>
          <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <div className="text-muted-foreground">Advance not found</div>
            <div className="ml-auto">
              <TopNavbar />
            </div>
          </header>
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
            <p className="text-muted-foreground">Advance not found</p>
            <Button asChild>
              <Link href="/finance/settlement">
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Back to Settlement
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
                  <BreadcrumbLink href="/finance">Finance</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/finance/settlement">Settlement</BreadcrumbLink>
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
              <h1 className="text-3xl font-bold mb-2">{advance.advance_number}</h1>
              <p className="text-muted-foreground">Settle Cash Advance</p>
            </div>
            <div className="inline-flex rounded-lg border border-input">
              <Button
                onClick={() => setShowSettleDialog(true)}
                variant="ghost"
                className="rounded-none rounded-l-lg border-0"
              >
                <Icon name="Check" size={16} className="mr-2" />
                Settle Advance
              </Button>
              <div className="w-px bg-border" />
              <Button
                variant="ghost"
                asChild
                className="rounded-none rounded-r-lg border-0"
              >
                <Link href="/finance/settlement">
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
                <CardTitle className="text-sm font-medium">Advance Amount</CardTitle>
                <Icon name="DollarSign" size={16} className="text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(advance.amount)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Already Settled</CardTitle>
                <Icon name="DollarSign" size={16} className="text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {advance.settled_amount !== '0' && advance.settled_amount !== '0.00'
                    ? formatCurrency(advance.settled_amount)
                    : formatCurrency(0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
                <Icon name="DollarSign" size={16} className="text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(advance.balance)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className={getAdvanceStatusColor(advance.status)}>
                  {advance.status_display}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Advance Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="FileText" size={20} />
                Advance Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Advance Number</label>
                  <p className="mt-1 font-medium">{advance.advance_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p className="mt-1">
                    <Badge variant="outline" className={getAdvanceStatusColor(advance.status)}>
                      {advance.status_display}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Requester</label>
                  <p className="mt-1">{advance.requester_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Request Date</label>
                  <p className="mt-1">{formatDate(advance.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Advance Amount</label>
                  <p className="mt-1 font-semibold">{formatCurrency(advance.amount)}</p>
                </div>
                {advance.expense_request_number && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Related Expense Request</label>
                    <p className="mt-1">
                      <Link
                        href={`/finance/all-requests/${advance.expense_request}`}
                        className="text-blue-600 hover:underline"
                      >
                        {advance.expense_request_number}
                      </Link>
                    </p>
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Purpose</label>
                  <p className="mt-1 whitespace-pre-wrap">{advance.purpose}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Approval Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="User" size={20} />
                Approval Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {advance.approved_by_name && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Approved By</label>
                      <p className="mt-1">{advance.approved_by_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Approval Date</label>
                      <p className="mt-1">{formatDate(advance.approved_at)}</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Settlement Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Calendar" size={20} />
                Settlement Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Advanced</label>
                  <p className="mt-1 font-semibold text-blue-600">{formatCurrency(advance.amount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Already Settled</label>
                  <p className="mt-1 font-semibold text-green-600">
                    {advance.settled_amount !== '0' && advance.settled_amount !== '0.00'
                      ? formatCurrency(advance.settled_amount)
                      : formatCurrency(0)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Outstanding Balance</label>
                  <p className="mt-1 font-semibold text-orange-600 text-xl">
                    {formatCurrency(advance.balance)}
                  </p>
                </div>
                {advance.settlement_date && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Settlement Date</label>
                    <p className="mt-1">{formatDate(advance.settlement_date)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {advance.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{advance.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>

      {/* Settle Dialog */}
      <Dialog open={showSettleDialog} onOpenChange={setShowSettleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settle Cash Advance</DialogTitle>
            <DialogDescription>
              Enter the settlement amount and date. The system will update the advance balance.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Outstanding Balance</Label>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {formatCurrency(advance.balance)}
              </p>
            </div>
            <div>
              <Label htmlFor="settled-amount">Settlement Amount *</Label>
              <Input
                id="settled-amount"
                type="number"
                value={settledAmount}
                onChange={(e) => setSettledAmount(e.target.value)}
                placeholder="Enter settlement amount"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum: {formatCurrency(advance.balance)}
              </p>
            </div>
            <div>
              <Label htmlFor="settlement-date">Settlement Date</Label>
              <Input
                id="settlement-date"
                type="date"
                value={settlementDate}
                onChange={(e) => setSettlementDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettleDialog(false)} disabled={processing}>
              Cancel
            </Button>
            <Button onClick={handleSettle} disabled={processing}>
              {processing ? 'Settling...' : 'Settle Advance'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
