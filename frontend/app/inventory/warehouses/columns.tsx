"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { DataTableColumnHeader } from "@/components/ui/data-table"

export type Warehouse = {
  id: string
  code: string
  name: string
  address: string | null
  phone: string | null
  manager: string | null
  manager_name: string | null
  is_active: boolean
  is_default: boolean
  created_at: string
  updated_at: string
}

export const warehouseColumns: ColumnDef<Warehouse>[] = [
  {
    accessorKey: "code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Code" />
    ),
    cell: ({ row }) => (
      <Link
        href={`/inventory/warehouses/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.getValue("code")}
      </Link>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const warehouse = row.original
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{row.getValue("name")}</span>
          {warehouse.is_default && (
            <Badge className="bg-blue-500 text-xs">Default</Badge>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => {
      const address = row.getValue("address") as string | null
      return address ? (
        <div className="flex items-start gap-1">
          <Icon name="MapPin" size={12} className="text-muted-foreground mt-0.5" />
          <span className="text-sm">{address}</span>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      )
    },
  },
  {
    accessorKey: "manager_name",
    header: "Manager",
    cell: ({ row }) => {
      const managerName = row.getValue("manager_name") as string | null
      return managerName ? (
        <div className="flex items-center gap-1">
          <Icon name="User" size={12} className="text-muted-foreground" />
          <span className="text-sm">{managerName}</span>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      )
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string | null
      return <span className="text-sm">{phone || '-'}</span>
    },
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active") as boolean
      return isActive ? (
        <Badge className="bg-green-500 text-xs">Active</Badge>
      ) : (
        <Badge variant="secondary" className="text-xs">Inactive</Badge>
      )
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const warehouse = row.original
      return (
        <div className="text-right">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/inventory/warehouses/${warehouse.id}`}>View</Link>
          </Button>
        </div>
      )
    },
  },
]
