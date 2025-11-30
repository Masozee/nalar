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

const formatCurrency = (amount: string) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(parseFloat(amount))
}

const getWaitingDays = (requestDate: string) => {
  const now = new Date()
  const request = new Date(requestDate)
  const diff = Math.floor((now.getTime() - request.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

export const pendingApprovalColumns: ColumnDef<ExpenseRequestListItem>[] = [
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
    accessorKey: "requester_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Requester" />
    ),
    size: 150,
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => row.getValue("department") || '-',
    size: 120,
  },
  {
    id: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const expense = row.original
      return (
        <div className="min-w-0">
          <div className="font-medium">{expense.title}</div>
          <div className="text-xs mt-1">
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
    id: "waiting_days",
    header: () => <div className="text-center">Waiting Days</div>,
    cell: ({ row }) => {
      const expense = row.original
      const waitingDays = getWaitingDays(expense.request_date)
      return (
        <div className="text-center">
          <span className={waitingDays > 3 ? 'text-red-600 font-semibold' : ''}>
            {waitingDays} {waitingDays === 1 ? 'day' : 'days'}
          </span>
        </div>
      )
    },
    size: 110,
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
                onClick={() => router.push(`/finance/pending-approval/${expense.id}`)}
              >
                <Icon name="Eye" size={16} className="mr-2" />
                View & Approve
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
    size: 80,
  },
]
