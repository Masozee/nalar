"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { POListItem, POStatus, POPriority, PaymentStatus } from "@/lib/api/procurement"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/data-table"
import { Icon } from "@/components/ui/icon"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const statusLabels: Record<POStatus, string> = {
  draft: 'Draf',
  pending_approval: 'Menunggu Persetujuan',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  sent: 'Dikirim ke Vendor',
  partial: 'Penerimaan Sebagian',
  received: 'Diterima Lengkap',
  cancelled: 'Dibatalkan',
  closed: 'Selesai',
}

const priorityLabels: Record<POPriority, string> = {
  low: 'Rendah',
  normal: 'Normal',
  high: 'Tinggi',
  urgent: 'Urgent',
}

const paymentStatusLabels: Record<PaymentStatus, string> = {
  unpaid: 'Belum Dibayar',
  partial: 'Dibayar Sebagian',
  paid: 'Lunas',
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

const getStatusBadge = (status: POStatus) => {
  const config: Record<POStatus, string> = {
    draft: "bg-gray-500",
    pending_approval: "bg-yellow-500",
    approved: "bg-green-500",
    rejected: "bg-red-500",
    sent: "bg-blue-500",
    partial: "bg-orange-500",
    received: "bg-green-600",
    cancelled: "bg-gray-400",
    closed: "bg-gray-700",
  }

  return (
    <Badge className={config[status]}>
      {statusLabels[status]}
    </Badge>
  )
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

const getPaymentBadge = (status: PaymentStatus) => {
  const config: Record<PaymentStatus, string> = {
    unpaid: "bg-red-500",
    partial: "bg-yellow-500",
    paid: "bg-green-500",
  }

  return (
    <Badge className={config[status]}>
      {paymentStatusLabels[status]}
    </Badge>
  )
}

export const poListColumns: ColumnDef<POListItem>[] = [
  {
    accessorKey: "po_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PO Number" />
    ),
    cell: ({ row }) => {
      const po = row.original
      return (
        <div className="flex flex-col gap-1">
          <Link
            href={`/procurement/po-list/${po.id}`}
            className="font-medium hover:underline"
          >
            {po.po_number}
          </Link>
          {getStatusBadge(po.status)}
        </div>
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
    accessorKey: "expected_delivery_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Expected Delivery" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("expected_delivery_date") as string | null
      return <span className="text-sm">{date ? formatDate(date) : '-'}</span>
    },
    size: 120,
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
    accessorKey: "payment_status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment" />
    ),
    cell: ({ row }) => getPaymentBadge(row.getValue("payment_status")),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    size: 120,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const po = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 border">
              <Icon name="MoreVertical" size={16} />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/procurement/po-list/${po.id}`}>
                <Icon name="Eye" size={16} className="mr-2" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/procurement/po-list/${po.id}/edit`}>
                <Icon name="Edit" size={16} className="mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Icon name="Download" size={16} className="mr-2" />
              Download PDF
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icon name="Send" size={16} className="mr-2" />
              Send to Vendor
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Icon name="Trash" size={16} className="mr-2" />
              Cancel PO
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    size: 80,
  },
]
