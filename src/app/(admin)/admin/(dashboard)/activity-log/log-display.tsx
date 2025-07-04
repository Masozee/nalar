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

  // Pastel accent color palette for timeline
  const pastelAccent = "#A7C7E7";
  const pastelBg = "bg-[#F8FAFC]";

  return (
    <Card className="shadow-xl border-0 bg-white/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-primary">
          <History className="h-6 w-6 text-[#A7C7E7]" />
          Activity Log
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          Recent administrative actions and system events.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs && logs.length > 0 ? (
          <ol className="relative border-l-4 border-[#A7C7E7]/30 ml-2 pl-6 space-y-8">
            {logs.map((log, idx) => {
              const ActionIcon = activityConfig[log.action]?.icon ?? activityConfig.Default.icon;
              const EntityIcon = activityConfig[log.entityType]?.icon ?? activityConfig.Default.icon;
              const actionColor = `text-${activityConfig[log.action]?.color ?? activityConfig.Default.color}-500`;
              const entityColor = `text-${activityConfig[log.entityType]?.color ?? activityConfig.Default.color}-400`;
              return (
                <li
                  key={log.id}
                  className={`group flex items-start gap-4 ${idx !== logs.length - 1 ? "pb-6" : ""}`}
                >
                  {/* Timeline dot */}
                  <span className="absolute -left-4 flex items-center justify-center w-8 h-8 rounded-full shadow bg-white border-2 border-[#A7C7E7]/70">
                    <ActionIcon className={`w-5 h-5 ${actionColor}`} />
                  </span>
                  {/* Card for log entry */}
                  <div
                    className={`flex-1 rounded-2xl px-5 py-4 shadow-md bg-white/90 border border-[#A7C7E7]/10 transition-transform group-hover:scale-[1.015] group-hover:shadow-lg`}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <Avatar className="h-10 w-10 shadow border-2 border-[#A7C7E7]/40">
                        <AvatarFallback>{getInitials(log.user)}</AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-base text-primary">{log.user}</span>
                      <span className={`ml-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#A7C7E7]/20 text-xs font-semibold ${actionColor}`}> 
                        <ActionIcon className="w-4 h-4" /> {log.action}
                      </span>
                      {log.entityType && (
                        <span className={`ml-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#A7C7E7]/10 text-xs font-medium ${entityColor}`}>
                          <EntityIcon className="w-4 h-4" /> {log.entityType}
                        </span>
                      )}
                    </div>
                    <div className="mb-1">
                      <span className="text-sm text-gray-700">
                        {log.entityTitle ?? log.entityType ?? "an item"}
                      </span>
                    </div>
                    {log.details && (
                      <div className="text-xs text-gray-500 mb-1">{log.details}</div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-400">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="text-center text-muted-foreground py-10">
            No activity recorded.
          </p>
        )}
      </CardContent>
    </Card>
  );
}