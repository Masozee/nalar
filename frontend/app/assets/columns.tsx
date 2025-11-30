"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { AssetListItem, AssetStatus, AssetCategory } from "@/lib/api/assets"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DataTableColumnHeader } from "@/components/ui/data-table"

const categoryLabels: Record<AssetCategory, string> = {
  it_equipment: "IT Equipment",
  furniture: "Furniture",
  vehicle: "Vehicle",
  office_equipment: "Office Equipment",
  building: "Building",
  land: "Land",
  other: "Other",
}

const statusLabels: Record<AssetStatus, string> = {
  active: "Active",
  maintenance: "Maintenance",
  repair: "Repair",
  retired: "Retired",
  lost: "Lost",
  damaged: "Damaged",
}

const getInitials = (name?: string) => {
  if (!name) return "??"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

const formatCurrency = (value?: number) => {
  if (!value) return "-"
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value)
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const getStatusBadge = (status: AssetStatus) => {
  const config: Record<AssetStatus, string> = {
    active: "bg-green-500",
    maintenance: "bg-yellow-500",
    repair: "bg-orange-500",
    retired: "bg-gray-500",
    lost: "bg-red-500",
    damaged: "bg-red-600",
  }

  return <Badge className={config[status]}>{statusLabels[status]}</Badge>
}

export const assetColumns: ColumnDef<AssetListItem>[] = [
  {
    accessorKey: "asset_code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Asset" />
    ),
    cell: ({ row }) => {
      const asset = row.original
      return (
        <div className="min-w-0">
          <Link
            href={`/assets/${asset.id}`}
            className="font-medium hover:underline block"
          >
            {asset.asset_code}
          </Link>
          <div className="text-sm text-muted-foreground truncate">
            {asset.name}
          </div>
        </div>
      )
    },
    size: 200,
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => (
      <span className="text-sm">{categoryLabels[row.getValue("category") as keyof typeof categoryLabels]}</span>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    size: 120,
  },
  {
    id: "brand_model",
    header: "Brand / Model",
    cell: ({ row }) => {
      const asset = row.original
      if (asset.brand && asset.model) {
        return (
          <div className="text-sm">
            <div className="font-medium">{asset.brand}</div>
            <div className="text-muted-foreground">{asset.model}</div>
          </div>
        )
      }
      return <span className="text-sm text-muted-foreground">-</span>
    },
    size: 150,
  },
  {
    id: "location",
    header: "Location",
    cell: ({ row }) => {
      const asset = row.original
      return (
        <span className="text-sm truncate">
          {asset.location || asset.department || "-"}
        </span>
      )
    },
    size: 120,
  },
  {
    id: "current_holder",
    header: "Current Holder",
    cell: ({ row }) => {
      const asset = row.original
      if (asset.current_holder) {
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {getInitials(asset.current_holder.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">
                {asset.current_holder.full_name ||
                  asset.current_holder.email}
              </div>
            </div>
          </div>
        )
      }
      return <span className="text-sm text-muted-foreground">Available</span>
    },
    size: 150,
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
    accessorKey: "purchase_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Purchase Date" />
    ),
    cell: ({ row }) => (
      <span className="text-sm">{formatDate(row.getValue("purchase_date"))}</span>
    ),
    size: 120,
  },
  {
    id: "value",
    header: ({ column }) => (
      <div className="text-right">
        <DataTableColumnHeader column={column} title="Value" />
      </div>
    ),
    cell: ({ row }) => {
      const asset = row.original
      return (
        <span className="text-sm font-medium block text-right">
          {formatCurrency(asset.current_value || asset.purchase_price)}
        </span>
      )
    },
    size: 100,
  },
]
