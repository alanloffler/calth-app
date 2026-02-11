import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";

import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";
import { DEventStatus } from "@calendar/dictionaries/status.dictionary";
import { uppercaseFirst } from "@core/formatters/uppercase-first.formatter";

interface IProps {
  event: ICalendarEvent;
}

export function UpdateEventStatus({ event }: IProps) {
  if (!DEventStatus || !event) return;

  return (
    <Select defaultValue={event.status} onValueChange={(event) => console.log(event)}>
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
