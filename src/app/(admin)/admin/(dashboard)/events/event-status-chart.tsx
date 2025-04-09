"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface EventStats {
  total: number;
  upcoming: number;
  past: number;
}

interface EventStatusChartProps {
  stats: EventStats;
}

export function EventStatusChart({ stats }: EventStatusChartProps) {
  const chartData = useMemo(() => [
    { name: "Upcoming", value: stats.upcoming, color: "hsl(var(--primary))" },
    { name: "Past", value: stats.past, color: "hsl(var(--muted-foreground))" },
  ], [stats]);

  const totalEvents = stats.total;
  const upcomingPercentage = totalEvents > 0 
    ? Math.round((stats.upcoming / totalEvents) * 100)
    : 0;
  const pastPercentage = totalEvents > 0 
    ? Math.round((stats.past / totalEvents) * 100)
    : 0;

  return (
    <div className="w-full p-4 flex flex-col sm:flex-row items-center justify-center">
      <div className="flex-shrink-0 relative h-36 w-36">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={2}
              stroke="hsl(var(--background))"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  className="stroke-background hover:opacity-80"
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
                borderRadius: "0.5rem",
                fontSize: "12px",
                fontFamily: "var(--font-geist-sans), 'Inter', sans-serif"
              }}
              formatter={(value: number) => [`${value} events`, ""]}
              labelFormatter={() => ""}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between mt-3 sm:mt-0 sm:pl-4 sm:flex-col sm:justify-center sm:gap-3 w-full">
        <div className="grid grid-cols-2 gap-3 w-full">
          <div className="flex flex-col justify-center">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-primary mr-2" />
              <span className="text-sm font-medium">Upcoming</span>
            </div>
            <div className="mt-1">
              <span className="text-xl font-bold">{stats.upcoming}</span>
              <span className="text-xs text-muted-foreground ml-1">({upcomingPercentage}%)</span>
            </div>
          </div>
          
          <div className="flex flex-col justify-center">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-muted-foreground mr-2" />
              <span className="text-sm font-medium">Past</span>
            </div>
            <div className="mt-1">
              <span className="text-xl font-bold">{stats.past}</span>
              <span className="text-xs text-muted-foreground ml-1">({pastPercentage}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 