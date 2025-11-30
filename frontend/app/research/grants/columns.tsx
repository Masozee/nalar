"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Grant } from "@/lib/api/research"

function getGrantStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800 border-gray-200",
    submitted: "bg-blue-100 text-blue-800 border-blue-200",
    under_review: "bg-yellow-100 text-yellow-800 border-yellow-200",
    approved: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    active: "bg-indigo-100 text-indigo-800 border-indigo-200",
    completed: "bg-purple-100 text-purple-800 border-purple-200",
    cancelled: "bg-gray-100 text-gray-800 border-gray-200",
  }
  return colors[status] || "bg-gray-100 text-gray-800"
}

function formatCurrency(amount: string | number, currency: string = "IDR"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  if (currency === "IDR") {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num)
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(num)
}

export const grantColumns: ColumnDef<Grant>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 h-auto font-semibold"
        >
          Grant
          <Icon
            name={column.getIsSorted() === "asc" ? "ChevronUp" : "ChevronDown"}
            size={16}
            className="ml-2"
          />
        </Button>
      )
    },
    cell: ({ row }) => {
      const grant = row.original
      return (
        <div className="min-w-0 max-w-md">
          <Link
            href={`/research/grants/${grant.grant_number}`}
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm"
          >
            {grant.grant_number}
          </Link>
          <div className="font-medium line-clamp-2 mt-1">{grant.title}</div>
          <div className="text-xs mt-1">
            <Badge variant="outline" className={getGrantStatusColor(grant.status)}>
              {grant.status_display}
            </Badge>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "pi_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 h-auto font-semibold"
        >
          Principal Investigator
          <Icon
            name={column.getIsSorted() === "asc" ? "ChevronUp" : "ChevronDown"}
            size={16}
            className="ml-2"
          />
        </Button>
      )
    },
    cell: ({ row }) => {
      const grant = row.original
      return (
        <div className="min-w-0">
          <div className="font-medium">{grant.pi_name}</div>
          {grant.team_count !== undefined && grant.team_count > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              +{grant.team_count} team members
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "grant_type_display",
    header: "Type",
    cell: ({ row }) => {
      return (
        <div className="min-w-0">
          <div className="text-sm">{row.original.grant_type_display}</div>
          <div className="text-xs text-muted-foreground">{row.original.funding_source_display}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "approved_amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 h-auto font-semibold"
        >
          Budget
          <Icon
            name={column.getIsSorted() === "asc" ? "ChevronUp" : "ChevronDown"}
            size={16}
            className="ml-2"
          />
        </Button>
      )
    },
    cell: ({ row }) => {
      const grant = row.original
      const approved = parseFloat(grant.approved_amount)
      const disbursed = parseFloat(grant.disbursed_amount)
      const percentage = approved > 0 ? (disbursed / approved) * 100 : 0

      return (
        <div className="min-w-0">
          <div className="font-medium">{formatCurrency(approved, grant.currency)}</div>
          <div className="text-xs text-muted-foreground">
            {formatCurrency(disbursed, grant.currency)} disbursed ({percentage.toFixed(0)}%)
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "start_date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 h-auto font-semibold"
        >
          Duration
          <Icon
            name={column.getIsSorted() === "asc" ? "ChevronUp" : "ChevronDown"}
            size={16}
            className="ml-2"
          />
        </Button>
      )
    },
    cell: ({ row }) => {
      const grant = row.original
      if (!grant.start_date) return <span className="text-muted-foreground">-</span>

      return (
        <div className="min-w-0">
          <div className="text-sm">
            {new Date(grant.start_date).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
          {grant.end_date && (
            <div className="text-xs text-muted-foreground">
              to {new Date(grant.end_date).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
          )}
          {grant.duration_months && (
            <div className="text-xs text-muted-foreground">
              ({grant.duration_months} months)
            </div>
          )}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const grant = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 border">
              <span className="sr-only">Open menu</span>
              <Icon name="MoreHorizontal" size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/research/grants/${grant.grant_number}`}>
                <Icon name="Eye" size={16} className="mr-2" />
                View Details
              </Link>
            </DropdownMenuItem>
            {grant.status === "draft" && (
              <DropdownMenuItem>
                <Icon name="Send" size={16} className="mr-2" />
                Submit
              </DropdownMenuItem>
            )}
            {(grant.status === "draft" || grant.status === "submitted") && (
              <DropdownMenuItem>
                <Icon name="Edit" size={16} className="mr-2" />
                Edit
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
