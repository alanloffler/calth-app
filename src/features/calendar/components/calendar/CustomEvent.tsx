import { format } from "date-fns";

import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";
import type { TView } from "@calendar/interfaces/calendar-view.type";
import { cn } from "@core/lib/utils";

export function CustomEvent({ event, view }: { event: ICalendarEvent; view: TView }) {
  return (
    // <div className={cn("flex items-start gap-1", view === "month" ? "flex-row" : "flex-col")}>
    <div className={cn("flex flex-row items-start gap-1")}>
      <div className={cn("flex w-full items-center gap-1", view === "week" ? "justify-between" : "justify-start")}>
        {event.recurrentId && (
          <span
            className={cn(
              "bg-recurrent inline-block h-3 w-3 shrink-0 rounded-full border-[1.5px] border-white",
              view !== "month" ? "mr-0!" : "mr-0",
            )}
          ></span>
        )}
        <div className="text-[11px] font-normal">{format(event.startDate, "HH:mm")}</div>
        <span>{event.title}</span>
      </div>
    </div>
  );
}
