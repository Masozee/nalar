"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/data-table"
import { Policy } from "@/lib/api/hr"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { className: string }> = {
    draft: { className: "bg-gray-500" },
    pending_approval: { className: "bg-yellow-500" },
    approved: { className: "bg-green-500" },
    rejected: { className: "bg-red-500" },
    archived: { className: "bg-gray-400" },
  }
  const config = statusConfig[status] || statusConfig.draft
  return (
    <Badge className={config.className}>
      {status.replace('_', ' ')}
    </Badge>
  )
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

interface PolicyColumnsProps {
  categories: Array<{ id: number; name: string }>
  onDownload: (policy: Policy) => void
}

export const createPolicyColumns = ({ categories, onDownload }: PolicyColumnsProps): ColumnDef<Policy>[] => [
  {
    id: "policy",
    header: "Policy",
    cell: ({ row }) => {
      const policy = row.original
      return (
        <div className="min-w-0">
          <Link
            href={`/hr/policies/${policy.id}`}
            className="font-medium hover:underline block"
          >
            {policy.title}
          </Link>
          <div className="text-sm text-muted-foreground">
            {policy.description}
          </div>
          <div className="mt-1">
            {getStatusBadge(policy.status)}
          </div>
        </div>
      )
    },
    size: 240,
  },
  {
    id: "category",
    header: "Category",
    cell: ({ row }) => {
      const policy = row.original
      const category = categories.find(c => c.id === policy.category)
      return <span className="text-sm">{category?.name || '-'}</span>
    },
    size: 120,
  },
  {
    accessorKey: "version",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Version" />
    ),
    cell: ({ row }) => (
      <span className="text-sm font-mono">{row.getValue("version")}</span>
    ),
    size: 80,
  },
  {
    id: "approvals",
    header: "Approvals",
    cell: ({ row }) => {
      const policy = row.original
      return policy.approval_status ? (
        <div className="text-sm">
          <span className="text-green-600">{policy.approval_status.approved}</span>
          <span className="text-muted-foreground">/</span>
          <span>{policy.approval_status.total}</span>
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      )
    },
    size: 80,
  },
  {
    accessorKey: "effective_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Effective Date" />
    ),
    cell: ({ row }) => (
      <span className="text-sm">{formatDate(row.getValue("effective_date"))}</span>
    ),
    size: 100,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const policy = row.original
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDownload(policy)}
            disabled={!policy.file_url}
          >
            <Icon name="Download" size={16} />
          </Button>
        </div>
      )
    },
    size: 80,
  },
]
