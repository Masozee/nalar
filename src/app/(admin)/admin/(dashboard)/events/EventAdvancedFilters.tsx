import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";

export interface EventAdvancedFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  dateStart: string;
  onDateStartChange: (v: string) => void;
  dateEnd: string;
  onDateEndChange: (v: string) => void;
  topic: string;
  onTopicChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  topics: { id: number; name: string }[];
}

export const EventAdvancedFilters: React.FC<EventAdvancedFiltersProps> = ({
  search, onSearchChange,
  dateStart, onDateStartChange,
  dateEnd, onDateEndChange,
  topic, onTopicChange,
  status, onStatusChange,
  topics
}) => (
  <div className="flex flex-row flex-wrap gap-x-4 gap-y-2 items-end mb-4">
    <div className="flex flex-col min-w-[12rem]">
      <span className="text-xs text-muted-foreground mb-1">Search by title or description</span>
      <Input
        placeholder="Search by title or description"
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        className="w-full"
      />
    </div>
    <div className="flex flex-col min-w-[9rem]">
      <span className="text-xs text-muted-foreground mb-1">Start of events</span>
      <Input
        type="date"
        value={dateStart}
        onChange={e => onDateStartChange(e.target.value)}
        className="w-full"
        title="Start of events"
      />
    </div>
    <div className="flex flex-col min-w-[9rem]">
      <span className="text-xs text-muted-foreground mb-1">End of events</span>
      <Input
        type="date"
        value={dateEnd}
        onChange={e => onDateEndChange(e.target.value)}
        className="w-full"
        title="End of events"
      />
    </div>
    <div className="flex flex-col min-w-[10rem]">
      <span className="text-xs text-muted-foreground mb-1">Filter by topic</span>
      <Select value={topic === "" ? "all" : topic} onValueChange={v => onTopicChange(v === "all" ? "" : v)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Topic" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Topics</SelectItem>
          {topics.map(t => (
            <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div className="flex flex-col min-w-[8rem]">
      <span className="text-xs text-muted-foreground mb-1">Upcoming or past events</span>
      <Select value={status === "" ? "all" : status} onValueChange={v => onStatusChange(v === "all" ? "" : v)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="upcoming">Upcoming</SelectItem>
          <SelectItem value="past">Past</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="flex flex-col justify-end min-w-[8rem]">
      <span className="text-xs text-transparent mb-1">Reset</span>
      <Button
        variant="outline"
        size="sm"
        type="button"
        className="w-full h-10 px-4"
      >
        Reset
      </Button>
    </div>
  </div>
);
