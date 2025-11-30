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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { expenseRequestApi, type ExpenseRequest, getExpenseStatusColor } from "@/lib/api/finance"
import { Icon } from "@/components/ui/icon"

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatCurrency = (amount: string) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(parseFloat(amount))
}

export default function PendingApprovalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [expense, setExpense] = useState<ExpenseRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [approvedAmount, setApprovedAmount] = useState("")
  const [financeNotes, setFinanceNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    if (params.id) {
      fetchExpense()
    }
  }, [params.id])

  const fetchExpense = async () => {
    try {
      setLoading(true)
      const data = await expenseRequestApi.get(params.id as string)
      setExpense(data)
      setApprovedAmount(data.total_amount)
    } catch (error) {
      console.error("Error fetching expense:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!expense) return
    try {
      setProcessing(true)
      await expenseRequestApi.approve(expense.id, {
        approved_amount: approvedAmount ? parseFloat(approvedAmount) : undefined,
        finance_notes: financeNotes || undefined,
      })
      setShowApproveDialog(false)
      router.push('/finance/pending-approval')
    } catch (error) {
      console.error("Error approving expense:", error)
      alert("Failed to approve expense request")
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!expense) return
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason")
      return
    }
    try {
      setProcessing(true)
      await expenseRequestApi.reject(expense.id, {
        reason: rejectionReason,
      })
      setShowRejectDialog(false)
      router.push('/finance/pending-approval')
    } catch (error) {
      console.error("Error rejecting expense:", error)
      alert("Failed to reject expense request")
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
            <p className="text-muted-foreground">Loading expense details...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!expense || !['submitted', 'pending_approval'].includes(expense.status)) {
    return (
      <SidebarProvider style={{ "--sidebar-width": "350px" } as React.CSSProperties}>
        <AppSidebar />
        <SidebarInset>
          <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <div className="text-muted-foreground">Expense not found</div>
            <div className="ml-auto">
              <TopNavbar />
            </div>
          </header>
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
            <p className="text-muted-foreground">Expense request not pending approval</p>
            <Button asChild>
              <Link href="/finance/pending-approval">
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Back to Pending Approval
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
                  <BreadcrumbLink href="/finance/pending-approval">Pending Approval</BreadcrumbLink>
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
              <h1 className="text-3xl font-bold mb-2">{expense.request_number}</h1>
              <p className="text-muted-foreground">{expense.title}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowApproveDialog(true)}>
                <Icon name="Check" size={16} className="mr-2" />
                Approve
              </Button>
              <Button variant="outline" onClick={() => setShowRejectDialog(true)}>
                <Icon name="X" size={16} className="mr-2" />
                Reject
              </Button>
              <Button variant="outline" asChild>
                <Link href="/finance/pending-approval">
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
                <div className="text-2xl font-bold">{formatCurrency(expense.total_amount)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Requester</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-medium">{expense.requester_name}</div>
                <p className="text-xs text-muted-foreground">{expense.department || '-'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                <Icon name="FileText" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{expense.items.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className={getExpenseStatusColor(expense.status)}>
                  {expense.status_display}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Details Tabs */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList>
              <TabsTrigger value="details">Request Details</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="payment">Payment Info</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="FileText" size={20} />
                    Request Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Request Number</label>
                      <p className="mt-1 font-medium">{expense.request_number}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Requester</label>
                      <p className="mt-1">{expense.requester_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Title</label>
                      <p className="mt-1">{expense.title}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Department</label>
                      <p className="mt-1">{expense.department || '-'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">Description</label>
                      <p className="mt-1">{expense.description || '-'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">Purpose</label>
                      <p className="mt-1">{expense.purpose || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Request Date</label>
                      <p className="mt-1">{formatDate(expense.request_date)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Expense Date</label>
                      <p className="mt-1">{formatDate(expense.expense_date)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {expense.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{expense.notes}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="items">
              <Card>
                <CardHeader>
                  <CardTitle>Expense Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">No</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Receipt Number</TableHead>
                        <TableHead>Receipt Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expense.items.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.category_display}</Badge>
                          </TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell className="text-right">{parseFloat(item.quantity)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(item.amount)}</TableCell>
                          <TableCell>{item.receipt_number || '-'}</TableCell>
                          <TableCell>{item.receipt_date ? formatDate(item.receipt_date) : '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={5} className="text-right font-semibold">Total</TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(expense.total_amount)}</TableCell>
                        <TableCell colSpan={2}></TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                      <p className="mt-1">{expense.payment_method_display}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Currency</label>
                      <p className="mt-1">{expense.currency}</p>
                    </div>
                    {expense.payment_method === 'bank_transfer' && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Bank Name</label>
                          <p className="mt-1">{expense.bank_name || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Account Number</label>
                          <p className="mt-1">{expense.bank_account_number || '-'}</p>
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-muted-foreground">Account Name</label>
                          <p className="mt-1">{expense.bank_account_name || '-'}</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Expense Request</DialogTitle>
            <DialogDescription>
              Review and approve this expense request. You can adjust the approved amount if needed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="approved-amount">Approved Amount</Label>
              <Input
                id="approved-amount"
                type="number"
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(e.target.value)}
                placeholder="Enter approved amount"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Requested amount: {formatCurrency(expense.total_amount)}
              </p>
            </div>
            <div>
              <Label htmlFor="finance-notes">Finance Notes (Optional)</Label>
              <Textarea
                id="finance-notes"
                value={financeNotes}
                onChange={(e) => setFinanceNotes(e.target.value)}
                placeholder="Add any notes for the requester..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)} disabled={processing}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={processing}>
              {processing ? 'Approving...' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Expense Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this expense request.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rejection-reason">Rejection Reason *</Label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={processing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing}>
              {processing ? 'Rejecting...' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
