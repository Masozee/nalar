"use client";

import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Search, 
  Users, 
  MapPin, 
  CalendarDays,
  ExternalLink,
  PencilLine,
  Trash2,
  Tag,
  SlidersHorizontal,
  CheckSquare,
  Download,
  Copy,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from 'next/link';

import { Event } from "./types";

// Interfaces
interface Speaker {
  name: string;
  affiliation: string;
}

interface EventsTableProps {
  events: Event[];
  selected?: Set<string>;
  onSelect?: (id: string) => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  loading?: boolean;
}


// Helper functions
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const statusBadgeVariant: { [key: string]: "default" | "secondary" | "outline" | "destructive" } = {
  "In-person": "default",
  "Virtual": "secondary",
  "Hybrid": "outline",
  "Cancelled": "destructive",
};

export function EventsTable({ events, selected, onSelect, onSelectAll, onClearSelection, loading }: EventsTableProps) {
  // Table head columns
  const columns = [
    { key: "select", label: "", show: !!onSelect },
    { key: "event", label: "Event" },
    { key: "date", label: "Date" },
    { key: "time", label: "Time" },
    { key: "location", label: "Location" },
    { key: "type", label: "Type" },
    { key: "speakers", label: "Speakers" },
    { key: "actions", label: "", className: "w-[40px] text-xs" }
  ];

  return (
    <div className="w-full font-sans">
      <div className="overflow-auto max-w-full rounded-b-lg">
        <Table className={`events-table min-w-[700px] w-full border-separate border-spacing-y-0.5 ${loading ? "opacity-60 pointer-events-none" : ""}`} aria-busy={loading}>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent">
              {onSelect && (
                <TableHead className="w-8 px-2">
                  <input
                    type="checkbox"
                    aria-label="Select all events"
                    checked={selected && events.length > 0 && events.every(e => selected.has(e.id))}
                    onChange={e => (e.target.checked ? onSelectAll?.() : onClearSelection?.())}
                    disabled={loading}
                    className="accent-primary rounded border-muted-foreground"
                  />
                </TableHead>
              )}
              <TableHead className="font-medium w-[220px] text-xs uppercase tracking-wide">Event</TableHead>
              <TableHead className="font-medium w-[110px] text-xs uppercase tracking-wide">Date</TableHead>
              <TableHead className="font-medium w-[90px] text-xs uppercase tracking-wide">Time</TableHead>
              <TableHead className="font-medium w-[110px] text-xs uppercase tracking-wide">Location</TableHead>
              <TableHead className="font-medium w-[90px] text-xs uppercase tracking-wide">Type</TableHead>
              <TableHead className="font-medium w-[70px] text-xs uppercase tracking-wide">Speakers</TableHead>
              <TableHead className="w-[40px] text-xs"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length > 0 ? (
              events.map((event) => (
                <TableRow
                  key={event.id}
                  className="group hover:bg-accent/30 transition-colors text-sm h-11 border-b border-border/60"
                >
                  {onSelect && (
                    <TableCell className="px-2">
                      <input
                        type="checkbox"
                        aria-label={`Select event ${event.title}`}
                        checked={!!selected?.has(event.id)}
                        onChange={() => onSelect?.(event.id)}
                        disabled={loading}
                        className="accent-primary rounded border-muted-foreground"
                      />
                    </TableCell>
                  )}
                  <TableCell className="py-2">
                    <Link href={`/admin/events/${event.id}`} className="font-medium text-primary hover:underline">
                      {event.title}
                    </Link>
                    <span className="block text-xs text-muted-foreground truncate max-w-[180px] opacity-0 group-hover:opacity-100 transition-opacity">
                      {event.description}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 whitespace-nowrap">{formatDate(event.date)}</TableCell>
                  <TableCell className="py-2 whitespace-nowrap">{event.time}</TableCell>
                  <TableCell className="py-2 truncate max-w-[80px]">{event.location}</TableCell>
                  <TableCell className="py-2">
                    <Badge variant={statusBadgeVariant[event.type] || "secondary"} className="text-xs font-normal">
                      {event.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2 text-center font-medium">{event.speakers.length}</TableCell>
                  <TableCell className="py-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[150px]">
                        <DropdownMenuItem asChild className="cursor-pointer flex items-center gap-2">
                          <Link href={`/admin/events/${event.id}`}>
                            <ExternalLink className="h-4 w-4" /> View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                          <PencilLine className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer text-destructive flex items-center gap-2">
                          <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-20 text-center text-sm text-muted-foreground">
                  No events found. Try adjusting your filters or search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}