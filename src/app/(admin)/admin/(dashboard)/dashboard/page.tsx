import fs from "fs"; // Correct import syntax for fs
import path from "path";
import { TrafficCharts } from "./traffic-charts"; // Import the new client component

// Define the structure of our data (can be shared or redefined)
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

// Define ActivityLog interface
interface ActivityLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entityType: string;
  entityId: string | null;
  entityTitle: string | null;
  details: string | null;
}

// --- Data Fetching (Server-Side) ---
async function getTrafficData(): Promise<TrafficData> {
  const dataFilePath = path.join(process.cwd(), "data", "traffic-data.json");
  try {
    const jsonData = fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(jsonData);
  } catch (error) {
    console.error("Error reading traffic data:", error);
    // Return default structure on error to prevent breaking the client component
    return {
      overview: { totalVisitors: 0, totalPageViews: 0, bounceRate: "0%", avgVisitDuration: "0m 0s", visitorsChange: "0%", pageViewsChange: "0%", bounceRateChange: "0%", avgVisitDurationChange: "0m 0s" },
      trafficByDay: [],
      trafficSources: [],
      topPages: [],
      deviceUsage: [],
    };
  }
}

// Fetch Publication Stats
async function getPublicationStats(): Promise<PublicationStat[]> {
  const dataFilePath = path.join(process.cwd(), "data", "publication-stats.json");
  try {
    const jsonData = fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(jsonData);
  } catch (error) {
    console.error("Error reading publication stats:", error);
    return []; // Return empty array on error
  }
}

// Fetch Activity Log
async function getActivityLog(): Promise<ActivityLogEntry[]> {
  const dataFilePath = path.join(process.cwd(), "data", "activity-log.json");
  try {
    const jsonData = fs.readFileSync(dataFilePath, "utf-8");
    // Sort logs by timestamp descending (most recent first)
    const logs: ActivityLogEntry[] = JSON.parse(jsonData);
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return logs;
  } catch (error) {
    console.error("Error reading activity log:", error);
    return [];
  }
}

// Server Component
export default async function DashboardPage() {
  // Fetch only needed datasets
  const [trafficData, publicationStats] = await Promise.all([
    getTrafficData(),
    getPublicationStats(),
  ]);

  return (
    <>
      {/* Pass only relevant props */}
      <TrafficCharts 
        data={trafficData} 
        publicationStats={publicationStats} 
      />
    </>
  );
}
