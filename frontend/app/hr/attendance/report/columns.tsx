"use client"

import { ColumnDef } from "@tanstack/react-table"
import { AttendanceSummary } from "@/lib/api/hr"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DataTableColumnHeader } from "@/components/ui/data-table"
import { Icon } from "@/components/ui/icon"

const getInitials = (name?: string) => {
  if (!name) return '??'
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const calculateAttendanceRate = (summary: AttendanceSummary) => {
  if (summary.total_days === 0) return 0
  return Math.round((summary.present_days / summary.total_days) * 100)
}

const getAttendanceRateBadge = (rate: number) => {
  if (rate >= 95) return <Badge className="bg-green-500">Excellent</Badge>
  if (rate >= 85) return <Badge className="bg-blue-500">Good</Badge>
  if (rate >= 75) return <Badge className="bg-yellow-500">Fair</Badge>
  return <Badge className="bg-red-500">Poor</Badge>
}

export const attendanceSummaryColumns: ColumnDef<AttendanceSummary>[] = [
  {
    id: "employee",
    header: "Employee",
    cell: ({ row }) => {
      const summary = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              {getInitials(summary.employee?.full_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{summary.employee?.full_name || '-'}</div>
            <div className="text-sm text-muted-foreground">
              {summary.employee?.employee_id || '-'}
            </div>
          </div>
        </div>
      )
    },
    size: 200,
  },
  {
    accessorKey: "total_days",
    header: ({ column }) => (
      <div className="text-center">
        <DataTableColumnHeader column={column} title="Total Days" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("total_days")}</div>
    ),
    size: 100,
  },
  {
    accessorKey: "present_days",
    header: ({ column }) => (
      <div className="text-center">
        <DataTableColumnHeader column={column} title="Present" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-1">
        <Icon name="CheckCircle" size={12} className="text-green-500" />
        <span className="font-medium">{row.getValue("present_days")}</span>
      </div>
    ),
    size: 80,
  },
  {
    accessorKey: "absent_days",
    header: ({ column }) => (
      <div className="text-center">
        <DataTableColumnHeader column={column} title="Absent" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-1">
        <Icon name="XCircle" size={12} className="text-red-500" />
        <span className="font-medium">{row.getValue("absent_days")}</span>
      </div>
    ),
    size: 80,
  },
  {
    accessorKey: "late_days",
    header: ({ column }) => (
      <div className="text-center">
        <DataTableColumnHeader column={column} title="Late" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-1">
        <Icon name="Timer" size={12} className="text-yellow-500" />
        <span className="font-medium">{row.getValue("late_days")}</span>
      </div>
    ),
    size: 80,
  },
  {
    accessorKey: "wfh_days",
    header: ({ column }) => (
      <div className="text-center">
        <DataTableColumnHeader column={column} title="WFH" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-1">
        <Icon name="MapPin" size={12} className="text-blue-500" />
        <span className="font-medium">{row.getValue("wfh_days")}</span>
      </div>
    ),
    size: 80,
  },
  {
    id: "leave_days",
    header: ({ column }) => (
      <div className="text-center">Leave</div>
    ),
    cell: ({ row }) => {
      const summary = row.original
      return (
        <div className="text-center">
          {summary.leave_days + summary.sick_days}
        </div>
      )
    },
    size: 80,
  },
  {
    accessorKey: "total_work_hours",
    header: ({ column }) => (
      <div className="text-right">
        <DataTableColumnHeader column={column} title="Work Hours" />
      </div>
    ),
    cell: ({ row }) => {
      const hours = row.getValue("total_work_hours") as number
      return <div className="text-right font-medium">{hours.toFixed(1)}h</div>
    },
    size: 100,
  },
  {
    accessorKey: "total_overtime_hours",
    header: ({ column }) => (
      <div className="text-right">
        <DataTableColumnHeader column={column} title="Overtime" />
      </div>
    ),
    cell: ({ row }) => {
      const hours = row.getValue("total_overtime_hours") as number
      return (
        <div className="text-right font-medium">
          {hours > 0 ? `${hours.toFixed(1)}h` : "-"}
        </div>
      )
    },
    size: 100,
  },
  {
    id: "attendance_rate",
    header: "Attendance Rate",
    cell: ({ row }) => {
      const attendanceRate = calculateAttendanceRate(row.original)
      return (
        <div className="flex items-center gap-2">
          {getAttendanceRateBadge(attendanceRate)}
          <span className="text-sm font-medium">{attendanceRate}%</span>
        </div>
      )
    },
    size: 150,
  },
]
