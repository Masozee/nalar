"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import { DataTableColumnHeader } from "@/components/ui/data-table"

export type Department = {
  id: string
  name: string
  code: string
  description: string
  parent: string | null
  parent_name: string | null
  head: string | null
  head_name: string | null
  children_count: number
  employees_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export const createDepartmentColumns = (
  onEdit: (department: Department) => void,
  onDelete: (id: string) => void
): ColumnDef<Department>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Code" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("code")}</Badge>
    ),
  },
  {
    accessorKey: "parent_name",
    header: "Parent",
    cell: ({ row }) => {
      const parentName = row.getValue("parent_name") as string | null
      return parentName || <span className="text-muted-foreground">-</span>
    },
  },
  {
    accessorKey: "head_name",
    header: "Head",
    cell: ({ row }) => {
      const headName = row.getValue("head_name") as string | null
      return headName || <span className="text-muted-foreground">Not assigned</span>
    },
  },
  {
    accessorKey: "employees_count",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Employees" />
    ),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active") as boolean
      return (
        <Badge
          className={
            isActive
              ? "bg-green-100 text-green-800 hover:bg-green-100"
              : "bg-gray-100 text-gray-800 hover:bg-gray-100"
          }
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const department = row.original

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Icon name="MoreHorizontal" size={16} />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(department)}>
                <Icon name="Pencil" size={16} className="mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(department.id)}
                className="text-destructive"
              >
                <Icon name="Trash2" size={16} className="mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
