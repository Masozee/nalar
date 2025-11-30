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
import { RoomBooking } from "@/lib/api/admin-ops"
import { format } from "date-fns"

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  approved: "bg-green-100 text-green-800 border-green-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
  cancelled: "bg-gray-100 text-gray-800 border-gray-300",
  completed: "bg-blue-100 text-blue-800 border-blue-300",
}

const statusLabels = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
  completed: "Completed",
}

export function createRoomBookingColumns(): ColumnDef<RoomBooking>[] {
  return [
    {
      accessorKey: "room_name",
      header: "Room",
      cell: ({ row }) => {
        const booking = row.original
        return (
          <span className="font-medium">
            {booking.room_name || (typeof booking.room === 'string' ? booking.room : 'N/A')}
          </span>
        )
      },
    },
    {
      accessorKey: "title",
      header: "Event Title",
      cell: ({ row }) => {
        const booking = row.original
        return (
          <Link
            href={`/admin-ops/room-booking/${booking.id}`}
            className="hover:underline text-blue-600"
          >
            {booking.title}
          </Link>
        )
      },
    },
    {
      accessorKey: "start_time",
      header: "Schedule",
      cell: ({ row }) => {
        const booking = row.original
        return (
          <div className="space-y-1">
            <div className="text-sm">
              <p className="font-medium">{format(new Date(booking.start_time), 'PPP')}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(booking.start_time), 'p')} - {format(new Date(booking.end_time), 'p')}
              </p>
            </div>
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
      accessorKey: "expected_attendees",
      header: "Attendees",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-1">
            <Icon name="Users" size={14} className="text-muted-foreground" />
            <span className="text-sm">{row.original.expected_attendees}</span>
          </div>
        )
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
                <Link href={`/admin-ops/room-booking/${booking.id}`}>
                  <Icon name="Eye" size={16} className="mr-2" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin-ops/room-booking/${booking.id}/edit`}>
                  <Icon name="Edit" size={16} className="mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Icon name="XCircle" size={16} className="mr-2" />
                Cancel Booking
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
