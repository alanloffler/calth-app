import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";

import { cva, type VariantProps } from "class-variance-authority";
import { toast } from "sonner";
import { useState } from "react";

import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";
import type { TEventStatus } from "@calendar/enums/event-status.enum";
import { CalendarService } from "@calendar/services/calendar.service";
import { DEventStatus } from "@calendar/dictionaries/status.dictionary";
import { cn } from "@core/lib/utils";
import { uppercaseFirst } from "@core/formatters/uppercase-first.formatter";
import { useTryCatch } from "@core/hooks/useTryCatch";

const statusVariants = cva("uppercase", {
  variants: {
    size: {
      sm: "px-2 py-1 text-[10px] rounded-sm h-7!",
      md: "px-3 py-1.5 text-xs rounded-sm h-9!",
      lg: "px-4 py-2 text-sm rounded-md h-11!",
    },
    status: {
      absent:
        "bg-amber-100 border-amber-200  [&_>svg]:text-amber-600! text-amber-600 dark:bg-amber-950/80 dark:text-amber-400",
      cancelled: "bg-red-100 border-red-200  [&_>svg]:text-red-600! text-red-600 dark:bg-red-950/80 dark:text-red-400",
      in_progress:
        "bg-fuchsia-100 border-fuchsia-200  [&_>svg]:text-fuchsia-600! text-fuchsia-600 dark:bg-fuchsia-950/80 dark:text-fuchsia-400",
      pending: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800/80 dark:text-neutral-400",
      present:
        "bg-green-100 text-green-600 dark:bg-green-950/80 dark:text-green-400 border-green-200 [&_>svg]:text-green-600!",
    },
  },
  defaultVariants: {
    size: "md",
    status: "pending",
  },
});

export interface IUpdateStatusProps extends VariantProps<typeof statusVariants> {
  className?: string;
  event: ICalendarEvent;
  onEventChange: (event: ICalendarEvent) => void;
}

export function UpdateStatus({ className, event, onEventChange, size }: IUpdateStatusProps) {
  const { tryCatch: tryCatchUpdateEvent } = useTryCatch();
  const [localStatus, setLocalStatus] = useState<TEventStatus>(event.status);

  if (!DEventStatus || !event) return null;

  async function updateEventStatus(newStatus: TEventStatus): Promise<void> {
    setLocalStatus(newStatus);

    const [response, error] = await tryCatchUpdateEvent(CalendarService.updateStatus(event.id, newStatus));

    if (error) {
      setLocalStatus(event.status);
      toast.error(error.message);
      return;
    }

    if (response && response.statusCode === 200) {
      onEventChange({ ...event, status: newStatus });
      toast.success("Estado del turno actualizado");
    }
  }

  return (
    <Select value={localStatus} onValueChange={(newStatus) => updateEventStatus(newStatus as TEventStatus)}>
      <SelectTrigger
        id="eventStatus"
        className={cn(statusVariants({ size, status: localStatus }), "min-w-0", className)}
      >
        <SelectValue placeholder="Seleccione" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(DEventStatus)
          .sort((a, b) => a[1].localeCompare(b[1]))
          .map((key, idx) => (
            <SelectItem key={idx} value={key[0]}>
              {uppercaseFirst(key[1])}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}
