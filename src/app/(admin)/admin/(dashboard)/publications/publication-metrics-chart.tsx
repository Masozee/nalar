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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PublicationStat {
  id: string;
  views: number;
  downloads: number;
  viewsChange: string;
  downloadsChange: string;
}

interface PublicationMetricsChartProps {
  stats: PublicationStat[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const shortLabel = `Pub ${label.substring(0, 4)}...`;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col col-span-2">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Publication ID
            </span>
            <span className="font-bold text-muted-foreground">
              {shortLabel} 
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

export function PublicationMetricsChart({ stats }: PublicationMetricsChartProps) {
  const chartData = useMemo(() => {
    const topPublications = [...stats]
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map(stat => ({
        name: stat.id,
        Views: stat.views,
        Downloads: stat.downloads
      }));
    return topPublications;
  }, [stats]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Top Publications by Views</CardTitle>
        <CardDescription>Showing top 5 publications</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `Pub ${value.substring(0, 4)}`}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={0}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} 
                content={<CustomTooltip />}
              />
              <Bar 
                dataKey="Views" 
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="Downloads" 
                fill="hsl(var(--secondary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-muted-foreground h-[300px] flex items-center justify-center">No metrics data available.</p>
        )}
      </CardContent>
    </Card>
  );
} 