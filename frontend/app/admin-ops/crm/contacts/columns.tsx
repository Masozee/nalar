"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Contact, AccessLevel } from "@/lib/api/crm"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

const accessLevelColors: Record<AccessLevel, string> = {
  public: "bg-gray-100 text-gray-800 border-gray-300",
  internal: "bg-blue-100 text-blue-800 border-blue-300",
  restricted: "bg-yellow-100 text-yellow-800 border-yellow-300",
  vip: "bg-purple-100 text-purple-800 border-purple-300",
  vvip: "bg-red-100 text-red-800 border-red-300",
}

const accessLevelLabels: Record<AccessLevel, string> = {
  public: "Public",
  internal: "Internal",
  restricted: "Restricted",
  vip: "VIP",
  vvip: "VVIP",
}

export function createContactColumns(): ColumnDef<Contact>[] {
  return [
    {
      accessorKey: "full_name",
      header: "Name",
      cell: ({ row }) => {
        const contact = row.original
        return (
          <div className="flex items-center gap-2">
            {contact.photo_url && (
              <img
                src={contact.photo_url}
                alt={contact.full_name}
                className="w-8 h-8 rounded-full object-cover border"
              />
            )}
            <div className="flex flex-col">
              <Link
                href={`/admin-ops/crm/contacts/${contact.id}`}
                className="font-medium hover:underline"
              >
                {contact.full_name || `${contact.first_name} ${contact.last_name}`}
              </Link>
              {contact.primary_position && (
                <span className="text-xs text-muted-foreground">
                  {contact.primary_position.title}
                </span>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "primary_position",
      header: "Organization",
      cell: ({ row }) => {
        const position = row.original.primary_position
        if (!position) return <span className="text-muted-foreground">—</span>
        return (
          <Link
            href={`/admin-ops/crm/organizations/${position.organization_id}`}
            className="text-sm hover:underline"
          >
            {position.organization}
          </Link>
        )
      },
    },
    {
      accessorKey: "email_primary",
      header: "Email",
      cell: ({ row }) => {
        const email = row.original.email_primary
        if (!email) return <span className="text-muted-foreground">—</span>
        return (
          <a
            href={`mailto:${email}`}
            className="text-sm text-blue-600 hover:underline"
          >
            {email}
          </a>
        )
      },
    },
    {
      accessorKey: "phone_mobile",
      header: "Phone",
      cell: ({ row }) => {
        const phone = row.original.phone_mobile || row.original.phone_primary
        if (!phone) return <span className="text-muted-foreground">—</span>
        return <span className="text-sm">{phone}</span>
      },
    },
    {
      accessorKey: "access_level",
      header: "Access",
      cell: ({ row }) => {
        const level = row.original.access_level
        return (
          <Badge variant="outline" className={accessLevelColors[level]}>
            {accessLevelLabels[level]}
          </Badge>
        )
      },
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }) => {
        const tags = row.original.tags
        if (!tags || tags.length === 0) {
          return <span className="text-muted-foreground">—</span>
        }
        return (
          <div className="flex gap-1 flex-wrap max-w-[200px]">
            {tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{tags.length - 2}
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "assigned_to_name",
      header: "Assigned To",
      cell: ({ row }) => {
        const assigned = row.original.assigned_to_name
        if (!assigned) return <span className="text-muted-foreground">—</span>
        return <span className="text-sm">{assigned}</span>
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const contact = row.original
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
                <Link href={`/admin-ops/crm/contacts/${contact.id}`} className="cursor-pointer">
                  <Icon name="View" size={16} className="mr-2" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin-ops/crm/contacts/${contact.id}/edit`} className="cursor-pointer">
                  <Icon name="Edit" size={16} className="mr-2" />
                  Edit Contact
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href={`mailto:${contact.email_primary}`} className="cursor-pointer">
                  <Icon name="Mail" size={16} className="mr-2" />
                  Send Email
                </a>
              </DropdownMenuItem>
              {contact.phone_mobile && (
                <DropdownMenuItem asChild>
                  <a href={`tel:${contact.phone_mobile}`} className="cursor-pointer">
                    <Icon name="Phone" size={16} className="mr-2" />
                    Call
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 cursor-pointer">
                <Icon name="Delete" size={16} className="mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
