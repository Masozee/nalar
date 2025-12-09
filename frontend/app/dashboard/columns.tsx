
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/data-table"
import { format } from "date-fns"

export type RecentPublication = {
    id: string
    title: string
    publication_type: string
    publication_date: string
    journal_name: string
    indexation: string
    citation_count: number
}

export const columns: ColumnDef<RecentPublication>[] = [
    {
        accessorKey: "title",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Title" />
        ),
        cell: ({ row }) => (
            <div className="max-w-xs truncate" title={row.getValue("title")}>
                {row.getValue("title")}
            </div>
        ),
    },
    {
        accessorKey: "publication_type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue("publication_type") as string
            return <div className="text-muted-foreground capitalize">{type.replace(/_/g, " ")}</div>
        },
    },
    {
        accessorKey: "journal_name",
        header: "Journal",
        cell: ({ row }) => (
            <div className="text-muted-foreground">
                {row.getValue("journal_name") || "-"}
            </div>
        ),
    },
    {
        accessorKey: "publication_date",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Date" />
        ),
        cell: ({ row }) => {
            const date = row.getValue("publication_date") as string
            return (
                <div className="text-muted-foreground">
                    {date ? format(new Date(date), "MMM d, yyyy") : "-"}
                </div>
            )
        },
    },
    {
        accessorKey: "indexation",
        header: "Indexation",
        cell: ({ row }) => {
            const indexation = row.getValue("indexation") as string
            return (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary capitalize">
                    {indexation.replace(/_/g, " ")}
                </span>
            )
        }
    },
    {
        accessorKey: "citation_count",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Citations" className="justify-end" />
        ),
        cell: ({ row }) => (
            <div className="text-right font-medium">
                {row.getValue("citation_count")}
            </div>
        ),
    },
]
