"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { POReceipt } from "@/lib/api/procurement"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/data-table"

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

export const goodsReceiptColumns: ColumnDef<POReceipt>[] = [
  {
    accessorKey: "receipt_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Receipt Number" />
    ),
    cell: ({ row }) => {
      const receipt = row.original
      return (
        <Link
          href={`/procurement/goods-receipt/${receipt.id}`}
          className="font-medium hover:underline"
        >
          {receipt.receipt_number}
        </Link>
      )
    },
    size: 150,
  },
  {
    accessorKey: "purchase_order",
    header: "PO Number",
    cell: ({ row }) => {
      const receipt = row.original
      return (
        <Link
          href={`/procurement/po-list/${receipt.purchase_order}`}
          className="text-sm hover:underline text-blue-600"
        >
          View PO
        </Link>
      )
    },
    size: 150,
  },
  {
    accessorKey: "receipt_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Receipt Date" />
    ),
    cell: ({ row }) => (
      <span className="text-sm">{formatDate(row.getValue("receipt_date"))}</span>
    ),
    size: 120,
  },
  {
    accessorKey: "delivery_note_number",
    header: "Delivery Note",
    cell: ({ row }) => {
      const value = row.getValue("delivery_note_number") as string | null
      return <span className="text-sm">{value || '-'}</span>
    },
    size: 150,
  },
  {
    accessorKey: "delivery_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Delivery Date" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("delivery_date") as string | null
      return <span className="text-sm">{date ? formatDate(date) : '-'}</span>
    },
    size: 120,
  },
  {
    accessorKey: "received_by_name",
    header: "Received By",
    cell: ({ row }) => {
      const value = row.getValue("received_by_name") as string | null
      return <span className="text-sm">{value || '-'}</span>
    },
    size: 150,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => (
      <span className="text-sm">{formatDateTime(row.getValue("created_at"))}</span>
    ),
    size: 120,
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => {
      const notes = row.getValue("notes") as string | null
      return <span className="text-sm truncate">{notes || '-'}</span>
    },
    size: 250,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const receipt = row.original
      return (
        <div className="text-right">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/procurement/goods-receipt/${receipt.id}`}>View</Link>
          </Button>
        </div>
      )
    },
    size: 80,
  },
]
