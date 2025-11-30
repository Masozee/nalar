"use client"

import { ColumnDef } from "@tanstack/react-table"
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
import { VehicleMaintenance } from "@/lib/api/admin-ops"

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function createMaintenanceColumns(): ColumnDef<VehicleMaintenance>[] {
  return [
    {
      accessorKey: "vehicle_name",
      header: "Vehicle",
      cell: ({ row }) => {
        const maintenance = row.original
        return (
          <div className="font-medium">
            {maintenance.vehicle_name || (typeof maintenance.vehicle === 'string' ? maintenance.vehicle : maintenance.vehicle.plate_number)}
          </div>
        )
      },
    },
    {
      accessorKey: "maintenance_type",
      header: "Type",
      cell: ({ row }) => {
        return (
          <Badge variant="outline">
            {row.original.maintenance_type}
          </Badge>
        )
      },
    },
    {
      accessorKey: "service_date",
      header: "Service Date",
      cell: ({ row }) => {
        return (
          <span className="text-sm">
            {formatDate(row.original.service_date)}
          </span>
        )
      },
    },
    {
      accessorKey: "odometer_reading",
      header: "Odometer",
      cell: ({ row }) => {
        return (
          <span className="text-sm">
            {row.original.odometer_reading.toLocaleString()} km
          </span>
        )
      },
    },
    {
      accessorKey: "cost",
      header: "Cost",
      cell: ({ row }) => {
        return (
          <span className="text-sm font-medium">
            {formatCurrency(Number(row.original.cost))}
          </span>
        )
      },
    },
    {
      accessorKey: "vendor",
      header: "Vendor",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-1">
            <Icon name="Building" size={12} className="text-muted-foreground" />
            <span className="text-sm">{row.original.vendor || 'N/A'}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        return (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {row.original.description}
          </p>
        )
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const maintenance = row.original
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
              <DropdownMenuItem
                onClick={() => window.location.href = `/admin-ops/vehicle/maintenance/${maintenance.id}`}
              >
                <Icon name="Eye" size={16} className="mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => window.location.href = `/admin-ops/vehicle/maintenance/${maintenance.id}/edit`}
              >
                <Icon name="Edit" size={16} className="mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Icon name="FileText" size={16} className="mr-2" />
                Download Invoice
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
