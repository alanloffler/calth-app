import { format } from "date-fns";

import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";
import type { TView } from "@calendar/interfaces/calendar-view.type";
import { cn } from "@lib/utils";

export function CustomEvent({ event, view }: { event: ICalendarEvent; view: TView }) {
  return (
    <div className={cn("flex items-start gap-1", view === "month" ? "flex-row" : "flex-col")}>
      <div className={cn("flex w-full items-center gap-1", view === "week" ? "justify-between" : "justify-start")}>
        <div className="text-[11px] font-normal">{format(event.startDate, "HH:mm")}</div>
        {event.recurrentId && (
          <span
            className={cn(
              "bg-recurrent inline-block h-2 w-2 shrink-0 rounded-full",
              view !== "month" ? "mr-1!" : "mr-0",
            )}
          ></span>
        )}
      </div>
      <span>{event.title}</span>
    </div>
  );
}
