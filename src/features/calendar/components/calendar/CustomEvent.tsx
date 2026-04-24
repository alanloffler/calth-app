import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";

import { format } from "date-fns";

import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";
import type { TView } from "@calendar/interfaces/calendar-view.type";
import { cn } from "@core/lib/utils";

export function CustomEvent({ event, view }: { event: ICalendarEvent; view: TView }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn("flex flex-row items-start gap-1")}>
          <div className={cn("flex w-full items-center justify-start gap-1", view === "month" ? "px-1" : "px-2 py-1")}>
            {event.recurrentId && (
              <span
                className={cn(
                  "bg-recurrent inline-block h-3 w-3 shrink-0 rounded-full border-[1.5px] border-white",
                  view !== "month" ? "mr-0!" : "mr-0",
                )}
              ></span>
            )}
            <span className="text-[11px] font-normal">{format(event.startDate, "HH:mm")}</span>
            <span className="">{event.title}</span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent align="center">
        <span>{event.title}</span>
      </TooltipContent>
    </Tooltip>
  );
}
