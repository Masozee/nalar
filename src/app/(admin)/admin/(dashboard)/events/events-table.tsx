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
import { MoreHorizontal, Search, Users, MapPin, CalendarDays } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from 'next/link';

// Interfaces
interface Speaker {
  name: string;
  affiliation: string;
}

interface Event {
  id: string;
  slug: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: string;
  description: string;
  imageUrl: string;
  speakers: Speaker[];
  registrationLink: string;
}

interface EventsTableProps {
  events: Event[];
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

export function EventsTable({ events }: EventsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | "all">("all");
  const [dateFilter, setDateFilter] = useState<string | "all">("all");

  // Extract all unique event types
  const allTypes = useMemo(() => {
    return ["all", ...new Set(events.map(event => event.type))];
  }, [events]);

  // Extract past/upcoming categories for date filter
  const dateFilterOptions = useMemo(() => {
    return [
      { label: "All Events", value: "all" },
      { label: "Upcoming Events", value: "upcoming" },
      { label: "Past Events", value: "past" },
    ];
  }, []);

  // Filter events based on search term, type and date
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const now = new Date();
      const eventDate = new Date(event.date);
      const isUpcoming = eventDate >= now;
      
      // Check search term
      const matchesSearch = 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.speakers.some(speaker => 
          speaker.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
      // Check type filter  
      const matchesType = typeFilter === "all" || event.type === typeFilter;
      
      // Check date filter
      const matchesDate = 
        dateFilter === "all" || 
        (dateFilter === "upcoming" && isUpcoming) ||
        (dateFilter === "past" && !isUpcoming);
      
      return matchesSearch && matchesType && matchesDate;
    });
  }, [events, searchTerm, typeFilter, dateFilter]);

  return (
    <div>
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1 min-w-[240px]">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            {allTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type === "all" ? "All Types" : type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={(value) => setDateFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            {dateFilterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Events Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Details</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Speakers</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => {
                const isUpcoming = new Date(event.date) >= new Date();
                return (
                  <TableRow key={event.id}>
                    <TableCell className="min-w-[200px]">
                      <div>
                        <Link href={`/admin/events/${event.id}`} className="font-medium hover:underline">
                          {event.title}
                        </Link>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                          {event.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center">
                        <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                        <div>
                          <p>{formatDate(event.date)}</p>
                          <p className="text-xs text-muted-foreground">{event.time}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[180px]">
                      <div className="flex items-start">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <p className="text-sm truncate">{event.location}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant[event.type] || "secondary"}>
                        {event.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{event.speakers.length}</span>
                      </div>
                    </TableCell>
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
                            <Link href={`/admin/events/${event.id}`}>View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>Edit Event</DropdownMenuItem>
                          <DropdownMenuItem>Manage Speakers</DropdownMenuItem>
                          <DropdownMenuItem>
                            {isUpcoming ? "Send Reminder" : "Download Attendance"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Cancel Event</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No events found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 