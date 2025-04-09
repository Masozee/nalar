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
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Calendar, BarChart, Users, Layers, Clock, ArrowUpRight, Download, PencilLine, MapPin } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "./utils";

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

  // Calculate percentage change in events (compare to previous period)
  const pastHalfYear = [...pastEvents].filter(event => {
    const eventDate = new Date(event.date);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return eventDate >= sixMonthsAgo;
  });

  // Get the upcoming event with nearest date
  const nextEvent = upcomingEvents.length > 0 
    ? upcomingEvents.reduce((nearest, event) => 
        new Date(event.date) < new Date(nearest.date) ? event : nearest
      )
    : null;

  return {
    totalEvents: events.length,
    pastEvents: pastEvents.length,
    upcomingEvents: upcomingEvents.length,
    upcomingNext30Days: next30DaysEvents.length,
    eventTypes: Object.fromEntries(typeMap.entries()),
    pastHalfYearEvents: pastHalfYear.length,
    nextEvent,
    eventTypeBreakdown: Array.from(typeMap.entries()).map(([type, count]) => ({
      name: type,
      value: count
    })),
  };
}

// Calculate days remaining until an event
function getDaysRemaining(dateString: string): number {
  const eventDate = new Date(dateString);
  const today = new Date();
  
  // Set both dates to midnight for accurate day calculation
  eventDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = Math.abs(eventDate.getTime() - today.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
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

  // Get next upcoming event details if available
  const nextEvent = eventStats.nextEvent;
  const daysRemaining = nextEvent ? getDaysRemaining(nextEvent.date) : 0;

  return (
    <div className="flex flex-1 flex-col space-y-4 p-4 md:p-5 bg-background">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3 mb-1">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Events Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage and monitor all of your event operations in one place</p>
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" /> View Calendar
          </Button>
          <Button size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> Create Event
          </Button>
        </div>
      </div>
      
      {/* Tabs for Dashboard Views */}
      <Tabs defaultValue="overview" className="space-y-3">
        <TabsList className="bg-muted/70">
          <TabsTrigger value="overview" className="flex items-center gap-1 data-[state=active]:bg-background">
            <Layers className="h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1 data-[state=active]:bg-background">
            <BarChart className="h-4 w-4" /> Analytics
          </TabsTrigger>
          <TabsTrigger value="events-list" className="flex items-center gap-1 data-[state=active]:bg-background">
            <Calendar className="h-4 w-4" /> All Events
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-3 mt-2">
          {/* Summary Cards - Top Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-4">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-3 pt-0 px-4">
                <div className="text-2xl font-bold">{eventStats.totalEvents}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Lifetime events organized
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-4">
                <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-3 pt-0 px-4">
                <div className="text-2xl font-bold text-primary">{eventStats.upcomingEvents}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {eventStats.upcomingNext30Days} events in the next 30 days
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-4">
                <CardTitle className="text-sm font-medium">Past Events</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-3 pt-0 px-4">
                <div className="text-2xl font-bold">{eventStats.pastEvents}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {eventStats.pastHalfYearEvents} in the last 6 months
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-4">
                <CardTitle className="text-sm font-medium">Total Speakers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-3 pt-0 px-4">
                <div className="text-2xl font-bold">
                  {events.reduce((total, event) => total + event.speakers.length, 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all events
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Next Event & Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Next Event Card */}
            <Card className={`shadow-sm ${nextEvent ? 'bg-primary/5 border-primary/20' : ''}`}>
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-5 w-5" />
                  Coming Up Next
                </CardTitle>
                <CardDescription>
                  {nextEvent ? `In ${daysRemaining} days` : 'No upcoming events scheduled'}
                </CardDescription>
              </CardHeader>
              
              {nextEvent && (
                <>
                  <CardContent className="space-y-3 pt-0 px-4">
                    <div>
                      <h3 className="font-semibold text-lg text-primary">{nextEvent.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {nextEvent.description}
                      </p>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{formatDate(nextEvent.date)} at {nextEvent.time}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="truncate">{nextEvent.location}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{nextEvent.speakers.length} speaker{nextEvent.speakers.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-0 px-4 pb-3 flex gap-2">
                    <Button variant="default" size="sm" className="flex-1" asChild>
                      <Link href={`/admin/events/${nextEvent.id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <PencilLine className="h-4 w-4 mr-2" /> Edit
                    </Button>
                  </CardFooter>
                </>
              )}
              
              {!nextEvent && (
                <CardContent className="h-[160px] flex items-center justify-center px-4">
                  <div className="flex flex-col items-center text-center gap-2">
                    <p className="text-muted-foreground text-sm">No upcoming events planned</p>
                    <Button variant="default" size="sm">
                      <PlusCircle className="mr-2 h-4 w-4" /> Schedule an Event
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
            
            {/* Event Distribution Chart */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-base">Event Distribution</CardTitle>
                <CardDescription>Upcoming vs. past events</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-2">
                <EventStatusChart 
                  stats={{
                    total: eventStats.totalEvents,
                    upcoming: eventStats.upcomingEvents,
                    past: eventStats.pastEvents
                  }} 
                />
              </CardContent>
            </Card>

            {/* Recent Activity Card */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-base">Recent Activity</CardTitle>
                <CardDescription>Latest event updates</CardDescription>
              </CardHeader>
              <CardContent className="px-4 py-2">
                <div className="space-y-3">
                  {/* Simulated activity feed */}
                  <div className="flex items-start gap-3">
                    <div className="bg-muted rounded-full p-1.5 mt-0.5">
                      <PlusCircle className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">New event created</p>
                      <p className="text-xs text-muted-foreground">
                        {events[0]?.title || "Annual Conference"} was added
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-muted rounded-full p-1.5 mt-0.5">
                      <Users className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Speakers updated</p>
                      <p className="text-xs text-muted-foreground">
                        2 speakers added to {events[1]?.title || "Tech Summit"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Yesterday</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-muted rounded-full p-1.5 mt-0.5">
                      <PencilLine className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Event edited</p>
                      <p className="text-xs text-muted-foreground">
                        {events[2]?.title || "Workshop Series"} was updated
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">2 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-3 px-4">
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  View All Activity
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card className="shadow-sm">
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-base">Upcoming Events Timeline</CardTitle>
                <CardDescription>Days until next scheduled events</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-2">
                <UpcomingEventsChart 
                  events={events.filter(e => new Date(e.date) >= new Date())
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, 5)} 
                />
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-base">Past Event Attendance</CardTitle>
                <CardDescription>Attendance statistics for recent events</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-2">
                <EventAttendanceChart 
                  events={events.filter(e => new Date(e.date) < new Date())
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 5)} 
                />
              </CardContent>
            </Card>
          </div>

          {/* Event Type Breakdown */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-base">Event Types</CardTitle>
              <CardDescription>Distribution of events by category</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(eventStats.eventTypes).map(([type, count]) => (
                  <div key={type} className="flex flex-col items-center p-3 rounded-lg border bg-card">
                    <Badge variant="outline" className="mb-2">
                      {type}
                    </Badge>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round((count as number / eventStats.totalEvents) * 100)}% of total
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-3 mt-2">
          <Card className="shadow-sm">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle>Event Analytics</CardTitle>
              <CardDescription>Detailed metrics and performance data</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="h-[60vh] flex items-center justify-center border rounded-md bg-muted/5">
                <p className="text-muted-foreground">Analytics dashboard will be implemented in the next release</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Events List Tab */}
        <TabsContent value="events-list" className="space-y-3 mt-2">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3 px-4">
              <div>
                <CardTitle className="text-base">All Events</CardTitle>
                <CardDescription>Manage your events and perform batch operations</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Event
                </Button>
              </div>
            </CardHeader>
            <div className="rounded-b-lg">
              <EventsTable events={sortedEvents || events} />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 