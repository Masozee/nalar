"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { VendorListItem, VendorStatus, VendorCategory } from "@/lib/api/procurement"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { DataTableColumnHeader } from "@/components/ui/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const statusLabels: Record<VendorStatus, string> = {
  active: 'Aktif',
  inactive: 'Tidak Aktif',
  blacklisted: 'Blacklist',
  pending: 'Menunggu Verifikasi',
}

const categoryLabels: Record<VendorCategory, string> = {
  goods: 'Barang',
  services: 'Jasa',
  both: 'Barang & Jasa',
}

const getStatusColor = (status: VendorStatus): string => {
  const config: Record<VendorStatus, string> = {
    active: "bg-green-500",
    inactive: "bg-gray-500",
    blacklisted: "bg-red-500",
    pending: "bg-yellow-500",
  }
  return config[status]
}

const renderRating = (rating: number) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Icon
          key={i}
          name="Star"
          size={12}
          className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
        />
      ))}
    </div>
  )
}

export const vendorColumns: ColumnDef<VendorListItem>[] = [
  {
    accessorKey: "code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Code" />
    ),
    cell: ({ row }) => {
      const vendor = row.original
      return (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(vendor.status)}`} />
          <Link
            href={`/procurement/vendors/${vendor.id}`}
            className="font-medium hover:underline"
          >
            {vendor.code}
          </Link>
        </div>
      )
    },
    size: 120,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("name")}</span>
    ),
    size: 250,
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      const category = row.getValue("category") as VendorCategory
      return <span className="text-sm">{categoryLabels[category]}</span>
    },
    size: 120,
  },
  {
    accessorKey: "contact_person",
    header: "Contact Person",
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("contact_person")}</span>
    ),
    size: 150,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-sm">
        <Icon name="Phone" size={12} className="text-muted-foreground" />
        {row.getValue("phone")}
      </div>
    ),
    size: 180,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-sm">
        <Icon name="Mail" size={12} className="text-muted-foreground" />
        {row.getValue("email")}
      </div>
    ),
    size: 200,
  },
  {
    accessorKey: "city",
    header: "City",
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-sm">
        <Icon name="MapPin" size={12} className="text-muted-foreground" />
        {row.getValue("city")}
      </div>
    ),
    size: 150,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const vendor = row.original
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
              <Link href={`/procurement/vendors/${vendor.id}`}>
                <Icon name="Eye" size={16} className="mr-2" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/procurement/vendors/${vendor.id}/edit`}>
                <Icon name="Edit" size={16} className="mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Icon name="Mail" size={16} className="mr-2" />
              Send Email
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icon name="Phone" size={16} className="mr-2" />
              Call
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Icon name="Trash" size={16} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    size: 80,
  },
]
