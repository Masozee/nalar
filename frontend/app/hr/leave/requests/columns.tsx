"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/data-table"
import { LeaveRequest } from "@/lib/api/hr"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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

const getInitials = (name?: string) => {
  if (!name) return '??'
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const getLeaveTypeBadge = (type: string) => {
  const colors: Record<string, string> = {
    annual: "bg-blue-500",
    sick: "bg-red-500",
    unpaid: "bg-gray-500",
    maternity: "bg-pink-500",
    paternity: "bg-indigo-500",
    compassionate: "bg-purple-500",
  }
  return (
    <Badge className={colors[type] || "bg-gray-500"}>
      {type.replace('_', ' ')}
    </Badge>
  )
}

const getStatusBadge = (status: string) => {
  const config: Record<string, { className: string }> = {
    pending: { className: "bg-yellow-500" },
    approved: { className: "bg-green-500" },
    rejected: { className: "bg-red-500" },
    cancelled: { className: "bg-gray-500" },
  }
  return (
    <Badge className={config[status]?.className || "bg-gray-500"}>
      {status}
    </Badge>
  )
}

const formatDateRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  if (start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString()
  }
  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
}

export const leaveRequestColumns: ColumnDef<LeaveRequest>[] = [
  {
    id: "employee",
    header: "Employee",
    cell: ({ row }) => {
      const request = row.original
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {getInitials(request.employee_name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-medium text-sm truncate">{request.employee_name || '-'}</div>
          </div>
        </div>
      )
    },
    size: 200,
  },
  {
    accessorKey: "leave_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Leave Type" />
    ),
    cell: ({ row }) => getLeaveTypeBadge(row.getValue("leave_type")),
    size: 120,
  },
  {
    id: "date_range",
    header: "Date Range",
    cell: ({ row }) => {
      const request = row.original
      return (
        <div className="flex items-center gap-1 text-sm">
          <Icon name="Calendar" size={12} className="text-muted-foreground" />
          {formatDateRange(request.start_date, request.end_date)}
        </div>
      )
    },
    size: 180,
  },
  {
    accessorKey: "total_days",
    header: ({ column }) => (
      <div className="text-center">
        <DataTableColumnHeader column={column} title="Days" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {row.getValue("total_days")}
      </div>
    ),
    size: 60,
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <div className="truncate text-sm">
        {row.getValue("reason")}
      </div>
    ),
    size: 250,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => getStatusBadge(row.getValue("status")),
    size: 100,
  },
  {
    id: "approved_by",
    header: "Approved By",
    cell: ({ row }) => {
      const request = row.original
      return request.approved_by_name ? (
        <div className="text-sm truncate">{request.approved_by_name}</div>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      )
    },
    size: 150,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const request = row.original
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
                onClick={() => router.push(`/hr/leave/requests/${request.id}`)}
              >
                <Icon name="Eye" size={16} className="mr-2" />
                View Details
              </DropdownMenuItem>
              {request.status === 'pending' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-green-600">
                    <Icon name="CheckCircle" size={16} className="mr-2" />
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Icon name="XCircle" size={16} className="mr-2" />
                    Reject
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
    size: 80,
  },
]
