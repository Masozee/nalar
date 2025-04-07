"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { FileText, Search, PlusCircle, BarChartHorizontal } from "lucide-react"; // Added icons

// Interfaces for data structures
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

interface PublicationListProps {
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

export function PublicationList({ publications, stats }: PublicationListProps) {
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

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Publications
          </CardTitle>
          <CardDescription>
            Manage and view performance of publications.
          </CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
           <Button>
             <PlusCircle className="mr-2 h-4 w-4" /> Add New
           </Button>
           <Button variant="outline" disabled> {/* Placeholder for traffic view link */} 
             <BarChartHorizontal className="mr-2 h-4 w-4" /> View Traffic
           </Button>
         </div>
      </CardHeader>
      <CardContent>
        {/* Filter Section */}
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
            onValueChange={(value) => setStatusFilter(value ?? "all")}
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

        {/* Table Section */}
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
                {/* <TableHead>Actions</TableHead> */} 
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPublications.length > 0 ? (
                filteredPublications.map((pub) => {
                  const stat = publicationStatsMap.get(pub.id);
                  return (
                    <TableRow key={pub.id}>
                      <TableCell className="font-medium">{pub.title}</TableCell>
                      <TableCell>{pub.authors.join(", ")}</TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant[pub.status] ?? "outline"}>
                          {pub.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(pub.publishDate)}</TableCell>
                      <TableCell className="text-center">{stat ? stat.views.toLocaleString('en-US') : '-'}</TableCell>
                      <TableCell className="text-center">{stat ? stat.downloads.toLocaleString('en-US') : '-'}</TableCell>
                       {/* Add actions like Edit/Delete later */}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No publications found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {/* Add Pagination later if needed */}
      </CardContent>
    </Card>
  );
} 