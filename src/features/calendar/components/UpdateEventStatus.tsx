import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";

import { toast } from "sonner";
import { useEffect, useState } from "react";

import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";
import type { TEventStatus } from "@calendar/enums/event-status.enum";
import { CalendarService } from "@calendar/services/calendar.service";
import { DEventStatus } from "@calendar/dictionaries/status.dictionary";
import { uppercaseFirst } from "@core/formatters/uppercase-first.formatter";
import { useTryCatch } from "@core/hooks/useTryCatch";

interface IProps {
  event: ICalendarEvent;
  onEventChange: (event: ICalendarEvent) => void;
}

export function UpdateEventStatus({ event, onEventChange }: IProps) {
  const [status, setStatus] = useState<TEventStatus>(event.status);
  const { tryCatch: tryCatchUpdateEvent } = useTryCatch();

  useEffect(() => {
    setStatus(event.status);
  }, [event]);

  if (!DEventStatus || !event) return;

  async function updateEventStatus(newStatus: TEventStatus): Promise<void> {
    const previousStatus = status;
    setStatus(newStatus);

    const [response, error] = await tryCatchUpdateEvent(CalendarService.updateStatus(event.id, newStatus));

    if (error) {
      setStatus(previousStatus);
      toast.error(error.message);
      return;
    }

    if (response && response.statusCode === 200) {
      onEventChange({ ...event, status: newStatus });
      toast.success("Estado del turno actualizado");
    }
  }

  return (
    <Select value={status} onValueChange={(s) => updateEventStatus(s as TEventStatus)}>
      <SelectTrigger id="eventStatus">
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
