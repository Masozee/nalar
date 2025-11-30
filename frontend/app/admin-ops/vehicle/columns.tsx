"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
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
import { VehicleBooking } from "@/lib/api/admin-ops"
import { format } from "date-fns"

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  approved: "bg-green-100 text-green-800 border-green-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
  in_progress: "bg-blue-100 text-blue-800 border-blue-300",
  completed: "bg-gray-100 text-gray-800 border-gray-300",
  cancelled: "bg-gray-100 text-gray-800 border-gray-300",
}

const statusLabels = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
}

export function createVehicleBookingColumns(): ColumnDef<VehicleBooking>[] {
  return [
    {
      accessorKey: "vehicle_name",
      header: "Vehicle",
      cell: ({ row }) => {
        const booking = row.original
        return (
          <div>
            <p className="font-medium">{booking.vehicle_name || (typeof booking.vehicle === 'string' ? booking.vehicle : 'N/A')}</p>
            {booking.vehicle_plate && (
              <p className="text-xs text-muted-foreground">{booking.vehicle_plate}</p>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "purpose",
      header: "Purpose",
      cell: ({ row }) => {
        const booking = row.original
        return (
          <Link
            href={`/admin-ops/vehicle/${booking.id}`}
            className="hover:underline text-blue-600"
          >
            {booking.purpose}
          </Link>
        )
      },
    },
    {
      accessorKey: "destination",
      header: "Destination",
      cell: ({ row }) => {
        return <span className="text-sm">{row.original.destination}</span>
      },
    },
    {
      accessorKey: "start_time",
      header: "Schedule",
      cell: ({ row }) => {
        const booking = row.original
        return (
          <div className="text-xs space-y-0.5">
            <p><span className="font-medium">Start:</span> {format(new Date(booking.start_time), 'PPp')}</p>
            <p><span className="font-medium">End:</span> {format(new Date(booking.end_time), 'PPp')}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "booked_by_name",
      header: "Booked By",
      cell: ({ row }) => {
        return <span className="text-sm">{row.original.booked_by_name || 'N/A'}</span>
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge variant="outline" className={statusColors[status]}>
            {statusLabels[status]}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const booking = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 border">
                <Icon name="MoreVertical" size={16} />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/admin-ops/vehicle/${booking.id}`}>
                  <Icon name="Eye" size={16} className="mr-2" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin-ops/vehicle/${booking.id}/edit`}>
                  <Icon name="Edit" size={16} className="mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Icon name="Trash" size={16} className="mr-2" />
                Cancel Booking
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
