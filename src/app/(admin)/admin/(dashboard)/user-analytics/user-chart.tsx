"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface UserStats {
  registrationsByDay: { day: string; newUsers: number }[];
}

interface UserChartProps {
  stats: UserStats;
}

export function UserChart({ stats }: UserChartProps) {
  console.log("User Stats Received in Client Component:", stats);

  return (
    <Card>
      <CardHeader>
        <CardTitle>New User Registrations This Week</CardTitle>
        <CardDescription>Daily count of new user sign-ups.</CardDescription>
      </CardHeader>
      <CardContent className="h-[350px] pl-2">
        {stats.registrationsByDay && stats.registrationsByDay.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.registrationsByDay} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="day"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.9)", border: "1px solid #ccc", borderRadius: "4px" }}
                cursor={{ fill: 'transparent' }}
              />
              <Bar dataKey="newUsers" name="New Users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-muted-foreground py-10">No user registration data available.</p>
        )}
      </CardContent>
    </Card>
  );
} 