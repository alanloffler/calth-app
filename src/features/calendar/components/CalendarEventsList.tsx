import { es } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";

import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";
import { EventsService } from "@event/services/events.service";
import { cn } from "@lib/utils";
import { formatShortDate } from "@core/formatters/date.formatter";

interface IProps {
  className?: string;
  professionalId: string;
}

export function CalendarEventsList({ className, professionalId }: IProps) {
  const { data: events } = useQuery({
    queryKey: ["events", professionalId],
    queryFn: () => EventsService.findEventsFiltered({ professionalId }, 10),
  });

  return (
    <div className={cn("flex flex-col rounded-lg border", className)}>
      <h2 className="bg-muted rounded-t-lg border-b px-2 py-2 text-sm font-semibold">Lista de turnos</h2>
      <ul>
        {events?.data?.result.map((event) => (
          <EventItem key={event.id} event={event} />
        ))}
      </ul>
    </div>
  );
}

function EventItem({ event }: { event: ICalendarEvent }) {
  return (
    <li className="flex gap-2 border-b px-2 py-1 text-xs">
      <span className="min-w-8.75">{formatShortDate(event.startDate, es)}</span>
      <span className="truncate">{event.title}</span>
    </li>
  );
}
