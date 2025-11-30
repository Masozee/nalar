"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { GrantMilestone } from "@/lib/api/research"

function formatDate(date: string | null | undefined): string {
  if (!date) return "-"
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "bg-gray-100 text-gray-800 border-gray-200",
    in_progress: "bg-blue-100 text-blue-800 border-blue-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    delayed: "bg-red-100 text-red-800 border-red-200",
  }
  return colors[status] || "bg-gray-100 text-gray-800"
}

export const milestoneColumns: ColumnDef<GrantMilestone>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Milestone
        <Icon
          name={column.getIsSorted() === "asc" ? "ChevronUp" : "ChevronDown"}
          size={16}
          className="ml-2"
        />
      </Button>
    ),
    cell: ({ row }) => {
      const milestone = row.original
      return (
        <div className="min-w-0 max-w-md">
          <div className="font-medium">{milestone.title}</div>
          {milestone.description && (
            <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {milestone.description}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const milestone = row.original
      return (
        <Badge variant="outline" className={getStatusColor(milestone.status)}>
          {milestone.status_display}
        </Badge>
      )
    },
  },
  {
    accessorKey: "due_date",
    header: "Due Date",
    cell: ({ row }) => formatDate(row.original.due_date),
  },
  {
    accessorKey: "completed_date",
    header: "Completed",
    cell: ({ row }) => formatDate(row.original.completed_date),
  },
]
