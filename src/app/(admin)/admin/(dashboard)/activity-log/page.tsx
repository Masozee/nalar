import fs from "fs";
import path from "path";
import { LogDisplay } from "./log-display";

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

// Server Component for the page
export default async function ActivityLogPage() {
  const activityLog = await getActivityLog();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 md:gap-8 md:p-8">
      {/* Render the client log display component */}
      <LogDisplay initialLogs={activityLog} />
    </div>
  );
} 