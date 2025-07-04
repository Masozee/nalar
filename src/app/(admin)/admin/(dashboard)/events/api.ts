export interface Event {
  id: number;
  title: string;
  description?: string;
  date_start: string;
  date_end: string;
  location?: string;
  publish?: boolean;
  speaker?: any[];
  slug?: string;
}

export interface EventAggregations {
  total_count: number;
  total_attendance?: number;
  total_sessions?: number;
}

export interface EventsApiResponse {
  results: Event[];
  aggregations?: EventAggregations;
  count?: number;
  next?: string | null;
  previous?: string | null;
}

export async function fetchEvents(params: Record<string, any> = {}): Promise<EventsApiResponse> {
  const url = new URL(`${process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/events/`);
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => url.searchParams.append(key, v));
    } else if (value !== undefined && value !== "") {
      url.searchParams.append(key, value);
    }
  });
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch events");
  return await res.json();
}
