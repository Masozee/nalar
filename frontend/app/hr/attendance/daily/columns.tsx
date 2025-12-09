"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Attendance } from "@/lib/api/hr"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DataTableColumnHeader } from "@/components/ui/data-table"
import { Icon } from "@/components/ui/icon"

const getInitials = (name?: string) => {
  if (!name) return '??'
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const formatTime = (dateTime?: string) => {
  if (!dateTime) return "-"
  return new Date(dateTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusBadge = (status: string) => {
  const config: Record<string, { className: string }> = {
    present: { className: "bg-green-500" },
    absent: { className: "bg-red-500" },
    late: { className: "bg-yellow-500" },
    wfh: { className: "bg-blue-500" },
  }
  const { className } = config[status] || { className: "bg-gray-500" }
  return (
    <Badge className={className}>
      {status.replace('_', ' ')}
    </Badge>
  )
}

export const attendanceColumns: ColumnDef<Attendance>[] = [
  {
    id: "employee",
    header: "Employee",
    cell: ({ row }) => {
      const attendance = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              {getInitials(attendance.employee?.full_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{attendance.employee?.full_name || '-'}</div>
            <div className="text-sm text-muted-foreground">
              {attendance.employee?.employee_id || '-'}
            </div>
          </div>
        </div>
      )
    },
    size: 200,
  },
  {
    accessorKey: "check_in",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Check In" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Icon name="Clock" size={12} className="text-muted-foreground" />
        <span className="text-sm">{formatTime(row.getValue("check_in"))}</span>
      </div>
    ),
    size: 120,
  },
  {
    accessorKey: "check_out",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Check Out" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Icon name="Clock" size={12} className="text-muted-foreground" />
        <span className="text-sm">{formatTime(row.getValue("check_out"))}</span>
      </div>
    ),
    size: 120,
  },
  {
    accessorKey: "check_in_location",
    header: "Check In Location",
    cell: ({ row }) => {
      const location = row.getValue("check_in_location") as string
      const lat = row.original.check_in_latitude
      const lng = row.original.check_in_longitude

      if (location || (lat && lng)) {
        return (
          <div className="flex items-start gap-1 max-w-[200px]">
            <Icon name="MapPin" size={12} className="text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              {location && <div className="truncate" title={location}>{location}</div>}
              {lat && lng && (
                <div className="text-xs text-muted-foreground">
                  {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}
                </div>
              )}
            </div>
          </div>
        )
      }
      return <span className="text-sm text-muted-foreground">-</span>
    },
    size: 220,
  },
  {
    accessorKey: "check_out_location",
    header: "Check Out Location",
    cell: ({ row }) => {
      const location = row.getValue("check_out_location") as string
      const lat = row.original.check_out_latitude
      const lng = row.original.check_out_longitude

      if (location || (lat && lng)) {
        return (
          <div className="flex items-start gap-1 max-w-[200px]">
            <Icon name="MapPin" size={12} className="text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              {location && <div className="truncate" title={location}>{location}</div>}
              {lat && lng && (
                <div className="text-xs text-muted-foreground">
                  {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}
                </div>
              )}
            </div>
          </div>
        )
      }
      return <span className="text-sm text-muted-foreground">-</span>
    },
    size: 220,
  },
  {
    accessorKey: "work_hours",
    header: "Work Hours",
    cell: ({ row }) => {
      const hours = row.getValue("work_hours") as number
      return hours ? `${hours}h` : "-"
    },
    size: 100,
  },
  {
    accessorKey: "overtime_hours",
    header: "Overtime",
    cell: ({ row }) => {
      const hours = row.getValue("overtime_hours") as number
      return hours > 0 ? `${hours}h` : "-"
    },
    size: 100,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => getStatusBadge(row.getValue("status")),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    size: 100,
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.getValue("notes") || "-"}
      </span>
    ),
    size: 200,
  },
]
