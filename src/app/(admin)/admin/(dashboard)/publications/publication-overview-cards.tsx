"use client";

import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download, PlusCircle, Users } from 'lucide-react'; // Assuming these icons might be useful

interface PublicationStat {
  id: string;
  views: number;
  downloads: number;
}

interface PublicationOverviewCardsProps {
  stats: PublicationStat[];
}

export function PublicationOverviewCards({ stats }: PublicationOverviewCardsProps) {

  const totalViews = useMemo(() => {
    return stats.reduce((sum, stat) => sum + stat.views, 0);
  }, [stats]);

  const totalDownloads = useMemo(() => {
    return stats.reduce((sum, stat) => sum + stat.downloads, 0);
  }, [stats]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
      <Card className="flex flex-col justify-between">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center justify-between">
            Total Views
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalViews.toLocaleString("en-US")}</div>
          <p className="text-xs text-muted-foreground">All time page views</p>
        </CardContent>
        {/* Optional action button */}
        {/* <Button size="sm" variant="outline" className="m-4 mt-auto">View Details</Button> */}
      </Card>
      <Card className="flex flex-col justify-between">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center justify-between">
             Total Downloads
             <Download className="h-4 w-4 text-muted-foreground" />
           </CardTitle>
        </CardHeader>
        <CardContent>
           <div className="text-2xl font-bold">{totalDownloads.toLocaleString("en-US")}</div>
           <p className="text-xs text-muted-foreground">All time file downloads</p>
         </CardContent>
       </Card>
     </div>
   );
 } 