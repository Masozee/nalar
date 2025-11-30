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

const formatCurrency = (amount: string | number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(typeof amount === 'string' ? parseFloat(amount) : amount)
}

const getDaysOutstanding = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

export const settlementColumns: ColumnDef<ExpenseAdvanceListItem>[] = [
  {
    id: "advance_number",
    header: "Advance Number",
    cell: ({ row }) => {
      const advance = row.original
      return (
        <div className="min-w-0">
          <div className="font-medium">{advance.advance_number}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {formatDate(advance.created_at)}
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
    id: "purpose",
    header: "Purpose",
    cell: ({ row }) => {
      const advance = row.original
      return (
        <div className="min-w-0">
          <div className="max-w-md truncate">{advance.purpose}</div>
          <div className="text-xs mt-1">
            <Badge variant="outline" className={getAdvanceStatusColor(advance.status)}>
              {advance.status_display}
            </Badge>
          </div>
        </div>
      )
    },
    size: 250,
  },
  {
    id: "days_outstanding",
    header: () => <div className="text-center">Days Outstanding</div>,
    cell: ({ row }) => {
      const advance = row.original
      const daysOut = getDaysOutstanding(advance.created_at)
      return (
        <div className="text-center">
          <span className={daysOut > 30 ? 'text-red-600 font-semibold' : ''}>
            {daysOut} {daysOut === 1 ? 'day' : 'days'}
          </span>
        </div>
      )
    },
    size: 130,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <div className="text-right">
        <DataTableColumnHeader column={column} title="Advanced Amount" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatCurrency(row.getValue("amount"))}
      </div>
    ),
    size: 140,
  },
  {
    accessorKey: "settled_amount",
    header: () => <div className="text-right">Settled Amount</div>,
    cell: ({ row }) => {
      const amount = row.getValue("settled_amount") as string
      return (
        <div className="text-right text-green-600">
          {amount !== '0' && amount !== '0.00'
            ? formatCurrency(amount)
            : '-'}
        </div>
      )
    },
    size: 140,
  },
  {
    accessorKey: "balance",
    header: () => <div className="text-right">Balance</div>,
    cell: ({ row }) => {
      const balance = row.getValue("balance") as number
      return (
        <div className="text-right">
          <span className="text-orange-600 font-bold">
            {formatCurrency(balance)}
          </span>
        </div>
      )
    },
    size: 130,
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
                onClick={() => router.push(`/finance/settlement/${advance.advance_number}`)}
              >
                <Icon name="Eye" size={16} className="mr-2" />
                View & Settle
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
    size: 80,
  },
]
