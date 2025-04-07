"use client";

import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
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

interface EventAttendanceChartProps {
  events: Event[];
}

// Custom Tooltip for Area Chart
const CustomAreaTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Event
            </span>
            <span className="font-bold text-muted-foreground line-clamp-1 max-w-[180px]">
              {label}
            </span>
          </div>
          <div className="flex flex-col">
             <span className="text-[0.70rem] uppercase text-muted-foreground">
               Attendance
             </span>
             <span className="font-bold text-primary">
               {payload[0].value.toLocaleString()} attendees
             </span>
           </div>
        </div>
      </div>
    );
  }
  return null;
};

// Generate simulated attendance data (in a real app, this would be from an API)
const generateAttendanceData = (events: Event[]) => {
  return events.map(event => {
    // Generate a random attendance value based on date - older events tend to have higher attendance
    // This is just for demo purposes - in a real app, this would be actual data
    const date = new Date(event.date);
    const now = new Date();
    const age = now.getTime() - date.getTime();
    const ageModifier = Math.min(1, age / (1000 * 60 * 60 * 24 * 365)); // Normalize to 0-1 based on year
    
    // Base attendance between 30-150 with older events having more reliable attendance
    const baseAttendance = 30 + Math.floor(Math.random() * 120);
    const adjustedAttendance = Math.floor(baseAttendance * (0.8 + 0.4 * ageModifier));
    
    return {
      name: event.title,
      attendance: adjustedAttendance,
      date: new Date(event.date).toLocaleDateString(),
    };
  });
};

export function EventAttendanceChart({ events }: EventAttendanceChartProps) {
  const chartData = useMemo(() => {
    return generateAttendanceData(events);
  }, [events]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Event Attendance</CardTitle>
        <CardDescription>Attendance at recent events</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 7)}...` : value}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={0}
              />
              <Tooltip
                 cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, fill: "transparent" }} 
                 content={<CustomAreaTooltip />}
              />
              <Area 
                type="monotone" 
                dataKey="attendance" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1}
                fill="url(#colorAttendance)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-muted-foreground h-[300px] flex items-center justify-center">No event attendance data</p>
        )}
      </CardContent>
    </Card>
  );
} 