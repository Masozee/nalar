"use client";

import React, { useState, useMemo } from "react";
// Removed Card imports, they are now in the page component
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Input
} from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Badge
} from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react"; // Removed other icons, kept Search
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from 'next/link';

// Interfaces remain the same
interface Publication {
  id: string;
  title: string;
  authors: string[];
  publishDate: string;
  status: string;
  abstract: string;
}
interface PublicationStat {
  id: string;
  views: number;
  downloads: number;
  viewsChange: string;
  downloadsChange: string;
}

// RENAME props interface
interface PublicationTableProps {
  publications: Publication[];
  stats: PublicationStat[];
}

// Helper to format date
const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    return "Invalid Date";
  }
};

// Status badge mapping
const statusBadgeVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Published: "default",
  Draft: "secondary",
  Archived: "outline",
};

// RENAME component
export function PublicationTable({ publications, stats }: PublicationTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const publicationStatsMap = useMemo(() => {
    const map = new Map<string, PublicationStat>();
    stats.forEach(stat => map.set(stat.id, stat));
    return map;
  }, [stats]);

  const filteredPublications = useMemo(() => {
    return publications.filter((pub) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        pub.title.toLowerCase().includes(searchLower) ||
        pub.authors.some(author => author.toLowerCase().includes(searchLower)) ||
        pub.abstract.toLowerCase().includes(searchLower);

      const matchesStatus = statusFilter === "all" || pub.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [publications, searchTerm, statusFilter]);

  const allStatuses = useMemo(() => {
    return ["all", ...new Set(publications.map(p => p.status))];
  }, [publications]);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  return (
    // REMOVED outer Card and CardHeader
    <div> {/* Using a simple div wrapper */} 
      {/* Filter Section - Kept as is */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search title, author, abstract..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 sm:w-full md:w-[300px] lg:w-[400px]"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            {allStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status === "all" ? "All Statuses" : status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table Section - Kept as is */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Authors</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-center">Views</TableHead>
              <TableHead className="text-center">Downloads</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPublications.length > 0 ? (
              filteredPublications.map((pub) => {
                const stat = publicationStatsMap.get(pub.id);
                return (
                  <TableRow key={pub.id}>
                     <TableCell className="font-medium">
                       <Link href={`/admin/publications/${pub.id}`} className="hover:underline">
                         {pub.title}
                       </Link>
                     </TableCell>
                     <TableCell>{pub.authors.join(", ")}</TableCell>
                     <TableCell>
                       <Badge variant={statusBadgeVariant[pub.status] ?? "outline"}>
                         {pub.status}
                       </Badge>
                     </TableCell>
                     <TableCell>{formatDate(pub.publishDate)}</TableCell>
                     <TableCell className="text-center">{stat ? stat.views.toLocaleString('en-US') : '-'}</TableCell>
                     <TableCell className="text-center">{stat ? stat.downloads.toLocaleString('en-US') : '-'}</TableCell>
                     <TableCell>
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <Button variant="ghost" className="h-8 w-8 p-0">
                             <span className="sr-only">Open menu</span>
                             <MoreHorizontal className="h-4 w-4" />
                           </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end">
                           <DropdownMenuLabel>Actions</DropdownMenuLabel>
                           <DropdownMenuItem asChild>
                             <Link href={`/admin/publications/${pub.id}`}>View Details</Link>
                           </DropdownMenuItem>
                           <DropdownMenuItem>Edit</DropdownMenuItem>
                           <DropdownMenuSeparator />
                           <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                         </DropdownMenuContent>
                       </DropdownMenu>
                     </TableCell>
                   </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No publications found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Removed CardContent wrapper */} 
    </div>
  );
} 