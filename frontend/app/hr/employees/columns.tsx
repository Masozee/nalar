"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Employee } from "@/lib/api/hr"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

const getStatusBadge = (status: string) => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    active: "default",
    inactive: "secondary",
    terminated: "destructive",
  }
  return (
    <Badge variant={variants[status] || "outline"}>
      {status}
    </Badge>
  )
}

const getInitials = (firstName?: string, lastName?: string) => {
  if (!firstName || !lastName) return '??'
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export const employeeColumns: ColumnDef<Employee>[] = [
  {
    accessorKey: "full_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Employee" />
    ),
    cell: ({ row }) => {
      const employee = row.original
      return (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar>
            <AvatarImage src={employee.avatar} />
            <AvatarFallback>
              {getInitials(employee.first_name, employee.last_name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <Link
              href={`/hr/employees/${employee.id}`}
              className="font-medium hover:underline block truncate"
            >
              {employee.full_name || '-'}
            </Link>
            <div className="text-sm text-muted-foreground truncate">
              {employee.job_title || employee.position || '-'}
            </div>
          </div>
        </div>
      )
    },
    size: 250,
  },
  {
    accessorKey: "employee_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Employee ID" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue("employee_id")}</span>
    ),
    size: 130,
  },
  {
    accessorKey: "department",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Department" />
    ),
    cell: ({ row }) => {
      const department = row.original.department
      return department ? (
        <div className="flex items-center gap-2">
          <Icon name="Building" size={16} className="text-muted-foreground" />
          <span>{department.name}</span>
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
    size: 180,
  },
  {
    accessorKey: "position",
    header: "Position",
    cell: ({ row }) => row.getValue("position") || "-",
    size: 150,
  },
  {
    id: "contact",
    header: "Contact",
    cell: ({ row }) => {
      const employee = row.original
      return (
        <div className="flex flex-col gap-1 text-sm">
          {employee.personal_email && (
            <div className="flex items-center gap-1">
              <Icon name="Mail" size={12} className="text-muted-foreground" />
              <span className="text-xs truncate">{employee.personal_email}</span>
            </div>
          )}
          {employee.mobile && (
            <div className="flex items-center gap-1">
              <Icon name="Phone" size={12} className="text-muted-foreground" />
              <span className="text-xs">{employee.mobile}</span>
            </div>
          )}
        </div>
      )
    },
    size: 200,
  },
  {
    accessorKey: "join_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Join Date" />
    ),
    cell: ({ row }) => {
      const joinDate = row.getValue("join_date") as string
      return joinDate ? (
        <div className="flex items-center gap-1 text-sm">
          <Icon name="CalendarDays" size={12} className="text-muted-foreground" />
          {new Date(joinDate).toLocaleDateString()}
        </div>
      ) : (
        "-"
      )
    },
    size: 130,
  },
  {
    accessorKey: "employment_status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => getStatusBadge(row.getValue("employment_status")),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    size: 100,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const employee = row.original
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
                onClick={() => router.push(`/hr/employees/${employee.id}`)}
              >
                <Icon name="Eye" size={16} className="mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/hr/employees/${employee.id}/edit`)}
              >
                <Icon name="Edit" size={16} className="mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Icon name="Trash2" size={16} className="mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
    size: 80,
  },
]
