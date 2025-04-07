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
  SlidersHorizontal
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
    <div className="w-full">
      {/* Filter Controls */}
      <div className="p-4 border-b flex flex-wrap items-center gap-4 bg-muted/5">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 bg-background"
          />
        </div>
        
        <div className="flex gap-2 items-center text-sm font-medium text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters:</span>
        </div>
        
        <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value)}>
          <SelectTrigger className="w-[180px] h-9 bg-background">
            <SelectValue placeholder="Event Type" />
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
          <SelectTrigger className="w-[180px] h-9 bg-background">
            <SelectValue placeholder="Date" />
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
      <div className="rounded-b-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/5">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-medium">Event Details</TableHead>
              <TableHead className="font-medium">Date & Time</TableHead>
              <TableHead className="font-medium">Location</TableHead>
              <TableHead className="font-medium">Type</TableHead>
              <TableHead className="font-medium">Speakers</TableHead>
              <TableHead className="w-[50px]"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => {
                const isUpcoming = new Date(event.date) >= new Date();
                return (
                  <TableRow key={event.id}>
                    <TableCell className="min-w-[200px] py-3">
                      <div>
                        <Link 
                          href={`/admin/events/${event.id}`} 
                          className="font-medium text-primary hover:underline flex items-center gap-1 group"
                        >
                          {event.title}
                          <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-1 pr-4">
                          {event.description}
                        </p>
                      </div>
                    </TableCell>
                    
                    <TableCell className="whitespace-nowrap py-3">
                      <div className="flex items-center">
                        <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm">{formatDate(event.date)}</p>
                          <p className="text-xs text-muted-foreground">{event.time}</p>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="max-w-[180px] py-3">
                      <div className="flex items-start">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <p className="text-sm truncate">{event.location}</p>
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-3">
                      <Badge 
                        variant={statusBadgeVariant[event.type] || "secondary"}
                        className="flex items-center gap-1 font-normal"
                      >
                        <Tag className="h-3 w-3" />
                        {event.type}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="py-3">
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{event.speakers.length}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px]">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild className="cursor-pointer flex items-center gap-2">
                            <Link href={`/admin/events/${event.id}`}>
                              <ExternalLink className="h-4 w-4" />
                              <span>View Details</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                            <PencilLine className="h-4 w-4" />
                            <span>Edit Event</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>Manage Speakers</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                            {isUpcoming ? (
                              <>
                                <CalendarDays className="h-4 w-4" />
                                <span>Send Reminder</span>
                              </>
                            ) : (
                              <>
                                <CalendarDays className="h-4 w-4" />
                                <span>Download Attendance</span>
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive cursor-pointer flex items-center gap-2">
                            <Trash2 className="h-4 w-4" />
                            <span>Cancel Event</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                    <Search className="h-10 w-10 mb-2 opacity-20" />
                    <p>No events found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 