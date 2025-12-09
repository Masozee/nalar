"use client"

import { ColumnDef } from "@tanstack/react-table"
import { AuditLog } from "@/lib/api/tenants"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import { DataTableColumnHeader } from "@/components/ui/data-table"
import { format } from "date-fns"

const getActionBadgeColor = (action: string) => {
  const colors: Record<string, string> = {
    create: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    update: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    delete: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    login: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    logout: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    export: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    import: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  }
  return colors[action] || "bg-gray-100 text-gray-800"
}

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "MMM d, yyyy HH:mm:ss")
  } catch {
    return dateString
  }
}

interface ColumnActionsProps {
  log: AuditLog
}

function ColumnActions({ log }: ColumnActionsProps) {
  const handleViewDetails = () => {
    // Show modal with full log details
    alert(JSON.stringify(log, null, 2))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <Icon name="MoreVertical" size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleViewDetails}>
          <Icon name="Eye" size={16} className="mr-2" />
          View details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(log.id)}>
          <Icon name="Copy" size={16} className="mr-2" />
          Copy ID
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const auditLogColumns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: "timestamp",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Timestamp" />
    ),
    cell: ({ row }) => {
      const timestamp = row.getValue("timestamp") as string
      return (
        <span className="text-sm font-mono">
          {formatDate(timestamp)}
        </span>
      )
    },
    size: 180,
  },
  {
    accessorKey: "user",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" />
    ),
    cell: ({ row }) => {
      const user = row.original.user
      if (!user) {
        return <span className="text-muted-foreground text-sm">System</span>
      }
      return (
        <div className="flex flex-col">
          <span className="font-medium text-sm">{user.full_name}</span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>
      )
    },
    size: 200,
  },
  {
    accessorKey: "action",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Action" />
    ),
    cell: ({ row }) => {
      const action = row.getValue("action") as string
      return (
        <Badge className={getActionBadgeColor(action)}>
          {action}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    size: 100,
  },
  {
    accessorKey: "model_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Model" />
    ),
    cell: ({ row }) => {
      const modelName = row.getValue("model_name") as string
      return (
        <span className="font-mono text-sm">
          {modelName}
        </span>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    size: 150,
  },
  {
    accessorKey: "object_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Object ID" />
    ),
    cell: ({ row }) => {
      const objectId = row.getValue("object_id") as string
      return (
        <span className="font-mono text-xs text-muted-foreground">
          {objectId.slice(0, 8)}...
        </span>
      )
    },
    size: 100,
  },
  {
    accessorKey: "ip_address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="IP Address" />
    ),
    cell: ({ row }) => {
      const ipAddress = row.getValue("ip_address") as string | null
      return (
        <span className="font-mono text-sm text-muted-foreground">
          {ipAddress || "-"}
        </span>
      )
    },
    size: 130,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const log = row.original
      return <ColumnActions log={log} />
    },
    size: 50,
  },
]
