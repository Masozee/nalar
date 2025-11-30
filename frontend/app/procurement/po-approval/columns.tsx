"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { POListItem, POPriority } from "@/lib/api/procurement"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/data-table"

const priorityLabels: Record<POPriority, string> = {
  low: 'Rendah',
  normal: 'Normal',
  high: 'Tinggi',
  urgent: 'Urgent',
}

const formatCurrency = (amount: string) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(parseFloat(amount))
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getPriorityBadge = (priority: POPriority) => {
  const config: Record<POPriority, string> = {
    low: "bg-gray-500",
    normal: "bg-blue-500",
    high: "bg-orange-500",
    urgent: "bg-red-500",
  }

  return (
    <Badge className={config[priority]}>
      {priorityLabels[priority]}
    </Badge>
  )
}

const getWaitingTime = (createdDate: string) => {
  const now = new Date()
  const created = new Date(createdDate)
  const diffMs = now.getTime() - created.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) {
    return (
      <span className={diffDays > 3 ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
        {diffDays} {diffDays === 1 ? 'day' : 'days'}
      </span>
    )
  }
  return (
    <span className="text-muted-foreground">
      {diffHours} {diffHours === 1 ? 'hour' : 'hours'}
    </span>
  )
}

export const poApprovalColumns: ColumnDef<POListItem>[] = [
  {
    accessorKey: "po_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PO Number" />
    ),
    cell: ({ row }) => {
      const po = row.original
      return (
        <Link
          href={`/procurement/po-approval/${po.id}`}
          className="font-medium hover:underline"
        >
          {po.po_number}
        </Link>
      )
    },
    size: 150,
  },
  {
    accessorKey: "vendor_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vendor" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("vendor_name")}</span>
    ),
    size: 200,
  },
  {
    accessorKey: "order_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order Date" />
    ),
    cell: ({ row }) => (
      <span className="text-sm">{formatDate(row.getValue("order_date"))}</span>
    ),
    size: 120,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Submitted At" />
    ),
    cell: ({ row }) => (
      <span className="text-sm">{formatDateTime(row.getValue("created_at"))}</span>
    ),
    size: 120,
  },
  {
    id: "waiting",
    header: "Waiting",
    cell: ({ row }) => getWaitingTime(row.original.created_at),
    size: 100,
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
    cell: ({ row }) => getPriorityBadge(row.getValue("priority")),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    size: 100,
  },
  {
    accessorKey: "total_amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Amount" className="text-right" />
    ),
    cell: ({ row }) => (
      <div className="text-right">
        <span className="font-medium">{formatCurrency(row.getValue("total_amount"))}</span>
      </div>
    ),
    size: 150,
  },
  {
    id: "payment_terms",
    header: "Payment Terms",
    cell: () => <span className="text-sm">30 days</span>,
    size: 120,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const po = row.original
      return (
        <div className="text-right">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/procurement/po-approval/${po.id}`}>Review</Link>
          </Button>
        </div>
      )
    },
    size: 100,
  },
]
