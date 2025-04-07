import fs from "fs";
import path from "path";
import { PublicationTable } from "./publication-table";
import { PublicationStatusChart } from "./publication-status-chart";
import { PublicationMetricsChart } from "./publication-metrics-chart";
import { DailyMetricsCard } from "./daily-metrics-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText } from "lucide-react";

// Define Publication interface
interface Publication {
  id: string;
  title: string;
  authors: string[];
  publishDate: string;
  status: string;
  abstract: string;
}

// Define PublicationStats interface
interface PublicationStat {
  id: string;
  views: number;
  downloads: number;
  viewsChange: string;
  downloadsChange: string;
}

// --- Data Fetching ---
async function getPublications(): Promise<Publication[]> {
  const dataFilePath = path.join(process.cwd(), "data", "publications-list.json");
  try {
    const jsonData = fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(jsonData);
  } catch (error) {
    console.error("Error reading publications list:", error);
    return [];
  }
}

async function getPublicationStats(): Promise<PublicationStat[]> {
  const dataFilePath = path.join(process.cwd(), "data", "publication-stats.json");
  try {
    const jsonData = fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(jsonData);
  } catch (error) {
    console.error("Error reading publication stats:", error);
    return [];
  }
}
// --- End Data Fetching ---

// Server Component for the page
export default async function PublicationsPage() {
  // Fetch data in parallel
  const [publications, publicationStats] = await Promise.all([
    getPublications(),
    getPublicationStats(),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 md:gap-8 md:p-8">
       {/* Top Row: Status, Metrics, Daily Charts */}
       <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
         {/* Publication Status Chart */}
         <div className="lg:col-span-1">
            <PublicationStatusChart publications={publications} />
         </div>
         {/* Publication Metrics Chart (Bar) */}
         <div className="lg:col-span-1">
           <PublicationMetricsChart stats={publicationStats} />
         </div>
         {/* Daily Metrics Card (Area) */}
         <div className="lg:col-span-1">
           <DailyMetricsCard />
         </div>
       </div>

       {/* Bottom Section: Filters and Table */}
       <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
               <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                   Publications List
               </CardTitle>
               <CardDescription>
                  Search, filter, and view publication details.
               </CardDescription>
             </div>
             <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Publication
             </Button>
           </CardHeader>
           <CardContent>
              <PublicationTable publications={publications} stats={publicationStats} />
           </CardContent>
         </Card>
    </div>
  );
} 