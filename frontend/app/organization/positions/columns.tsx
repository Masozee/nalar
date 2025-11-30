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

export type Position = {
  id: string
  name: string
  code: string
  description: string
  department: string | null
  department_name: string | null
  level: number
  min_salary: string | null
  max_salary: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

const formatCurrency = (value: string | null) => {
  if (!value) return "-"
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(parseFloat(value))
}

export const createPositionColumns = (
  onEdit: (position: Position) => void,
  onDelete: (id: string) => void
): ColumnDef<Position>[] => [
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
    accessorKey: "department_name",
    header: "Department",
    cell: ({ row }) => {
      const deptName = row.getValue("department_name") as string | null
      return deptName || <span className="text-muted-foreground">-</span>
    },
  },
  {
    accessorKey: "level",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Level" />
    ),
    cell: ({ row }) => (
      <Badge variant="secondary">Level {row.getValue("level")}</Badge>
    ),
  },
  {
    id: "salary_range",
    header: "Salary Range",
    cell: ({ row }) => {
      const position = row.original
      if (position.min_salary || position.max_salary) {
        return (
          <span className="text-sm">
            {formatCurrency(position.min_salary)} - {formatCurrency(position.max_salary)}
          </span>
        )
      }
      return <span className="text-muted-foreground">-</span>
    },
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
      const position = row.original

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
              <DropdownMenuItem onClick={() => onEdit(position)}>
                <Icon name="Pencil" size={16} className="mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(position.id)}
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
