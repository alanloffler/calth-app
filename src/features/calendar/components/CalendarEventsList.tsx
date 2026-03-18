import { ViewEventDialog } from "@event/components/ViewEventDialog";

import { es } from "date-fns/locale";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";
import { EventsService } from "@event/services/events.service";
import { cn } from "@lib/utils";
import { formatShortDate } from "@core/formatters/date.formatter";
import { useEventStore } from "@calendar/stores/event.store";

interface IProps {
  className?: string;
  professionalId: string;
}

export function CalendarEventsList({ className, professionalId }: IProps) {
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const { triggerRefresh } = useEventStore();

  const { data: events } = useQuery({
    queryKey: ["events", "professional-list", professionalId],
    queryFn: () => EventsService.findEventsFiltered({ professionalId }, 10),
    enabled: !!professionalId,
  });

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen && hasChanges) {
      queryClient.invalidateQueries({ queryKey: ["events", "professional-list", professionalId] });
      triggerRefresh();
      setHasChanges(false);
    }
  };

  const handleEventChange = () => {
    setHasChanges(true);
  };

  return (
    <>
      <div className={cn("flex flex-col rounded-lg border", className)}>
        <h2 className="bg-muted rounded-t-lg border-b px-2 py-2 text-sm font-semibold">Lista de turnos</h2>
        <ul>
          {events?.data?.result.map((event) => (
            <EventItem key={event.id} event={event} setOpen={setOpen} />
          ))}
        </ul>
      </div>
      <ViewEventDialog open={open} setOpen={handleOpenChange} onEventChange={handleEventChange} />
    </>
  );
}

function EventItem({
  event,
  setOpen,
}: {
  event: ICalendarEvent;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { setSelectedEvent } = useEventStore();

  const colors = {
    absent: "bg-amber-400",
    cancelled: "bg-red-400",
    in_progress: "bg-fuchsia-400",
    pending: "bg-neutral-400",
    present: "bg-green-400",
  };

  return (
    <li>
      <button
        className="hover:bg-muted/50 flex w-full items-center gap-2 border-b px-2 py-1 text-xs"
        onClick={() => {
          setSelectedEvent(event);
          setOpen(true);
        }}
      >
        <div className={cn("size-2.5 shrink-0 rounded-full", colors[event.status])}></div>
        <span className="min-w-8.75">{formatShortDate(event.startDate, es)}</span>
        <span className="truncate">{event.title}</span>
      </button>
    </li>
  );
}
