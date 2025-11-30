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
import { Vehicle } from "@/lib/api/admin-ops"

const statusColors = {
  available: "bg-green-100 text-green-800 border-green-300",
  in_use: "bg-blue-100 text-blue-800 border-blue-300",
  maintenance: "bg-yellow-100 text-yellow-800 border-yellow-300",
  unavailable: "bg-red-100 text-red-800 border-red-300",
}

const statusLabels = {
  available: "Available",
  in_use: "In Use",
  maintenance: "Maintenance",
  unavailable: "Unavailable",
}

export function createVehicleFleetColumns(): ColumnDef<Vehicle>[] {
  return [
    {
      accessorKey: "name",
      header: "Vehicle",
      cell: ({ row }) => {
        const vehicle = row.original
        return (
          <div>
            <Link
              href={`/admin-ops/vehicle/fleet/${vehicle.id}`}
              className="font-medium hover:underline text-blue-600"
            >
              {vehicle.name}
            </Link>
            <p className="text-xs text-muted-foreground">{vehicle.plate_number}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "vehicle_type",
      header: "Type",
      cell: ({ row }) => {
        return <span className="text-sm capitalize">{row.original.vehicle_type}</span>
      },
    },
    {
      accessorKey: "brand",
      header: "Brand & Model",
      cell: ({ row }) => {
        const vehicle = row.original
        return (
          <div>
            <p className="text-sm font-medium">{vehicle.brand}</p>
            <p className="text-xs text-muted-foreground">{vehicle.model} ({vehicle.year})</p>
          </div>
        )
      },
    },
    {
      accessorKey: "capacity",
      header: "Capacity",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-1">
            <Icon name="Users" size={14} className="text-muted-foreground" />
            <span className="text-sm">{row.original.capacity}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "current_odometer",
      header: "Odometer",
      cell: ({ row }) => {
        return <span className="text-sm">{row.original.current_odometer.toLocaleString()} km</span>
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
        const vehicle = row.original
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
                <Link href={`/admin-ops/vehicle/fleet/${vehicle.id}`}>
                  <Icon name="Eye" size={16} className="mr-2" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin-ops/vehicle/fleet/${vehicle.id}/edit`}>
                  <Icon name="Edit" size={16} className="mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Icon name="Wrench" size={16} className="mr-2" />
                Schedule Maintenance
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
