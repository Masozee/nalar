"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import { DataTableColumnHeader } from "@/components/ui/data-table"

export type ShortenedURL = {
  id: string
  original_url: string
  short_code: string
  short_url: string
  title: string
  click_count: number
  last_clicked_at: string | null
  expires_at: string | null
  is_expired: boolean
  is_active: boolean
  created_at: string
}

const truncateUrl = (url: string, maxLength = 50) => {
  if (url.length <= maxLength) return url
  return url.substring(0, maxLength) + "..."
}

export const createUrlShortenerColumns = (
  onEdit: (url: ShortenedURL) => void,
  onDelete: (id: string) => void,
  onCopy: (shortCode: string, id: string) => void,
  onDownloadQr: (shortCode: string, title: string) => void,
  copiedId: string | null
): ColumnDef<ShortenedURL>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const title = row.getValue("title") as string
      return (
        <p className="font-medium break-words max-w-[200px]">
          {title || "Untitled"}
        </p>
      )
    },
  },
  {
    accessorKey: "original_url",
    header: "Original URL",
    cell: ({ row }) => {
      const url = row.getValue("original_url") as string
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-foreground hover:underline truncate block max-w-[250px]"
          title={url}
        >
          {truncateUrl(url, 40)}
        </a>
      )
    },
  },
  {
    accessorKey: "short_code",
    header: "Short URL",
    cell: ({ row }) => {
      const shortCode = row.getValue("short_code") as string
      const urlData = row.original
      return (
        <div className="flex items-center gap-2">
          <code className="text-xs bg-muted px-2 py-1 rounded">
            {shortCode}
          </code>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onCopy(shortCode, urlData.id)}
          >
            <Icon
              name="Copy"
              size={14}
              className={
                copiedId === urlData.id
                  ? "text-green-500"
                  : "text-muted-foreground"
              }
            />
          </Button>
        </div>
      )
    },
  },
  {
    accessorKey: "click_count",
    header: ({ column }) => (
      <div className="text-center">
        <DataTableColumnHeader column={column} title="Clicks" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <span className="font-semibold">{row.getValue("click_count")}</span>
      </div>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const urlData = row.original
      if (urlData.is_expired) {
        return <Badge variant="destructive">Expired</Badge>
      }
      if (urlData.is_active) {
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Active
          </Badge>
        )
      }
      return <Badge variant="secondary">Inactive</Badge>
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const urlData = row.original

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Icon name="MoreHorizontal" size={16} />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/tools/url-shortener/${urlData.id}`}>
                  <Icon name="BarChart3" size={16} className="mr-2" />
                  View Analytics
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onCopy(urlData.short_code, urlData.id)}
              >
                <Icon name="Copy" size={16} className="mr-2" />
                Copy Short URL
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDownloadQr(urlData.short_code, urlData.title)}
              >
                <Icon name="QrCode" size={16} className="mr-2" />
                Download QR Code
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => window.open(urlData.original_url, "_blank")}
              >
                <Icon name="ExternalLink" size={16} className="mr-2" />
                Open Original
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(urlData)}>
                <Icon name="Pencil" size={16} className="mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(urlData.id)}
                className="text-destructive"
              >
                <Icon name="Trash2" size={16} className="mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
