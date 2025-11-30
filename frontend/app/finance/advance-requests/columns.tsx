"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/data-table"
import { ExpenseAdvanceListItem, getAdvanceStatusColor } from "@/lib/api/finance"
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

export const advanceRequestsColumns: ColumnDef<ExpenseAdvanceListItem>[] = [
  {
    accessorKey: "advance_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Advance Number" />
    ),
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
    accessorKey: "purpose",
    header: "Purpose",
    cell: ({ row }) => (
      <div className="max-w-md truncate">{row.getValue("purpose")}</div>
    ),
    size: 250,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Request Date" />
    ),
    cell: ({ row }) => formatDate(row.getValue("created_at")),
    size: 120,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <div className="text-right">
        <DataTableColumnHeader column={column} title="Amount" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatCurrency(row.getValue("amount"))}
      </div>
    ),
    size: 130,
  },
  {
    accessorKey: "settled_amount",
    header: () => <div className="text-right">Settled</div>,
    cell: ({ row }) => {
      const amount = row.getValue("settled_amount") as string
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
    accessorKey: "balance",
    header: () => <div className="text-right">Balance</div>,
    cell: ({ row }) => {
      const balance = row.getValue("balance") as number
      return (
        <div className="text-right">
          {balance > 0 ? (
            <span className="text-orange-600 font-semibold">
              {formatCurrency(balance.toString())}
            </span>
          ) : (
            '-'
          )}
        </div>
      )
    },
    size: 130,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <div className="text-center">
        <DataTableColumnHeader column={column} title="Status" />
      </div>
    ),
    cell: ({ row }) => {
      const advance = row.original
      return (
        <div className="text-center">
          <Badge variant="outline" className={getAdvanceStatusColor(advance.status)}>
            {advance.status_display}
          </Badge>
        </div>
      )
    },
    size: 120,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const advance = row.original
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
                onClick={() => router.push(`/finance/advance-requests/${advance.id}`)}
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
