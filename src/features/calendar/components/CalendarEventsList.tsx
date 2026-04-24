import { ChevronLeft, ChevronRight } from "lucide-react";

import { Badge } from "@components/Badge";
import { Button } from "@components/ui/button";
import { ViewEventDialog } from "@event/components/ViewEventDialog";

import { es } from "date-fns/locale";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";
import { EventsService } from "@event/services/events.service";
import { cn } from "@core/lib/utils";
import { formatShortDate } from "@core/formatters/date.formatter";
import { useEventStore } from "@calendar/stores/event.store";

interface IProps {
  className?: string;
  professionalId: string;
}

export function CalendarEventsList({ className, professionalId }: IProps) {
  const [limit, _] = useState<number>(10);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const { data: events } = useQuery({
    queryKey: ["events", "professional-list", professionalId, pageIndex, limit],
    queryFn: () => EventsService.findEventsFiltered({ professionalId }, limit, pageIndex),
    enabled: !!professionalId,
  });

  useEffect(() => {
    if (events?.data) {
      setTotal(events.data.total);
    }
  }, [events]);

  async function handleEventChange() {
    queryClient.invalidateQueries({ queryKey: ["events", "professional-list", professionalId, pageIndex, limit] });
    queryClient.invalidateQueries({ queryKey: ["events", "calendar", professionalId] });
    setOpen(false);
  }

  return (
    <>
      <div className={cn("flex h-fit flex-col rounded-lg border", className)}>
        <h2 className="bg-muted rounded-t-lg border-b px-2 py-2 text-sm font-semibold">Lista de turnos</h2>
        <ul className="min-h-62.5">
          {events?.data?.result.map((event) => (
            <EventItem key={event.id} event={event} setOpen={setOpen} />
          ))}
        </ul>
        {events?.data?.total && events.data.total > limit && (
          <div className="flex items-center justify-end gap-2 p-2">
            <Button
              disabled={pageIndex < 2}
              onClick={() => setPageIndex((prev) => prev - 1)}
              size="icon-sm"
              variant="secondary"
            >
              <ChevronLeft />
            </Button>
            <Button
              disabled={pageIndex >= total / limit}
              onClick={() => setPageIndex((prev) => prev + 1)}
              size="icon-sm"
              variant="secondary"
            >
              <ChevronRight />
            </Button>
          </div>
        )}
      </div>
      <ViewEventDialog open={open} setOpen={setOpen} onEventChange={handleEventChange} />
    </>
  );
}

function EventItem({ event, setOpen }: { event: ICalendarEvent; setOpen: Dispatch<SetStateAction<boolean>> }) {
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
        {event.recurrentId && (
          <Badge size="icon-xs" variant="recurrent">
            R
          </Badge>
        )}
        <span className="truncate">{event.title}</span>
      </button>
    </li>
  );
}
