"use client";

import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Simulated daily data - in a real app, this would come from an API
const generateDailyData = () => {
  const data = [];
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      Views: Math.floor(Math.random() * 100) + 50,
      Downloads: Math.floor(Math.random() * 60) + 20,
    });
  }
  
  return data;
};

// Custom Tooltip for Area Chart
const CustomAreaTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col col-span-2">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Date
            </span>
            <span className="font-bold text-muted-foreground">
              {label}
            </span>
          </div>
          <div className="flex flex-col">
             <span className="text-[0.70rem] uppercase text-muted-foreground">
               Views
             </span>
             <span className="font-bold text-primary">
               {payload[0].value.toLocaleString()}
             </span>
           </div>
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Downloads
            </span>
            <span className="font-bold text-secondary-foreground">
              {payload[1].value.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function DailyMetricsCard() {
  const dailyData = useMemo(() => generateDailyData(), []);
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Daily Activity</CardTitle>
        <CardDescription>Showing views and downloads for the last 7 days</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        {dailyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={dailyData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.7}/>
                   <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                 </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
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
                dataKey="Views" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1}
                fill="url(#colorViews)" 
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="Downloads" 
                stroke="hsl(var(--secondary))" 
                fillOpacity={1}
                fill="url(#colorDownloads)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-muted-foreground h-[300px] flex items-center justify-center">No daily data available.</p>
        )}
      </CardContent>
    </Card>
  );
} 