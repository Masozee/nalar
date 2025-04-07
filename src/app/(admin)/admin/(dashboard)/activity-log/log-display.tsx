"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Badge
} from "@/components/ui/badge";
import {
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
import { useState } from "react"; // For potential future pagination/filtering

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

interface LogDisplayProps {
  initialLogs: ActivityLogEntry[];
}

// Map actions/entity types to icons and badges
const activityConfig: { [key: string]: { icon: React.ElementType, color: string } } = {
  Edited: { icon: Edit3, color: "blue" },
  Created: { icon: PlusCircle, color: "green" },
  Deleted: { icon: Trash2, color: "red" },
  LoggedIn: { icon: LogIn, color: "purple" },
  Downloaded: { icon: Download, color: "gray" },
  Publication: { icon: FileText, color: "orange" },
  Expert: { icon: User, color: "teal" },
  Event: { icon: History, color: "indigo" },
  User: { icon: User, color: "pink" },
  Default: { icon: History, color: "gray" },
};

// Helper to get initials for Avatar
const getInitials = (name: string) => {
  if (!name) return "?";
  const parts = name.split(/[@ ]/); 
  if (parts.length === 1) return name.substring(0, 2).toUpperCase();
  return parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
};

// Helper to format timestamp
const formatTimestamp = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch (e) {
    return timestamp; // Fallback
  }
};


export function LogDisplay({ initialLogs }: LogDisplayProps) {
  // State for logs (e.g., for filtering/loading more in the future)
  const [logs, setLogs] = useState(initialLogs);

  console.log("Activity Logs Received in Client Component:", logs);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <History className="mr-2 h-5 w-5" />
          Activity Log
        </CardTitle>
        <CardDescription>
          Recent administrative actions and system events.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs && logs.length > 0 ? (
          <div className="space-y-4">
            {logs.map((log) => {
              const ActionIcon = activityConfig[log.action]?.icon ?? activityConfig.Default.icon;
              const EntityIcon = activityConfig[log.entityType]?.icon ?? activityConfig.Default.icon;
              const actionColor = `bg-${activityConfig[log.action]?.color ?? activityConfig.Default.color}-100 text-${activityConfig[log.action]?.color ?? activityConfig.Default.color}-700`;
              const entityColor = `bg-${activityConfig[log.entityType]?.color ?? activityConfig.Default.color}-100 text-${activityConfig[log.entityType]?.color ?? activityConfig.Default.color}-700`;

              return (
                <div key={log.id} className="flex items-center space-x-4 border-b pb-4 last:border-b-0 last:pb-0">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{getInitials(log.user)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      <span className="font-semibold">{log.user}</span>
                      <Badge variant="outline" className={`ml-2 px-1.5 py-0.5 text-xs font-normal ${actionColor}`}>
                         <ActionIcon className="mr-1 h-3 w-3" /> {log.action}
                      </Badge>
                      <span className="ml-1">{log.entityTitle ?? log.entityType ?? "an item"}</span>
                      {log.entityType && (
                        <Badge variant="outline" className={`ml-1 px-1.5 py-0.5 text-xs font-normal ${entityColor}`}>
                            <EntityIcon className="mr-1 h-3 w-3" /> {log.entityType}
                        </Badge>
                      )}
                    </p>
                    {log.details && (
                       <p className="text-xs text-muted-foreground">{log.details}</p>
                     )}
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
                    {formatTimestamp(log.timestamp)}
                  </div>
                </div>
              );
            })}
            {/* Placeholder for future pagination */} 
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-10">
            No activity recorded.
          </p>
        )}
      </CardContent>
    </Card>
  );
} 