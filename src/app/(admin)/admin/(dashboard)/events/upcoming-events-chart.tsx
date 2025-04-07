"use client";

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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

interface UpcomingEventsChartProps {
  events: Event[];
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-3 shadow-md">
        <div className="grid gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground font-medium">
              Event
            </span>
            <span className="font-medium text-foreground line-clamp-1 max-w-[200px]">
              {label}
            </span>
          </div>
          <div className="flex justify-between items-baseline gap-8 mt-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground font-medium">
              Event Date
            </span>
            <span className="font-medium">
              {payload[0]?.payload?.date}
            </span>
          </div>
          <div className="flex justify-between items-baseline gap-8">
            <span className="text-[0.70rem] uppercase text-muted-foreground font-medium">
              Days Until
            </span>
            <span className="font-semibold text-primary text-lg">
              {payload[0].value}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function UpcomingEventsChart({ events }: UpcomingEventsChartProps) {
  const chartData = useMemo(() => {
    const now = new Date();
    
    return events.map(event => {
      const eventDate = new Date(event.date);
      const diffTime = Math.abs(eventDate.getTime() - now.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        name: event.title,
        daysUntil: diffDays,
        date: new Date(event.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      };
    });
  }, [events]);

  return (
    <div className="h-full p-6">
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart 
            data={chartData} 
            layout="vertical"
            margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
          >
            <XAxis
              type="number"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 'dataMax']}
              tickCount={5}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={140}
              tickFormatter={(value) => value.length > 20 ? `${value.substring(0, 17)}...` : value}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.15 }} 
              content={<CustomTooltip />}
            />
            <Bar 
              dataKey="daysUntil" 
              fill="hsl(var(--primary))"
              radius={[0, 4, 4, 0]}
              name="Days Until Event"
              barSize={20}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-center text-muted-foreground">No upcoming events</p>
        </div>
      )}
    </div>
  );
} 