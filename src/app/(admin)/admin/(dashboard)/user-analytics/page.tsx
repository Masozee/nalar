import fs from "fs";
import path from "path";
import { UserChart } from "./user-chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Import Card for other stats
import { Users } from "lucide-react";

interface UserStats {
  registrationsByDay: { day: string; newUsers: number }[];
  totalUsers: number;
  activeUsers: number;
}

// Fetch User Stats
async function getUserStats(): Promise<UserStats> {
  const dataFilePath = path.join(process.cwd(), "data", "user-stats.json");
  try {
    const jsonData = fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(jsonData);
  } catch (error) {
    console.error("Error reading user stats:", error);
    return { registrationsByDay: [], totalUsers: 0, activeUsers: 0 }; // Default
  }
}

// Server Component for the page
export default async function UserAnalyticsPage() {
  const userStats = await getUserStats();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 md:gap-8 md:p-8">
      {/* Optional: Add overview cards */}
       <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4"> 
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Total Users</CardTitle>
             <Users className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{userStats.totalUsers.toLocaleString("en-US")}</div>
             {/* Trend indicator could be added here if data includes it */}
           </CardContent>
         </Card>
         {/* Add Active Users Card if needed */}
       </div>

      {/* Render the client chart component */}
      <UserChart stats={userStats} />
    </div>
  );
} 