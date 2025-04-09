"use client";

import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { formatDate } from './utils';

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

interface EventAttendanceChartProps {
  events: Event[];
}

export function EventAttendanceChart({ events }: EventAttendanceChartProps) {
  // Generate random attendance data for sample visualization
  const data = useMemo(() => {
    return events.map(event => {
      // Random attendance between 30-200
      const attendance = Math.floor(Math.random() * 170) + 30;
      // Random registration is always higher than attendance (by 10-40%)
      const registrations = attendance + Math.floor(Math.random() * (attendance * 0.4)) + Math.ceil(attendance * 0.1);
      
      return {
        name: event.title,
        date: event.date,
        time: event.time,
        location: event.location.split(",")[0],
        registrations,
        attendance,
      };
    });
  }, [events]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const event = payload[0].payload;
      const attendanceRate = Math.round((event.attendance / event.registrations) * 100);
      
      return (
        <div className="font-sans bg-background border rounded-md shadow-sm p-2 text-sm">
          <p className="font-medium">{event.name}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(event.date).toLocaleDateString()}
          </p>
          <div className="mt-2 space-y-1">
            <p className="text-xs flex justify-between">
              <span>Registrations:</span> 
              <span className="font-medium">{event.registrations}</span>
            </p>
            <p className="text-xs flex justify-between">
              <span>Attendance:</span> 
              <span className="font-medium">{event.attendance}</span>
            </p>
            <p className="text-xs flex justify-between">
              <span>Attendance Rate:</span> 
              <span className="font-medium">{attendanceRate}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // If no events data
  if (data.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
        <p>No past events data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[280px] p-4 pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="hsl(var(--muted)/0.3)" 
          />
          <XAxis 
            dataKey="name" 
            fontSize={11}
            fontFamily="var(--font-geist-sans), 'Inter', sans-serif"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 12)}...` : value}
          />
          <YAxis 
            fontSize={11}
            fontFamily="var(--font-geist-sans), 'Inter', sans-serif"
            tickLine={false} 
            axisLine={false}
            width={30}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="registrations" 
            stroke="hsl(var(--primary)/0.3)" 
            fillOpacity={1} 
            fill="url(#colorRegistrations)"
            strokeWidth={1}
            activeDot={{ r: 5 }}
            animationDuration={800}
          />
          <Area 
            type="monotone" 
            dataKey="attendance" 
            stroke="hsl(var(--primary))" 
            fillOpacity={1} 
            fill="url(#colorAttendance)"
            strokeWidth={2}
            activeDot={{ r: 5 }}
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
} 