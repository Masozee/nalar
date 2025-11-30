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
import { Driver } from "@/lib/api/admin-ops"

const isLicenseExpiring = (expiryDate: string) => {
  const expiry = new Date(expiryDate)
  const today = new Date()
  const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return daysUntilExpiry <= 30 && daysUntilExpiry >= 0
}

const isLicenseExpired = (expiryDate: string) => {
  return new Date(expiryDate) < new Date()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function createDriversColumns(): ColumnDef<Driver>[] {
  return [
    {
      accessorKey: "user_name",
      header: "Name",
      cell: ({ row }) => {
        const driver = row.original
        return (
          <div className="font-medium">
            {driver.user_name || `User ${driver.user}`}
          </div>
        )
      },
    },
    {
      accessorKey: "license_number",
      header: "License Number",
      cell: ({ row }) => {
        return (
          <code className="text-xs font-mono">
            {row.original.license_number}
          </code>
        )
      },
    },
    {
      accessorKey: "license_type",
      header: "License Type",
      cell: ({ row }) => {
        return (
          <Badge variant="outline">
            {row.original.license_type}
          </Badge>
        )
      },
    },
    {
      accessorKey: "license_expiry",
      header: "License Expiry",
      cell: ({ row }) => {
        const driver = row.original
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm">{formatDate(driver.license_expiry)}</span>
            {isLicenseExpired(driver.license_expiry) && (
              <Badge variant="destructive" className="text-xs">Expired</Badge>
            )}
            {isLicenseExpiring(driver.license_expiry) && !isLicenseExpired(driver.license_expiry) && (
              <Badge variant="secondary" className="text-xs bg-orange-500">Expiring</Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-1">
            <Icon name="Phone" size={12} className="text-muted-foreground" />
            <span className="text-sm">{row.original.phone}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => {
        const driver = row.original
        return (
          <Badge variant={driver.is_active ? "default" : "secondary"}>
            {driver.is_active ? "Active" : "Inactive"}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const driver = row.original
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
                onClick={() => window.location.href = `/admin-ops/vehicle/drivers/${driver.id}`}
              >
                <Icon name="Eye" size={16} className="mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => window.location.href = `/admin-ops/vehicle/drivers/${driver.id}/edit`}
              >
                <Icon name="Edit" size={16} className="mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Icon name="CreditCard" size={16} className="mr-2" />
                Renew License
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
