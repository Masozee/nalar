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
import { Checkbox } from "@/components/ui/checkbox";
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
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());

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
        event.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  // Batch selection handlers
  const toggleEventSelection = (eventId: string) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId);
    } else {
      newSelected.add(eventId);
    }
    setSelectedEvents(newSelected);
  };

  const toggleAllEvents = () => {
    if (selectedEvents.size === filteredEvents.length) {
      // If all are selected, deselect all
      setSelectedEvents(new Set());
    } else {
      // Otherwise, select all filtered events
      setSelectedEvents(new Set(filteredEvents.map(event => event.id)));
    }
  };

  const clearSelection = () => {
    setSelectedEvents(new Set());
  };

  // Handle batch actions
  const handleBatchDelete = () => {
    alert(`Delete ${selectedEvents.size} events`);
    // In a real app, you would call an API to delete the selected events
    clearSelection();
  };

  const handleBatchExport = () => {
    alert(`Export ${selectedEvents.size} events`);
    // In a real app, you would handle exporting the selected events
  };

  return (
    <div className="w-full font-sans">
      {/* Filter Controls */}
      <div className="p-2 border-b flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 bg-muted/5">
        <div className="relative w-full sm:flex-1 sm:min-w-[240px] sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, location, description, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 bg-background font-sans"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-2 items-center text-sm font-medium text-muted-foreground mr-2">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value)}>
              <SelectTrigger className="w-[140px] h-9 bg-background">
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
              <SelectTrigger className="w-[140px] h-9 bg-background">
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
        </div>
      </div>

      {/* Batch Actions Bar - Only visible when items are selected */}
      {selectedEvents.size > 0 && (
        <div className="p-2 bg-primary/5 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{selectedEvents.size} event{selectedEvents.size !== 1 ? 's' : ''} selected</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleBatchExport} className="h-8">
              <Download className="h-3.5 w-3.5 mr-1" /> Export
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              <Copy className="h-3.5 w-3.5 mr-1" /> Duplicate
            </Button>
            <Button variant="destructive" size="sm" onClick={handleBatchDelete} className="h-8">
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
            </Button>
            <Button variant="ghost" size="sm" onClick={clearSelection} className="h-8 px-2">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Events Table */}
      <div className="overflow-auto max-w-full rounded-b-lg">
        <Table className="events-table min-w-[800px] w-full">
          <TableHeader className="bg-muted/5">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[40px]">
                <Checkbox 
                  checked={filteredEvents.length > 0 && selectedEvents.size === filteredEvents.length}
                  onCheckedChange={toggleAllEvents}
                  aria-label="Select all events"
                />
              </TableHead>
              <TableHead className="font-medium w-[240px]">Event Details</TableHead>
              <TableHead className="font-medium w-[140px]">Date & Time</TableHead>
              <TableHead className="font-medium w-[140px]">Location</TableHead>
              <TableHead className="font-medium w-[100px]">Type</TableHead>
              <TableHead className="font-medium w-[80px]">Speakers</TableHead>
              <TableHead className="w-[50px]"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => {
                const isUpcoming = new Date(event.date) >= new Date();
                const isSelected = selectedEvents.has(event.id);
                return (
                  <TableRow key={event.id} className={isSelected ? "bg-primary/5" : undefined}>
                    <TableCell>
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={() => toggleEventSelection(event.id)}
                        aria-label={`Select ${event.title}`}
                      />
                    </TableCell>
                    <TableCell className="py-3">
                      <div>
                        <Link 
                          href={`/admin/events/${event.id}`} 
                          className="font-medium text-primary hover:underline flex items-center gap-1 group"
                        >
                          {event.title}
                          <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-1 pr-4 max-w-[220px]">
                          {event.description}
                        </p>
                        <span className="text-xs text-muted-foreground/70 mt-0.5 inline-block">
                          ID: {event.id}
                        </span>
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
                    
                    <TableCell className="py-3">
                      <div className="flex items-start">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <p className="text-sm truncate max-w-[100px]">{event.location}</p>
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
                              <ExternalLink className="h-4 w-4" /> View details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                            <PencilLine className="h-4 w-4" /> Edit event
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer text-destructive flex items-center gap-2">
                            <Trash2 className="h-4 w-4" /> Delete event
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <p>No events found</p>
                    <p className="text-xs mt-1">Try adjusting your filters or search term</p>
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