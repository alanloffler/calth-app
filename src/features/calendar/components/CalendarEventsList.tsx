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
    enabled: !!professionalId,
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
  const colors = {
    absent: "bg-amber-600",
    cancelled: "bg-red-600",
    in_progress: "bg-fuchsia-600",
    pending: "bg-neutral-600",
    present: "bg-green-600",
  };

  return (
    <li>
      <button
        className="hover:bg-muted/50 flex w-full items-center gap-2 border-b px-2 py-1 text-xs"
        onClick={() => console.log(event.title)}
      >
        <div className={cn("size-1.5 shrink-0 rounded-full", colors[event.status])}></div>
        <span className="min-w-8.75">{formatShortDate(event.startDate, es)}</span>
        <span className="truncate">{event.title}</span>
      </button>
    </li>
  );
}
