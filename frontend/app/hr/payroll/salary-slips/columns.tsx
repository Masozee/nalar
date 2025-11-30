"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/data-table"
import { SalarySlip } from "@/lib/api/hr"
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

const getMonthName = (month: number) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  return months[month - 1]
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export const salarySlipColumns: ColumnDef<SalarySlip>[] = [
  {
    id: "employee",
    header: "Employee",
    cell: ({ row }) => {
      const slip = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {getInitials(slip.employee?.full_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{slip.employee?.full_name || '-'}</div>
            <div className="text-sm text-muted-foreground">
              {slip.employee?.employee_id || '-'}
            </div>
          </div>
        </div>
      )
    },
    size: 200,
  },
  {
    id: "period",
    header: "Period",
    cell: ({ row }) => {
      const slip = row.original
      return (
        <div className="flex items-center gap-1 text-sm">
          <Icon name="Calendar" size={12} className="text-muted-foreground" />
          {getMonthName(slip.period.month)} {slip.period.year}
        </div>
      )
    },
    size: 140,
  },
  {
    accessorKey: "basic_salary",
    header: ({ column }) => (
      <div className="text-right">
        <DataTableColumnHeader column={column} title="Basic" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatCurrency(row.getValue("basic_salary"))}
      </div>
    ),
    size: 110,
  },
  {
    accessorKey: "allowances",
    header: ({ column }) => (
      <div className="text-right">
        <DataTableColumnHeader column={column} title="Allowances" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right text-green-600">
        +{formatCurrency(row.getValue("allowances"))}
      </div>
    ),
    size: 120,
  },
  {
    accessorKey: "gross_salary",
    header: ({ column }) => (
      <div className="text-right">
        <DataTableColumnHeader column={column} title="Gross" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatCurrency(row.getValue("gross_salary"))}
      </div>
    ),
    size: 110,
  },
  {
    accessorKey: "deductions",
    header: ({ column }) => (
      <div className="text-right">
        <DataTableColumnHeader column={column} title="Deductions" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right text-red-600">
        -{formatCurrency(row.getValue("deductions"))}
      </div>
    ),
    size: 120,
  },
  {
    accessorKey: "tax",
    header: ({ column }) => (
      <div className="text-right">
        <DataTableColumnHeader column={column} title="Tax" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right text-red-600">
        -{formatCurrency(row.getValue("tax"))}
      </div>
    ),
    size: 100,
  },
  {
    accessorKey: "net_salary",
    header: ({ column }) => (
      <div className="text-right">
        <DataTableColumnHeader column={column} title="Net Salary" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right font-bold text-green-600">
        {formatCurrency(row.getValue("net_salary"))}
      </div>
    ),
    size: 130,
  },
  {
    accessorKey: "paid",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const paid = row.getValue("paid") as boolean
      return paid ? (
        <Badge variant="default" className="flex items-center gap-1 w-fit">
          <Icon name="CheckCircle" size={12} />
          Paid
        </Badge>
      ) : (
        <Badge variant="outline" className="flex items-center gap-1 w-fit">
          <Icon name="XCircle" size={12} />
          Unpaid
        </Badge>
      )
    },
    size: 100,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const slip = row.original
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
                onClick={() => router.push(`/hr/payroll/salary-slips/${slip.id}`)}
              >
                <Icon name="Eye" size={16} className="mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon name="Download" size={16} className="mr-2" />
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon name="FileText" size={16} className="mr-2" />
                Email to Employee
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
    size: 80,
  },
]
