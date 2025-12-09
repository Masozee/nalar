"use client"

import { ColumnDef } from "@tanstack/react-table"
import { TenantUser } from "@/lib/api/tenants"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import { DataTableColumnHeader } from "@/components/ui/data-table"
import { formatDistanceToNow } from "date-fns"

const getRoleBadgeColor = (role: string) => {
  const colors: Record<string, string> = {
    owner: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    admin: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    manager: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    member: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    viewer: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  }
  return colors[role] || "bg-gray-100 text-gray-800"
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return "Never"
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true })
  } catch {
    return dateString
  }
}

interface ColumnActionsProps {
  user: TenantUser
  onEdit: (user: TenantUser) => void
  onRemove: (user: TenantUser) => void
}

function ColumnActions({ user, onEdit, onRemove }: ColumnActionsProps) {
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
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.user.email)}>
          <Icon name="Copy" size={16} className="mr-2" />
          Copy email
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onEdit(user)}>
          <Icon name="Edit" size={16} className="mr-2" />
          Edit user
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onRemove(user)}
          className="text-red-600 focus:text-red-600"
        >
          <Icon name="Trash2" size={16} className="mr-2" />
          Remove user
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const createUserColumns = (
  onEdit: (user: TenantUser) => void,
  onRemove: (user: TenantUser) => void
): ColumnDef<TenantUser>[] => [
  {
    accessorKey: "user.full_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const user = row.original.user
      const fullName = `${user.first_name} ${user.last_name}`.trim() || user.email
      return (
        <div className="flex flex-col">
          <span className="font-medium">{fullName}</span>
          <span className="text-sm text-muted-foreground">{user.email}</span>
        </div>
      )
    },
    size: 250,
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const role = row.getValue("role") as string
      return (
        <Badge className={getRoleBadgeColor(role)}>
          {role}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    size: 120,
  },
  {
    accessorKey: "is_active",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("is_active") as boolean
      return isActive ? (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Active
        </Badge>
      ) : (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          Inactive
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    size: 100,
  },
  {
    accessorKey: "user.last_login",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Login" />
    ),
    cell: ({ row }) => {
      const lastLogin = row.original.user.last_login
      return (
        <span className="text-sm text-muted-foreground">
          {formatDate(lastLogin)}
        </span>
      )
    },
    size: 150,
  },
  {
    accessorKey: "joined_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Joined" />
    ),
    cell: ({ row }) => {
      const joinedAt = row.getValue("joined_at") as string
      return (
        <span className="text-sm text-muted-foreground">
          {formatDate(joinedAt)}
        </span>
      )
    },
    size: 150,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original
      return <ColumnActions user={user} onEdit={onEdit} onRemove={onRemove} />
    },
    size: 50,
  },
]
