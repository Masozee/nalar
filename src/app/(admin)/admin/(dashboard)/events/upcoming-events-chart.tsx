"use client";

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  TooltipProps 
} from 'recharts';
import { getDaysRemaining } from './utils';

// Define Event interface
interface Speaker {
  name: string;
  affiliation: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: string;
  description: string;
  speakers: Speaker[];
}

interface UpcomingEventsChartProps {
  events: Event[];
}

export function UpcomingEventsChart({ events }: UpcomingEventsChartProps) {
  // Prepare the data
  const data = events.map(event => {
    const daysRemaining = getDaysRemaining(event.date);
    return {
      name: event.title,
      days: daysRemaining,
      id: event.id,
      date: event.date,
      time: event.time,
      location: event.location.split(",")[0], // Only show first part of location
    };
  });

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const event = payload[0].payload;
      return (
        <div className="font-sans bg-background border rounded-md shadow-sm p-2 text-sm">
          <p className="font-medium">{event.name}</p>
          <p className="text-xs text-muted-foreground mt-1">Date: {new Date(event.date).toLocaleDateString()}</p>
          <p className="text-xs text-muted-foreground">Time: {event.time}</p>
          <p className="text-xs text-muted-foreground">Location: {event.location}</p>
          <p className="text-xs font-medium mt-1">{event.days} days remaining</p>
        </div>
      );
    }
    return null;
  };

  // If no upcoming events
  if (data.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
        <p>No upcoming events scheduled</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[280px] p-4 pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
        >
          <XAxis 
            type="number" 
            dataKey="days" 
            name="Days"
            fontSize={11} 
            fontFamily="var(--font-geist-sans), 'Inter', sans-serif"
            tickLine={false}
            axisLine={false}
            domain={[0, 'dataMax']}
            tickFormatter={(value) => `${value} days`}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={120}
            fontSize={11}
            fontFamily="var(--font-geist-sans), 'Inter', sans-serif"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => 
              value.length > 18 ? `${value.substring(0, 18)}...` : value
            }
          />
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
          />
          <Bar 
            dataKey="days" 
            fill="hsl(var(--primary))" 
            barSize={16}
            radius={[0, 4, 4, 0]}
            animationDuration={800}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 