import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Link as LinkIcon, User } from "lucide-react";
import Image from "next/image";

export function EventCard({ event }: { event: any }) {
  const isPast = !!event.is_past_due;
  const eventDate = event.tgl || `${event.date_start}${event.date_end && event.date_end !== event.date_start ? ` - ${event.date_end}` : ""}`;
  const eventTime = event.time_start ? `${event.time_start.slice(0,5)}${event.time_end ? ` - ${event.time_end.slice(0,5)}` : ""}` : null;
  const speakers = event.speaker || [];
  const topics = event.topic || [];
  const eventLink = event.link;
  const imageUrl = event.image;

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 rounded-2xl flex flex-col h-full">
      {imageUrl && (
        <div className="relative aspect-[3/4] w-full bg-muted rounded-t-2xl overflow-hidden p-0 m-0">
          <Image
            src={imageUrl}
            alt={event.title}
            fill
            className="object-contain w-full h-full rounded-t-2xl p-0 m-0"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority={false}
          />
          {isPast && (
            <Badge className="absolute top-2 left-2 bg-gray-900/80 text-white rounded-full px-3 py-1">Past Event</Badge>
          )}
        </div>
      )}
      <div className="flex-1 flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold leading-tight line-clamp-2 mb-1">{event.title}</CardTitle>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{eventDate}</span>
            {eventTime && <span className="flex items-center gap-1"><User className="h-4 w-4" />{eventTime}</span>}
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex flex-col justify-end">
          {/* Speakers and Event Link Row */}
          {(speakers.length > 0 || eventLink) && (
            <div className="flex items-center justify-between gap-2 mt-2 mb-2">
              {/* Stacked Speaker Avatars */}
              <div className="flex items-center -space-x-3">
                {speakers.slice(0, 5).map((sp: any, idx: number) => (
                  <Image
                    key={sp.id}
                    src={sp.profile_img || "/placeholder-avatar.png"}
                    alt={sp.name}
                    width={36}
                    height={36}
                    className={`rounded-full object-cover border-2 border-white shadow-sm ${idx !== 0 ? 'z-10' : ''}`}
                    style={{ zIndex: 10 - idx }}
                  />
                ))}
                {speakers.length > 5 && (
                  <span className="ml-2 text-xs text-muted-foreground">+{speakers.length - 5} more</span>
                )}
              </div>
              {/* Event Link */}
              {eventLink && (
                <a href={eventLink} target="_blank" rel="noopener noreferrer" className="ml-auto">
                  <Button variant="outline" size="icon" className="rounded-full w-9 h-9 flex items-center justify-center">
                    <LinkIcon className="h-5 w-5" />
                  </Button>
                </a>
              )}
            </div>
          )}
          {/* Location Row */}
          {event.location && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1 ml-0.5 pl-0.5" style={{ fontSize: '0.85em' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 10c-4.418 0-8-6.268-8-10A8 8 0 0112 3a8 8 0 018 8c0 3.732-3.582 10-8 10z" /></svg>
              <span>{event.location}</span>
            </div>
          )}
          {/* Topic Tags at Bottom */}
          {topics.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {topics.map((topic: any) => (
                <Badge key={topic.id} variant="outline" className="text-xs px-2 py-1 bg-blue-50 border-blue-200 text-blue-800 rounded-full">
                  {topic.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
