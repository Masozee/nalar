"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/data-table"
import { LeaveBalance } from "@/lib/api/hr"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

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

const calculateUsagePercentage = (balance: LeaveBalance) => {
  if (balance.entitled_days === 0) return 0
  return Math.round((balance.used_days / balance.entitled_days) * 100)
}

const getUsageColor = (percentage: number) => {
  if (percentage >= 90) return "text-red-500"
  if (percentage >= 70) return "text-yellow-500"
  return "text-green-500"
}

export const leaveBalanceColumns: ColumnDef<LeaveBalance>[] = [
  {
    id: "employee",
    header: "Employee",
    cell: ({ row }) => {
      const balance = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              {getInitials(balance.employee_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{balance.employee_name || '-'}</div>
            <div className="text-sm text-muted-foreground">
              {balance.employee || '-'}
            </div>
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
    accessorKey: "entitled_days",
    header: ({ column }) => (
      <div className="text-center">
        <DataTableColumnHeader column={column} title="Entitled" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {row.getValue("entitled_days")}
      </div>
    ),
    size: 100,
  },
  {
    accessorKey: "carried_over",
    header: ({ column }) => (
      <div className="text-center">
        <DataTableColumnHeader column={column} title="Carried Over" />
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue("carried_over") as number
      return (
        <div className="text-center">
          {value > 0 ? (
            <Badge variant="secondary" className="font-medium">
              +{value}
            </Badge>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      )
    },
    size: 120,
  },
  {
    accessorKey: "used_days",
    header: ({ column }) => (
      <div className="text-center">
        <DataTableColumnHeader column={column} title="Used" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {row.getValue("used_days")}
      </div>
    ),
    size: 80,
  },
  {
    accessorKey: "remaining_days",
    header: ({ column }) => (
      <div className="text-center">
        <DataTableColumnHeader column={column} title="Remaining" />
      </div>
    ),
    cell: ({ row }) => {
      const balance = row.original
      const usagePercentage = calculateUsagePercentage(balance)
      return (
        <div className="text-center">
          <span className={`font-medium ${getUsageColor(usagePercentage)}`}>
            {balance.remaining_days}
          </span>
        </div>
      )
    },
    size: 100,
  },
  {
    id: "usage",
    header: "Usage",
    cell: ({ row }) => {
      const balance = row.original
      const usagePercentage = calculateUsagePercentage(balance)
      return (
        <div className="flex items-center gap-2">
          <Progress value={usagePercentage} className="w-[100px]" />
          <span className={`text-sm font-medium ${getUsageColor(usagePercentage)}`}>
            {usagePercentage}%
          </span>
        </div>
      )
    },
    size: 150,
  },
]
