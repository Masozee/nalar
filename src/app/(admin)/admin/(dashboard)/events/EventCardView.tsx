import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Edit2, Eye } from "lucide-react";

export interface Event {
  id: string;
  slug: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: string;
  description: string;
  imageUrl: string;
  speakers: { name: string; affiliation: string }[];
  registrationLink: string;
}

interface EventCardViewProps {
  events: Event[];
}

export const EventCardView: React.FC<EventCardViewProps> = ({ events }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
    {events.map(event => (
      <Card key={event.id} className="flex flex-col h-full p-0 rounded-2xl overflow-hidden">
        <div className="relative aspect-[3/4] w-full bg-muted rounded-t-2xl overflow-hidden p-0 m-0">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="object-cover w-full h-full rounded-t-2xl p-0 m-0"
            style={{ display: 'block' }}
          />
          {/* Optionally, add a badge overlay here if needed */}
        </div>
        <CardHeader className="p-0 px-6 pb-2 pt-4 bg-transparent">
          <CardTitle className="truncate">{event.title}</CardTitle>
          <CardDescription className="flex items-center gap-2 text-sm mt-1">
            <Calendar size={16} /> {event.date} &bull; <MapPin size={16} /> {event.location}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pt-0 px-6">
          <div className="text-xs text-muted-foreground mb-2">
            {event.type} &middot; {event.speakers.length} speakers
          </div>
          <div className="line-clamp-3 text-sm mb-3">{event.description}</div>
          <div className="flex gap-2 mt-auto">
            <Button size="sm" variant="outline" asChild>
              <a href={event.registrationLink} target="_blank" rel="noopener noreferrer">
                <Eye size={16} className="mr-1" /> View
              </a>
            </Button>
            <Button size="sm" variant="secondary">
              <Edit2 size={16} className="mr-1" /> Edit
            </Button>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);
