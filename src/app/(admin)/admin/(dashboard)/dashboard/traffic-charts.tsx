"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Users,
  Eye,
  MousePointerClick,
  Clock,
  Download,
  BookOpen,
  History,
  Edit3,
  PlusCircle,
  Trash2,
  LogIn,
  FileText,
  User,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Badge
} from "@/components/ui/badge";

// Define the expected structure of the data prop
interface TrafficData {
  overview: {
    totalVisitors: number;
    totalPageViews: number;
    bounceRate: string;
    avgVisitDuration: string;
    visitorsChange: string;
    pageViewsChange: string;
    bounceRateChange: string;
    avgVisitDurationChange: string;
  };
  trafficByDay: { day: string; visitors: number }[];
  trafficSources: { source: string; visitors: number; percentage: number }[];
  topPages: { path: string; views: number }[];
  deviceUsage: { device: string; users: number; percentage: number }[];
}

// Define PublicationStats interface
interface PublicationStat {
  id: string;
  title: string;
  slug: string;
  views: number;
  downloads: number;
  viewsChange: string;
  downloadsChange: string;
}

// Helper function to determine trend icon and color
const TrendIndicator = ({ change }: { change: string }) => {
  const isPositive = change.startsWith("+");
  const isNegative = change.startsWith("-");
  const Icon = isPositive ? ArrowUpRight : isNegative ? ArrowDownRight : Minus;
  const colorClass = isPositive
    ? "text-green-600"
    : isNegative
      ? "text-red-600"
      : "text-gray-500";

  return (
    <span className={`flex items-center text-xs ${colorClass}`}>
      <Icon className="mr-1 h-3 w-3" />
      {change.replace("+", "").replace("-", "")}
    </span>
  );
};

// Define colors for Pie chart
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

// Update props - REMOVE activityLog
interface TrafficChartsProps {
  data: TrafficData;
  publicationStats: PublicationStat[];
}

// This is the Client Component responsible for rendering the charts and tables
export function TrafficCharts({ data, publicationStats }: TrafficChartsProps) {
  console.log("Traffic Data:", data);
  console.log("Publication Stats:", publicationStats);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 md:gap-8 md:p-8">
      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalVisitors.toLocaleString("en-US")}</div>
            <TrendIndicator change={data.overview.visitorsChange} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalPageViews.toLocaleString("en-US")}</div>
            <TrendIndicator change={data.overview.pageViewsChange} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.bounceRate}</div>
            <TrendIndicator change={data.overview.bounceRateChange} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Visit Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.avgVisitDuration}</div>
            <TrendIndicator change={data.overview.avgVisitDurationChange} />
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-8">
        {/* Traffic Over Time Chart - Span 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Visitors This Week</CardTitle>
            <CardDescription>Daily visitor count trend.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2 h-[350px]">
            {data.trafficByDay && data.trafficByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trafficByDay} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
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
                     cursor={{ strokeDasharray: '3 3' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="#10b981" /* Example: Emerald-500 Tailwind color */
                    strokeWidth={2} 
                    activeDot={{ r: 8 }} 
                    dot={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-10">No traffic data available.</p>
            )}
          </CardContent>
        </Card>

        {/* Traffic Sources - Span 1 column */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>Visitors by source channel.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {data.trafficSources && data.trafficSources.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={data.trafficSources}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="percentage"
                    nameKey="source"
                    label={false}
                  >
                    {data.trafficSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                   <Tooltip />
                   <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
             ) : (
              <p className="text-center text-muted-foreground py-4">No traffic source data.</p>
             )}
             {data.trafficSources && data.trafficSources.length > 0 ? (
              <Table>
                <TableBody>
                  {data.trafficSources.map((source) => (
                    <TableRow key={source.source}>
                      <TableCell className="font-medium">{source.source}</TableCell>
                      <TableCell className="text-right">{source.visitors.toLocaleString("en-US")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
               <p className="text-center text-muted-foreground py-4">No traffic source data.</p>
            )}
          </CardContent>
        </Card>

         {/* Top Pages Table - Span 2 columns */}
        <Card className="lg:col-span-2">
           <CardHeader>
             <CardTitle>Top Pages</CardTitle>
             <CardDescription>Most viewed pages this period.</CardDescription>
           </CardHeader>
           <CardContent>
              {data.topPages && data.topPages.length > 0 ? (
                <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead className="w-[200px] sm:w-auto">Path</TableHead>
                     <TableHead className="text-right">Views</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {data.topPages.map((page) => (
                     <TableRow key={page.path}>
                       <TableCell className="font-medium truncate">{page.path}</TableCell>
                       <TableCell className="text-right">{page.views.toLocaleString("en-US")}</TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <p className="text-center text-muted-foreground py-10">No top page data available.</p>
             )}
           </CardContent>
         </Card>

         {/* Device Usage Chart - Span 1 column */}
         <Card className="lg:col-span-1">
           <CardHeader>
             <CardTitle>Device Usage</CardTitle>
             <CardDescription>Users by device type.</CardDescription>
           </CardHeader>
           <CardContent>
             {data.deviceUsage && data.deviceUsage.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.deviceUsage} layout="vertical" margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis 
                       dataKey="device" 
                       type="category" 
                       width={60}
                       tickLine={false} 
                       axisLine={false} 
                       stroke="#888888" 
                       fontSize={12} 
                     />
                    <Tooltip cursor={{fill: 'transparent'}}/>
                    <Bar dataKey="percentage" name="%" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={30}>
                       {data.deviceUsage.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                 <p className="text-center text-muted-foreground py-10">No device usage data available.</p>
              )}
           </CardContent>
         </Card>

        {/* --- NEW: Top Publications Card (Table) --- */}
        <Card className="lg:col-span-3"> {/* Span full width on large screens */} 
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" /> {/* Icon */} 
              Top Publications
            </CardTitle>
            <CardDescription>
              Views and downloads for key publications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {publicationStats && publicationStats.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-center">Views</TableHead>
                    <TableHead className="text-center">Downloads</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {publicationStats.map((pub) => (
                    <TableRow key={pub.id}>
                      <TableCell className="font-medium">
                        <a href={pub.slug} target="_blank" rel="noopener noreferrer" className="hover:underline">
                           {pub.title}
                         </a>
                      </TableCell>
                      <TableCell className="text-center">
                        {pub.views.toLocaleString("en-US")}
                        <TrendIndicator change={pub.viewsChange} />
                      </TableCell>
                      <TableCell className="text-center">
                        {pub.downloads.toLocaleString("en-US")}
                        <TrendIndicator change={pub.downloadsChange} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-10">
                No publication stats available.
              </p>
            )}
          </CardContent>
        </Card>
        {/* --- End Top Publications Card --- */}
      </div>
    </div>
  );
} 