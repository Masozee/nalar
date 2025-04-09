/**
 * Calculate the number of days remaining until a given date
 */
export function getDaysRemaining(dateString: string): number {
  const eventDate = new Date(dateString);
  const today = new Date();
  
  // Set both dates to midnight for accurate day calculation
  eventDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = Math.abs(eventDate.getTime() - today.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

/**
 * Calculate months between two dates
 */
export function getMonthsBetween(startDate: Date, endDate: Date): number {
  return (
    endDate.getMonth() - 
    startDate.getMonth() + 
    12 * (endDate.getFullYear() - startDate.getFullYear())
  );
}

/**
 * Check if an event is upcoming
 */
export function isUpcomingEvent(dateString: string): boolean {
  const eventDate = new Date(dateString);
  const now = new Date();
  return eventDate >= now;
}

/**
 * Group events by month/year
 */
export function groupEventsByMonth(events: any[]): Record<string, any[]> {
  const grouped: Record<string, any[]> = {};
  
  events.forEach(event => {
    const date = new Date(event.date);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (!grouped[key]) {
      grouped[key] = [];
    }
    
    grouped[key].push(event);
  });
  
  return grouped;
} 