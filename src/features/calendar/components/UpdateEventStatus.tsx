import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";

import { toast } from "sonner";

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
  const { tryCatch: tryCatchUpdateEvent } = useTryCatch();

  if (!DEventStatus || !event) return;

  async function updateEventStatus(status: TEventStatus): Promise<void> {
    onEventChange({ ...event, status });

    const [response, error] = await tryCatchUpdateEvent(CalendarService.updateStatus(event.id, status));

    if (error) {
      onEventChange(event);
      toast.error(error.message);
      return;
    }

    if (response && response.statusCode === 200) {
      toast.success("Estado del turno actualizado");
    }
  }

  return (
    <Select defaultValue={event.status} onValueChange={(status) => updateEventStatus(status as TEventStatus)}>
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
