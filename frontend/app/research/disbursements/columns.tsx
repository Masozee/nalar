"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import { GrantDisbursement } from "@/lib/api/research"

function getDisbursementStatusColor(status: string): string {
  const colors: Record<string, string> = {
    requested: "bg-blue-100 text-blue-800 border-blue-200",
    approved: "bg-green-100 text-green-800 border-green-200",
    disbursed: "bg-purple-100 text-purple-800 border-purple-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
  }
  return colors[status] || "bg-gray-100 text-gray-800"
}

function formatCurrency(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num)
}

export const disbursementColumns: ColumnDef<GrantDisbursement>[] = [
  {
    accessorKey: "disbursement_number",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 h-auto font-semibold"
        >
          Disbursement Number
          <Icon
            name={column.getIsSorted() === "asc" ? "ChevronUp" : "ChevronDown"}
            size={16}
            className="ml-2"
          />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.disbursement_number}</div>
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 h-auto font-semibold"
        >
          Description & Status
          <Icon
            name={column.getIsSorted() === "asc" ? "ChevronUp" : "ChevronDown"}
            size={16}
            className="ml-2"
          />
        </Button>
      )
    },
    cell: ({ row }) => {
      const disbursement = row.original
      return (
        <div className="min-w-0">
          <div className="font-medium">{disbursement.description}</div>
          <div className="text-xs mt-1">
            <Badge variant="outline" className={getDisbursementStatusColor(disbursement.status)}>
              {disbursement.status_display}
            </Badge>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 h-auto font-semibold"
        >
          Amount
          <Icon
            name={column.getIsSorted() === "asc" ? "ChevronUp" : "ChevronDown"}
            size={16}
            className="ml-2"
          />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <div className="font-medium">{formatCurrency(row.original.amount)}</div>
    },
  },
  {
    accessorKey: "request_date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 h-auto font-semibold"
        >
          Request Date
          <Icon
            name={column.getIsSorted() === "asc" ? "ChevronUp" : "ChevronDown"}
            size={16}
            className="ml-2"
          />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="text-sm">
          {new Date(row.original.request_date).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>
      )
    },
  },
  {
    accessorKey: "disbursement_date",
    header: "Disbursement Date",
    cell: ({ row }) => {
      const date = row.original.disbursement_date
      if (!date) return <span className="text-muted-foreground">-</span>

      return (
        <div className="text-sm">
          {new Date(date).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>
      )
    },
  },
  {
    accessorKey: "approved_by_name",
    header: "Approved By",
    cell: ({ row }) => {
      const name = row.original.approved_by_name
      if (!name) return <span className="text-muted-foreground">-</span>
      return <div className="text-sm">{name}</div>
    },
  },
]
