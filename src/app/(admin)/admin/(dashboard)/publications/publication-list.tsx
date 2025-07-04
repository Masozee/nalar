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
  file?: string | null;
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
  const [selected, setSelected] = useState<string[]>([]);

  const allSelected = selected.length > 0 && selected.length === publications.length;
  const toggleSelectAll = () => {
    setSelected(allSelected ? [] : publications.map((p) => p.id));
  };
  const toggleSelect = (id: string) => {
    setSelected((sel) => sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]);
  };
  const handleBulkDelete = () => {
    // Simulate delete
    setSelected([]);
    alert(`Deleted ${selected.length} publication(s) (simulated)`);
  };

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

        {/* Bulk Actions Bar */}
        {selected.length > 0 && (
          <div className="flex items-center gap-4 mb-2 bg-blue-50 border border-blue-200 rounded-xl px-6 py-2">
            <span className="font-medium text-blue-800">{selected.length} selected</span>
            <Button size="sm" variant="destructive" onClick={handleBulkDelete} className="rounded-full px-4 py-1 text-xs">Delete Selected</Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected([])} className="rounded-full px-4 py-1 text-xs">Clear</Button>
          </div>
        )}
        {/* Table Section */}
        <div className="rounded-2xl border overflow-x-auto px-2 md:px-6 pb-2 bg-white">
          <Table className="rounded-2xl overflow-hidden">
            <TableHeader>
              <TableRow className="rounded-t-2xl">
                <TableHead className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur font-semibold text-gray-700 text-sm py-3 rounded-tl-2xl px-4">
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="accent-blue-500 rounded" aria-label="Select all" />
                </TableHead>
                <TableHead className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur font-semibold text-gray-700 text-sm py-3 px-4">Title</TableHead>
                <TableHead className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur font-semibold text-gray-700 text-sm py-3 px-4">Authors</TableHead>
                <TableHead className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur font-semibold text-gray-700 text-sm py-3 px-4">Status</TableHead>
                <TableHead className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur font-semibold text-gray-700 text-sm py-3 px-4">Published</TableHead>
                <TableHead className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur font-semibold text-gray-700 text-sm py-3 text-center px-4">Views</TableHead>
                <TableHead className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur font-semibold text-gray-700 text-sm py-3 text-center px-4">Downloads</TableHead>
                <TableHead className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur font-semibold text-gray-700 text-sm py-3 text-center rounded-tr-2xl px-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPublications.length > 0 ? (
                filteredPublications.map((pub) => {
                  const stat = publicationStatsMap.get(pub.id);
                  return (
                    <TableRow key={pub.id} className="hover:bg-blue-50/40 transition group rounded-xl">
                      <TableCell className="align-top py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selected.includes(pub.id)}
                          onChange={() => toggleSelect(pub.id)}
                          className="accent-blue-500 rounded"
                          aria-label={`Select publication ${pub.title}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium max-w-xs align-top py-3 px-4">
                        <div className="text-base font-semibold text-gray-900 leading-snug break-words whitespace-normal">
                          {pub.title}
                        </div>
                      </TableCell>
                      <TableCell className="align-top py-3">
                        <div className="flex flex-wrap gap-2 items-center">
                          {pub.authors.map((author, idx) => (
                            <span key={author} className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-0.5 text-xs font-medium text-gray-700">
                              {/* Replace with avatar if available in future */}
                              <span className="inline-block w-5 h-5 rounded-full bg-gray-200 mr-1" />
                              {author}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="align-top py-3">
                        <span className="inline-flex items-center gap-1">
                          <span className={`inline-block w-2 h-2 rounded-full ${pub.status === 'Published' ? 'bg-green-500' : pub.status === 'Draft' ? 'bg-yellow-400' : 'bg-gray-400'}`}></span>
                          <Badge variant={statusBadgeVariant[pub.status] ?? 'outline'} className="capitalize px-2 py-0.5 text-xs">
                            {pub.status}
                          </Badge>
                        </span>
                      </TableCell>
                      <TableCell className="align-top py-3">
                        <span className="text-xs text-gray-500">{formatDate(pub.publishDate)}</span>
                      </TableCell>
                      <TableCell className="text-center align-top py-3">
                        <span className="font-mono text-sm">{stat ? stat.views.toLocaleString('en-US') : '-'}</span>
                      </TableCell>
                      <TableCell className="text-center align-top py-3">
                        <span className="font-mono text-sm">{stat ? stat.downloads.toLocaleString('en-US') : '-'}</span>
                      </TableCell>
                      <TableCell className="text-center align-top py-3">
                        <div className="flex justify-center gap-2">
                          {pub.file && (
                            <a href={pub.file} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800" title="Download">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                              </svg>
                            </a>
                          )}
                          <a href={`/admin/publications/${pub.id}`} className="text-primary hover:underline text-xs font-medium px-2 py-1 rounded-full bg-primary/10 hover:bg-primary/20 transition">
                            Manage
                          </a>
                        </div>
                      </TableCell>
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
        {/* Summary Row */}
        <div className="flex justify-end items-center gap-8 mt-2 text-xs text-gray-600">
          <span>Total Views: <span className="font-semibold">{filteredPublications.reduce((sum, pub) => (publicationStatsMap.get(pub.id)?.views ?? 0) + sum, 0).toLocaleString()}</span></span>
          <span>Total Downloads: <span className="font-semibold">{filteredPublications.reduce((sum, pub) => (publicationStatsMap.get(pub.id)?.downloads ?? 0) + sum, 0).toLocaleString()}</span></span>
        </div>
        {/* Add Pagination later if needed */}
      </CardContent>
    </Card>
  );
}