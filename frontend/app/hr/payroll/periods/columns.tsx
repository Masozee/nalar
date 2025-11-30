"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/data-table"
import { PayrollPeriod } from "@/lib/api/hr"
import { Badge } from "@/components/ui/badge"
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

const getStatusBadge = (status: string) => {
  const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", iconName: string }> = {
    draft: { variant: "outline", iconName: "Clock" },
    processing: { variant: "secondary", iconName: "TrendingUp" },
    finalized: { variant: "default", iconName: "CheckCircle" },
    paid: { variant: "default", iconName: "DollarSign" },
  }
  const { variant, iconName } = config[status] || { variant: "outline", iconName: "Clock" }
  return (
    <Badge variant={variant} className="flex items-center gap-1 w-fit">
      <Icon name={iconName} size={12} />
      {status}
    </Badge>
  )
}

export const payrollPeriodColumns: ColumnDef<PayrollPeriod>[] = [
  {
    id: "period",
    header: "Period",
    cell: ({ row }) => {
      const period = row.original
      return (
        <div className="flex items-center gap-2">
          <Icon name="Calendar" size={16} className="text-muted-foreground" />
          <div>
            <div className="font-medium">
              {getMonthName(period.month)} {period.year}
            </div>
            <div className="text-xs text-muted-foreground">
              Period {period.month}
            </div>
          </div>
        </div>
      )
    },
    size: 180,
  },
  {
    id: "date_range",
    header: "Date Range",
    cell: ({ row }) => {
      const period = row.original
      return (
        <div className="text-sm">
          {new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()}
        </div>
      )
    },
    size: 180,
  },
  {
    id: "payment_date",
    header: "Payment Date",
    cell: ({ row }) => {
      const period = row.original
      return (
        <div className="text-sm">
          {new Date(period.payment_date).toLocaleDateString()}
        </div>
      )
    },
    size: 120,
  },
  {
    accessorKey: "total_employees",
    header: ({ column }) => (
      <div className="text-center">
        <DataTableColumnHeader column={column} title="Employees" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {row.getValue("total_employees")}
      </div>
    ),
    size: 100,
  },
  {
    accessorKey: "total_gross_salary",
    header: ({ column }) => (
      <div className="text-right">
        <DataTableColumnHeader column={column} title="Gross Salary" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatCurrency(row.getValue("total_gross_salary"))}
      </div>
    ),
    size: 130,
  },
  {
    accessorKey: "total_deductions",
    header: ({ column }) => (
      <div className="text-right">
        <DataTableColumnHeader column={column} title="Deductions" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right text-red-600 font-medium">
        {formatCurrency(row.getValue("total_deductions"))}
      </div>
    ),
    size: 120,
  },
  {
    accessorKey: "total_net_salary",
    header: ({ column }) => (
      <div className="text-right">
        <DataTableColumnHeader column={column} title="Net Salary" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right text-green-600 font-medium">
        {formatCurrency(row.getValue("total_net_salary"))}
      </div>
    ),
    size: 130,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => getStatusBadge(row.getValue("status")),
    size: 120,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const period = row.original
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
                onClick={() => router.push(`/hr/payroll/periods/${period.id}`)}
              >
                <Icon name="Eye" size={16} className="mr-2" />
                View Details
              </DropdownMenuItem>
              {period.status === 'draft' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-blue-600">
                    <Icon name="Lock" size={16} className="mr-2" />
                    Finalize Period
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem>
                <Icon name="Download" size={16} className="mr-2" />
                Export Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
    size: 80,
  },
]
