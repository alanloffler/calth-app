import { EventStatus } from "@calendar/components/ui/EventStatus";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";

import type { Dispatch, SetStateAction } from "react";

import type { TEventStatus } from "@calendar/enums/event-status.enum";
import { DEventStatus } from "@calendar/dictionaries/status.dictionary";

interface IProps {
  status: string | undefined;
  setStatus: Dispatch<SetStateAction<string | undefined>>;
}
export function SelectEventStatus({ status, setStatus }: IProps) {
  return (
    <Select value={status || ""} onValueChange={(status) => setStatus(status as TEventStatus)}>
      <SelectTrigger id="eventStatus" className="w-full data-select:pl-0 [&>span]:truncate">
        <SelectValue placeholder="Estado" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(DEventStatus)
          .sort((a, b) => a[1].localeCompare(b[1]))
          .map((key, idx) => (
            <SelectItem key={idx} value={key[0]}>
              <EventStatus className="bg-transparent!" variant={key[0] as TEventStatus} />
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}
