"use client";

import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";

interface Publication {
  id: string;
  status: string;
  // other fields not needed for this chart
}

interface PublicationStatusChartProps {
  publications: Publication[];
}

const COLORS: { [key: string]: string } = {
  Published: "#10b981", // Emerald 500
  Draft: "#f59e0b",     // Amber 500
  Archived: "#6b7280", // Gray 500
  Default: "#a1a1aa" // Gray 400
};

export function PublicationStatusChart({ publications }: PublicationStatusChartProps) {

  const statusCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    publications.forEach(pub => {
      counts[pub.status] = (counts[pub.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [publications]);

  const totalPublications = publications.length;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Publication Status</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center p-4">
        {statusCounts.length > 0 ? (
           <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusCounts}
                cx="50%"
                cy="50%"
                innerRadius={60} // Make it a donut chart
                outerRadius={85}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
              >
                {statusCounts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name] ?? COLORS.Default} />
                ))}
              </Pie>
              <Tooltip />
              {/* Optionally add Legend if needed */}
              {/* <Legend /> */}
            </PieChart>
          </ResponsiveContainer>
         ) : (
           <p className="text-center text-muted-foreground">No status data.</p>
         )}
        <div className="mt-4 text-center text-muted-foreground">
           <span className="text-2xl font-bold text-foreground">{totalPublications}</span> Total Publications
         </div>
       </CardContent>
     </Card>
   );
 } 