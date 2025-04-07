import fs from "fs";
import path from "path";
import { EventsTable } from "./events-table";
import { EventStatusChart } from "./event-status-chart";
import { UpcomingEventsChart } from "./upcoming-events-chart";
import { EventAttendanceChart } from "./event-attendance-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar } from "lucide-react";

// Define Event interface
interface Speaker {
  name: string;
  affiliation: string;
}

interface Event {
  id: string;
  slug: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: string;
  description: string;
  imageUrl: string;
  speakers: Speaker[];
  registrationLink: string;
}

// --- Data Fetching ---
async function getEvents(): Promise<Event[]> {
  const dataFilePath = path.join(process.cwd(), "data", "events.json");
  try {
    const jsonData = fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(jsonData);
  } catch (error) {
    console.error("Error reading events list:", error);
    return [];
  }
}
// --- End Data Fetching ---

// Helper function to calculate event stats from events data
function calculateEventStats(events: Event[]) {
  const now = new Date();
  const pastEvents = events.filter(event => new Date(event.date) < now);
  const upcomingEvents = events.filter(event => new Date(event.date) >= now);

  // Create a map of event types and their counts
  const typeMap = new Map<string, number>();
  events.forEach(event => {
    const count = typeMap.get(event.type) || 0;
    typeMap.set(event.type, count + 1);
  });

  // Get upcoming events for the next 30 days
  const next30Days = new Date();
  next30Days.setDate(next30Days.getDate() + 30);
  const next30DaysEvents = upcomingEvents.filter(
    event => new Date(event.date) <= next30Days
  );

  return {
    totalEvents: events.length,
    pastEvents: pastEvents.length,
    upcomingEvents: upcomingEvents.length,
    upcomingNext30Days: next30DaysEvents.length,
    eventTypes: Object.fromEntries(typeMap.entries()),
  };
}

// Server Component for the page
export default async function EventsPage() {
  // Fetch data
  const events = await getEvents();
  
  // Calculate statistics
  const eventStats = calculateEventStats(events);
  
  // Sort events with upcoming events first, then past events by date descending
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    const now = new Date();
    
    // Both upcoming or both past - sort by date (ascending for upcoming, descending for past)
    if ((dateA >= now && dateB >= now) || (dateA < now && dateB < now)) {
      return dateA >= now 
        ? dateA.getTime() - dateB.getTime() // Upcoming: ascending
        : dateB.getTime() - dateA.getTime(); // Past: descending
    }
    
    // One upcoming, one past - upcoming comes first
    return dateA >= now ? -1 : 1;
  });

  return (
    <div className="flex flex-1 flex-col space-y-6 p-6 md:p-8 bg-background">
      {/* Page Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Events Dashboard</h2>
          <p className="text-muted-foreground mt-1">Manage and monitor all your events in one place</p>
        </div>
        <Button className="mt-4 sm:mt-0" size="default">
          <PlusCircle className="mr-2 h-4 w-4" /> Create Event
        </Button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4 flex flex-col">
            <p className="text-muted-foreground text-sm font-medium">Total Events</p>
            <h3 className="text-3xl font-bold mt-1">{eventStats.totalEvents}</h3>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4 flex flex-col">
            <p className="text-muted-foreground text-sm font-medium">Upcoming</p>
            <h3 className="text-3xl font-bold mt-1 text-primary">{eventStats.upcomingEvents}</h3>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4 flex flex-col">
            <p className="text-muted-foreground text-sm font-medium">Past Events</p>
            <h3 className="text-3xl font-bold mt-1 text-secondary">{eventStats.pastEvents}</h3>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4 flex flex-col">
            <p className="text-muted-foreground text-sm font-medium">Next 30 Days</p>
            <h3 className="text-3xl font-bold mt-1 text-green-500">{eventStats.upcomingNext30Days}</h3>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
        <Card className="overflow-hidden border bg-card shadow-sm">
          <CardHeader className="px-6 py-4 border-b bg-muted/10">
            <CardTitle className="text-lg font-semibold">Event Status</CardTitle>
            <CardDescription>Distribution of past and upcoming events</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <EventStatusChart 
              stats={{
                total: eventStats.totalEvents,
                upcoming: eventStats.upcomingEvents,
                past: eventStats.pastEvents
              }} 
            />
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border bg-card shadow-sm">
          <CardHeader className="px-6 py-4 border-b bg-muted/10">
            <CardTitle className="text-lg font-semibold">Upcoming Events</CardTitle>
            <CardDescription>Days until next events</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <UpcomingEventsChart 
              events={events.filter(e => new Date(e.date) >= new Date())
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)} 
            />
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border bg-card shadow-sm">
          <CardHeader className="px-6 py-4 border-b bg-muted/10">
            <CardTitle className="text-lg font-semibold">Event Attendance</CardTitle>
            <CardDescription>Attendance at recent events</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <EventAttendanceChart 
              events={events.filter(e => new Date(e.date) < new Date())
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)} 
            />
          </CardContent>
        </Card>
      </div>

      {/* Events Table Section */}
      <Card className="overflow-hidden border shadow-sm bg-card">
        <CardHeader className="px-6 py-4 border-b bg-muted/10 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Events List
            </CardTitle>
            <CardDescription>
              Manage events, speakers, and registrations
            </CardDescription>
          </div>
          <Button size="sm" variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Event
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <EventsTable events={sortedEvents} />
        </CardContent>
      </Card>
    </div>
  );
} 