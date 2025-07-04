import * as React from "react";

export function EventList({ events }: { events: any[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide">Title</th>
            <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide">Start Date</th>
            <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide">End Date</th>
            <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide">Location</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {events.map((event) => (
            <tr key={event.id}>
              <td className="px-4 py-2 font-medium">{event.title}</td>
              <td className="px-4 py-2">{event.date_start}</td>
              <td className="px-4 py-2">{event.date_end}</td>
              <td className="px-4 py-2">{event.location || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
