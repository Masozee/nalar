"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/data-table"
import { ExpenseRequestListItem, getExpenseStatusColor } from "@/lib/api/finance"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
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

export const allRequestsColumns: ColumnDef<ExpenseRequestListItem>[] = [
  {
    id: "request_number",
    header: "Request Number",
    cell: ({ row }) => {
      const expense = row.original
      return (
        <div className="min-w-0">
          <div className="font-medium">{expense.request_number}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {formatDate(expense.request_date)}
          </div>
        </div>
      )
    },
    size: 150,
  },
  {
    id: "requester",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Requester" />
    ),
    cell: ({ row }) => {
      const expense = row.original
      return (
        <div className="min-w-0">
          <div className="font-medium">{expense.requester_name}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {expense.department || '-'}
          </div>
        </div>
      )
    },
    size: 150,
  },
  {
    id: "title",
    header: "Title",
    cell: ({ row }) => {
      const expense = row.original
      return (
        <div className="min-w-0">
          <div className="truncate">{expense.title}</div>
          <div className="mt-1">
            <Badge variant="outline" className={getExpenseStatusColor(expense.status)}>
              {expense.status_display}
            </Badge>
          </div>
        </div>
      )
    },
    size: 200,
  },
  {
    accessorKey: "expense_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Expense Date" />
    ),
    cell: ({ row }) => formatDate(row.getValue("expense_date")),
    size: 120,
  },
  {
    accessorKey: "total_amount",
    header: ({ column }) => (
      <div className="text-right">
        <DataTableColumnHeader column={column} title="Amount" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatCurrency(row.getValue("total_amount"))}
      </div>
    ),
    size: 130,
  },
  {
    accessorKey: "approved_amount",
    header: "Approved Amount",
    cell: ({ row }) => {
      const amount = row.getValue("approved_amount") as string
      return (
        <div className="text-right">
          {amount !== '0' && amount !== '0.00'
            ? formatCurrency(amount)
            : '-'}
        </div>
      )
    },
    size: 130,
  },
  {
    accessorKey: "payment_method_display",
    header: "Payment Method",
    size: 130,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const expense = row.original
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useRouter()

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Icon name="MoreVertical" size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push(`/finance/all-requests/${expense.id}`)}
              >
                <Icon name="Eye" size={16} className="mr-2" />
                View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
    size: 80,
  },
]
