"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Organization, OrganizationType } from "@/lib/api/crm"
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

const orgTypeLabels: Record<OrganizationType, string> = {
  government: "Government",
  corporate: "Corporate",
  ngo: "NGO/Non-Profit",
  education: "Education",
  media: "Media",
  partner: "Partner",
  vendor: "Vendor",
  donor: "Donor",
  other: "Other",
}

const orgTypeColors: Record<OrganizationType, string> = {
  government: "bg-blue-100 text-blue-800 border-blue-300",
  corporate: "bg-purple-100 text-purple-800 border-purple-300",
  ngo: "bg-green-100 text-green-800 border-green-300",
  education: "bg-indigo-100 text-indigo-800 border-indigo-300",
  media: "bg-orange-100 text-orange-800 border-orange-300",
  partner: "bg-teal-100 text-teal-800 border-teal-300",
  vendor: "bg-yellow-100 text-yellow-800 border-yellow-300",
  donor: "bg-pink-100 text-pink-800 border-pink-300",
  other: "bg-gray-100 text-gray-800 border-gray-300",
}

export function createOrganizationColumns(): ColumnDef<Organization>[] {
  return [
    {
      accessorKey: "name",
      header: "Organization",
      cell: ({ row }) => {
        const org = row.original
        return (
          <div className="flex items-center gap-3">
            {org.logo ? (
              <img
                src={org.logo}
                alt={org.name}
                className="w-10 h-10 rounded object-contain border"
              />
            ) : (
              <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center border">
                <Icon name="Building" size={20} className="text-primary" />
              </div>
            )}
            <div className="flex flex-col">
              <Link
                href={`/admin-ops/crm/organizations/${org.id}`}
                className="font-medium hover:underline"
              >
                {org.name}
              </Link>
              {org.industry && (
                <span className="text-xs text-muted-foreground">
                  {org.industry}
                </span>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "organization_type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.organization_type
        return (
          <Badge variant="outline" className={orgTypeColors[type]}>
            {orgTypeLabels[type]}
          </Badge>
        )
      },
    },
    {
      accessorKey: "city",
      header: "Location",
      cell: ({ row }) => {
        const org = row.original
        if (!org.city && !org.country) return <span className="text-muted-foreground">—</span>
        return (
          <span className="text-sm">
            {org.city}{org.city && org.country ? ', ' : ''}{org.country}
          </span>
        )
      },
    },
    {
      accessorKey: "website",
      header: "Website",
      cell: ({ row }) => {
        const website = row.original.website
        if (!website) return <span className="text-muted-foreground">—</span>
        return (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
          >
            <Icon name="Globe" size={14} />
            <span>{website.replace(/^https?:\/\//, '').split('/')[0]}</span>
          </a>
        )
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        const email = row.original.email
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
      accessorKey: "contact_count",
      header: "Contacts",
      cell: ({ row }) => {
        const count = row.original.contact_count
        if (count === undefined) return <span className="text-muted-foreground">—</span>
        return (
          <div className="flex items-center gap-1 text-sm">
            <Icon name="Users" size={14} className="text-muted-foreground" />
            <span>{count}</span>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const org = row.original
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
                <Link href={`/admin-ops/crm/organizations/${org.id}`} className="cursor-pointer">
                  <Icon name="View" size={16} className="mr-2" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin-ops/crm/organizations/${org.id}/edit`} className="cursor-pointer">
                  <Icon name="Edit" size={16} className="mr-2" />
                  Edit Organization
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {org.email && (
                <DropdownMenuItem asChild>
                  <a href={`mailto:${org.email}`} className="cursor-pointer">
                    <Icon name="Mail" size={16} className="mr-2" />
                    Send Email
                  </a>
                </DropdownMenuItem>
              )}
              {org.website && (
                <DropdownMenuItem asChild>
                  <a href={org.website} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                    <Icon name="Globe" size={16} className="mr-2" />
                    Visit Website
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
