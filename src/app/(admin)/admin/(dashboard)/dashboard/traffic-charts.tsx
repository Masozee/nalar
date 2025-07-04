"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Area,
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
const PASTEL_COLORS = [
  '#A7C7E7', // pastel blue
  '#B5EAD7', // pastel green
  '#FFDAC1', // pastel peach
  '#FFB7B2', // pastel pink
  '#E2F0CB', // pastel mint
  '#C7CEEA', // pastel purple
];

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
      {/* --- Advanced Feature: Quick Actions Card --- */}
      <Card className="rounded-2xl hover:shadow-lg transition-shadow border-2 border-dashed border-accent/30 bg-muted/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            Quick Actions
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="rounded-full">
              <PlusCircle className="w-4 h-4 mr-1" /> Add Publication
            </Button>
            <Button size="sm" variant="outline" className="rounded-full">
              <FileText className="w-4 h-4 mr-1" /> Export Data
            </Button>
            <Button size="sm" variant="outline" className="rounded-full">
              <History className="w-4 h-4 mr-1" /> View Logs
            </Button>
          </div>
        </CardHeader>
      </Card>
      {/* --- Advanced Feature: Active Users Widget --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl hover:shadow-lg transition-shadow bg-gradient-to-tr from-primary/10 to-accent/10 border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <User className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">1,234</div>
            <span className="text-xs text-muted-foreground">in the last 5 minutes</span>
          </CardContent>
        </Card>
      </div>
      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        <Card className="rounded-2xl hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalVisitors.toLocaleString("en-US")}</div>
            <TrendIndicator change={data.overview.visitorsChange} />
          </CardContent>
        </Card>
        <Card className="rounded-2xl hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalPageViews.toLocaleString("en-US")}</div>
            <TrendIndicator change={data.overview.pageViewsChange} />
          </CardContent>
        </Card>
        <Card className="rounded-2xl hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.bounceRate}</div>
            <TrendIndicator change={data.overview.bounceRateChange} />
          </CardContent>
        </Card>
        <Card className="rounded-2xl hover:shadow-lg transition-shadow">
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
        <Card className="rounded-2xl hover:shadow-lg transition-shadow lg:col-span-2">
          <CardHeader>
            <CardTitle>Visitors This Week</CardTitle>
            <CardDescription>Daily visitor count trend.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2 h-[350px]">
            {data.trafficByDay && data.trafficByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trafficByDay} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A7C7E7" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#B5EAD7" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#b0b0b0" 
                    fontSize={14} 
                    tickLine={false} 
                    axisLine={false} 
                    style={{ fontWeight: 500 }}
                  />
                  <YAxis 
                    stroke="#b0b0b0" 
                    fontSize={14} 
                    tickLine={false} 
                    axisLine={false} 
                    style={{ fontWeight: 500 }}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip 
                     contentStyle={{ backgroundColor: "#fff", border: "1px solid #e0e0e0", borderRadius: "8px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
                     cursor={{ strokeDasharray: '3 3', stroke: '#A7C7E7' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="#A7C7E7"
                    strokeWidth={3} 
                    activeDot={{ r: 10, fill: '#B5EAD7', stroke: '#A7C7E7', strokeWidth: 3, filter: 'drop-shadow(0 2px 8px #A7C7E7)' }}
                    dot={false}
                    isAnimationActive={true}
                  />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    stroke="none"
                    fill="url(#colorVisitors)"
                    fillOpacity={1}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-10">No traffic data available.</p>
            )}
          </CardContent>
        </Card>

        {/* Traffic Sources - Span 1 column */}
        <Card className="rounded-2xl hover:shadow-lg transition-shadow lg:col-span-1">
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
                    innerRadius={38}
                    outerRadius={70}
                    paddingAngle={4}
                    fill="#A7C7E7"
                    dataKey="percentage"
                    nameKey="source"
                    label={false}
                    isAnimationActive={true}
                  >
                    {data.trafficSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PASTEL_COLORS[index % PASTEL_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 13, fontWeight: 500 }}/>
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
        <Card className="rounded-2xl hover:shadow-lg transition-shadow lg:col-span-2">
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
                       <TableCell className="font-medium">
                         <a href={page.path} target="_blank" rel="noopener noreferrer" className="hover:underline">
                           {page.path}
                         </a>
                       </TableCell>
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
         <Card className="rounded-2xl hover:shadow-lg transition-shadow lg:col-span-1">
           <CardHeader>
             <CardTitle>Device Usage</CardTitle>
             <CardDescription>Users by device type.</CardDescription>
           </CardHeader>
           <CardContent>
             {data.deviceUsage && data.deviceUsage.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.deviceUsage} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                    <XAxis type="number" hide />
                    <YAxis 
                       dataKey="device" 
                       type="category" 
                       width={70}
                       tickLine={false} 
                       axisLine={false} 
                       stroke="#b0b0b0" 
                       fontSize={14} 
                       style={{ fontWeight: 500 }}
                     />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }} cursor={{fill: '#A7C7E7', opacity: 0.12}}/>
                    <Bar dataKey="percentage" name="%" radius={10} barSize={28} isAnimationActive={true}>
                       {data.deviceUsage.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={PASTEL_COLORS[index % PASTEL_COLORS.length]} />
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
        <Card className="rounded-2xl hover:shadow-lg transition-shadow lg:col-span-3"> {/* Span full width on large screens */} 
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