"use client";
import * as React from "react";
import { useEffect, useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, LayoutGrid, List as ListIcon, Trash2 } from "lucide-react";
import { fetchEvents, Event } from "./api";
import { EventCard } from "./EventCard";
import { EventList } from "./EventList";
import { EventAdvancedFilters } from "./EventAdvancedFilters";

export default function EventsPage() {
  const [data, setData] = useState<{ results: Event[]; count?: number; next?: string | null; previous?: string | null }>({ results: [], count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("card");
  // Advanced filters
  const [search, setSearch] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [topic, setTopic] = useState("");
  const [status, setStatus] = useState("");
  const [topics, setTopics] = useState<{ id: number; name: string }[]>([]);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);

  // Fetch topics for topic filter
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/topics/?page_size=100`)
      .then(res => res.json())
      .then(json => setTopics(json.results || []));
  }, []);

  // Fetch events with filters
  useEffect(() => {
    setLoading(true);
    const params: Record<string, any> = {
      page,
      page_size: 12,
      search,
      date_start: dateStart,
      date_end: dateEnd,
      topic,
      is_past_due: status === "past" ? true : status === "upcoming" ? false : undefined,
    };
    fetchEvents(params)
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, [page, search, dateStart, dateEnd, topic, status]);

  // Bulk select logic (list view only)
  const allSelected = selected.length > 0 && selected.length === data.results.length;
  const toggleSelectAll = () => {
    setSelected(allSelected ? [] : data.results.map((e) => e.id));
  };
  const toggleSelect = (id: number) => {
    setSelected((sel) => (sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]));
  };
  const clearSelection = () => setSelected([]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil((data.count || 0) / 12));
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  // Reset page to 1 when filters/search change
  useEffect(() => { setPage(1); }, [search, dateStart, dateEnd, topic, status]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold">Events</h1>
        <Tabs value={view} onValueChange={setView} className="w-fit">
          <TabsList>
            <TabsTrigger value="card"><LayoutGrid className="mr-2 h-4 w-4" />Card View</TabsTrigger>
            <TabsTrigger value="list"><ListIcon className="mr-2 h-4 w-4" />List View</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {/* Advanced Filters Bar (shows in both views) */}
      <EventAdvancedFilters
        search={search}
        onSearchChange={setSearch}
        dateStart={dateStart}
        onDateStartChange={setDateStart}
        dateEnd={dateEnd}
        onDateEndChange={setDateEnd}
        topic={topic}
        onTopicChange={setTopic}
        status={status}
        onStatusChange={setStatus}
        topics={topics}
      />
      {loading ? (
        <div className="text-muted-foreground py-12 text-center">Loading events...</div>
      ) : data.results.length === 0 ? (
        <div className="text-muted-foreground py-12 text-center">No events found.</div>
      ) : (
        <Tabs value={view} className="w-full">
          <TabsContent value="card">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.results.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="list">
            <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        className="accent-blue-500 rounded"
                        aria-label="Select all"
                      />
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide">Title</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide">Start Date</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide">End Date</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.results.map((event) => (
                    <tr key={event.id} className={selected.includes(event.id) ? "bg-blue-50" : undefined}>
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={selected.includes(event.id)}
                          onChange={() => toggleSelect(event.id)}
                          className="accent-blue-500 rounded"
                          aria-label={`Select event ${event.title}`}
                        />
                      </td>
                      <td className="px-4 py-2 font-medium">{event.title}</td>
                      <td className="px-4 py-2">{event.date_start}</td>
                      <td className="px-4 py-2">{event.date_end}</td>
                      <td className="px-4 py-2">{event.location || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      )}
      <div className="flex justify-between items-center mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Previous
        </Button>
        <span className="text-xs text-muted-foreground">
          Page {page} of {totalPages} &mdash; Showing {data.results.length} of {data.count || data.results.length} events
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
