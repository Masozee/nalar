"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/data-table"
import { Icon } from "@/components/ui/icon"
import { Invoice } from "@/lib/api/tenants"
import { format } from "date-fns"

// Format date helper
const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "MMM d, yyyy")
  } catch {
    return dateString
  }
}

/**
 * Get badge variant for invoice status
 */
function getStatusBadgeVariant(status: Invoice["status"]) {
  const variants: Record<Invoice["status"], "default" | "secondary" | "destructive" | "outline"> = {
    paid: "default",
    pending: "secondary",
    draft: "outline",
    failed: "destructive",
    refunded: "secondary",
    canceled: "outline",
  }
  return variants[status] || "outline"
}

/**
 * Get status badge color
 */
function getStatusBadgeColor(status: Invoice["status"]) {
  const colors: Record<Invoice["status"], string> = {
    paid: "bg-green-100 text-green-800 hover:bg-green-200",
    pending: "bg-orange-100 text-orange-800 hover:bg-orange-200",
    draft: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    failed: "bg-red-100 text-red-800 hover:bg-red-200",
    refunded: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    canceled: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  }
  return colors[status] || "bg-gray-100 text-gray-800"
}

/**
 * Invoice table columns
 */
export const invoiceColumns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "invoice_number",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Invoice #" />,
    cell: ({ row }) => {
      const invoiceNumber = row.getValue("invoice_number") as string
      return (
        <div className="flex flex-col">
          <span className="font-mono font-medium">{invoiceNumber}</span>
        </div>
      )
    },
    size: 150,
  },
  {
    accessorKey: "issue_date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Issue Date" />,
    cell: ({ row }) => {
      const issueDate = row.getValue("issue_date") as string
      return <span className="text-sm">{formatDate(issueDate)}</span>
    },
    size: 120,
  },
  {
    accessorKey: "due_date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Due Date" />,
    cell: ({ row }) => {
      const dueDate = row.getValue("due_date") as string
      const isOverdue = row.original.is_overdue
      return (
        <div className="flex items-center gap-2">
          <span className={`text-sm ${isOverdue ? "text-red-600 font-medium" : ""}`}>
            {formatDate(dueDate)}
          </span>
          {isOverdue && (
            <Badge variant="destructive" className="text-xs">
              Overdue
            </Badge>
          )}
        </div>
      )
    },
    size: 150,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue("status") as Invoice["status"]
      const statusDisplay = row.original.status_display
      return (
        <Badge className={getStatusBadgeColor(status)}>
          {statusDisplay}
        </Badge>
      )
    },
    size: 120,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "total_amount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total_amount") as string)
      const currency = row.original.currency
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
      }).format(amount)
      return <span className="font-medium">{formatted}</span>
    },
    size: 120,
  },
  {
    accessorKey: "paid_date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Paid Date" />,
    cell: ({ row }) => {
      const paidDate = row.getValue("paid_date") as string | null
      if (!paidDate) {
        return <span className="text-sm text-muted-foreground">Not paid</span>
      }
      return <span className="text-sm">{formatDate(paidDate)}</span>
    },
    size: 120,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const invoice = row.original
      const hasPdf = !!invoice.pdf_url

      return (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={!hasPdf}
            onClick={() => {
              if (hasPdf) {
                window.open(invoice.pdf_url, "_blank")
              }
            }}
          >
            <Icon name="Download" className="h-4 w-4" />
          </Button>
        </div>
      )
    },
    size: 80,
  },
]
