import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";
import { EventsService } from "@event/services/events.service";
import { cn } from "@lib/utils";
import { useQuery } from "@tanstack/react-query";

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
    <div className={cn("flex w-full flex-1 flex-col gap-2 rounded-lg border", className)}>
      <h2>Lista de turnos</h2>
      {events?.data?.result.map((event) => (
        <EventItem key={event.id} event={event} />
      ))}
    </div>
  );
}

function EventItem({ event }: { event: ICalendarEvent }) {
  return <div>{event.title}</div>;
}
