import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
// For multi-select, use a custom dropdown (see memory about shadcn/ui Select)

export interface EventFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  typeFilter: string[];
  onTypeFilterChange: (v: string[]) => void;
  statusFilter: string[];
  onStatusFilterChange: (v: string[]) => void;
  locationFilter: string[];
  onLocationFilterChange: (v: string[]) => void;
}

export const EventFilters: React.FC<EventFiltersProps> = ({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  locationFilter,
  onLocationFilterChange,
}) => {
  return (
    <div className="flex flex-wrap gap-2 items-center mb-4">
      <Input
        placeholder="Search events..."
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        className="w-56"
      />
      {/* TODO: Replace with custom multi-select dropdowns for type, status, location */}
      <Button variant="outline" size="sm" className="flex gap-1 items-center">
        <SlidersHorizontal size={16} /> Filters
      </Button>
    </div>
  );
};
