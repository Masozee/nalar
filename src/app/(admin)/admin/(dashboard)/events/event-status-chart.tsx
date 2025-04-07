"use client";

import React from 'react';
import { DonutChart, Legend } from "@tremor/react";
import { CalendarDays, CalendarClock } from "lucide-react";

interface EventStatusChartProps {
  stats: {
    total: number;
    upcoming: number;
    past: number;
  };
}

export function EventStatusChart({ stats }: EventStatusChartProps) {
  // Prepare chart data
  const chartData = [
    { name: 'Upcoming Events', value: stats.upcoming },
    { name: 'Past Events', value: stats.past },
  ];

  // Color scheme matching ShadCN theme variables
  const customColors = [
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
  ];

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <DonutChart
          data={chartData}
          category="value"
          index="name"
          valueFormatter={(value) => `${value} events`}
          colors={customColors}
          showAnimation={true}
          animationDuration={500}
          className="h-40 w-40 mx-auto"
        />
      </div>
      
      <Legend
        categories={['Upcoming Events', 'Past Events']}
        colors={customColors}
        className="mt-3 justify-center gap-8"
      />
      
      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="flex flex-col items-center rounded-lg bg-primary/5 border border-primary/20 py-3 px-2">
          <div className="flex items-center text-primary mb-1">
            <CalendarClock className="h-4 w-4 mr-1" />
            <span className="text-xs uppercase font-medium">Upcoming</span>
          </div>
          <p className="text-2xl font-bold">{stats.upcoming}</p>
        </div>
        <div className="flex flex-col items-center rounded-lg bg-secondary/5 border border-secondary/20 py-3 px-2">
          <div className="flex items-center text-secondary mb-1">
            <CalendarDays className="h-4 w-4 mr-1" />
            <span className="text-xs uppercase font-medium">Past</span>
          </div>
          <p className="text-2xl font-bold">{stats.past}</p>
        </div>
      </div>
    </div>
  );
} 