"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { GrantDisbursement } from "@/lib/api/research"

function formatDate(date: string | null | undefined): string {
  if (!date) return "-"
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function formatCurrency(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num)
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    approved: "bg-blue-100 text-blue-800 border-blue-200",
    disbursed: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
  }
  return colors[status] || "bg-gray-100 text-gray-800"
}

export const disbursementColumns: ColumnDef<GrantDisbursement>[] = [
  {
    accessorKey: "disbursement_number",
    header: "Disbursement",
    cell: ({ row }) => {
      const disbursement = row.original
      return (
        <div className="min-w-0">
          <div className="font-medium">{disbursement.disbursement_number}</div>
          {disbursement.description && (
            <div className="text-sm text-muted-foreground mt-1 line-clamp-2 max-w-md">
              {disbursement.description}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.original.amount
      return <div className="font-semibold">{formatCurrency(amount)}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const disbursement = row.original
      return (
        <Badge variant="outline" className={getStatusColor(disbursement.status)}>
          {disbursement.status_display}
        </Badge>
      )
    },
  },
  {
    accessorKey: "request_date",
    header: "Request Date",
    cell: ({ row }) => formatDate(row.original.request_date),
  },
  {
    accessorKey: "disbursement_date",
    header: "Disbursed Date",
    cell: ({ row }) => formatDate(row.original.disbursement_date),
  },
  {
    accessorKey: "approved_by_name",
    header: "Approved By",
    cell: ({ row }) => row.original.approved_by_name || "-",
  },
]
