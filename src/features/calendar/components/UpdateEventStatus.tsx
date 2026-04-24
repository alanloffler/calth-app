import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";
import type { TEventStatus } from "@calendar/enums/event-status.enum";
import { CalendarService } from "@calendar/services/calendar.service";
import { DEventStatus } from "@calendar/dictionaries/status.dictionary";
import { uppercaseFirst } from "@core/formatters/uppercase-first.formatter";

interface IProps {
  event: ICalendarEvent;
  onEventChange: (event: ICalendarEvent) => void;
}

export function UpdateEventStatus({ event, onEventChange }: IProps) {
  const [status, setStatus] = useState<TEventStatus>(event.status);

  useEffect(() => {
    setStatus(event.status);
  }, [event]);

  const { mutate: updateEventStatus } = useMutation({
    mutationKey: ["event-status"],
    mutationFn: (status: TEventStatus) => CalendarService.updateStatus(event.id, status),
    onMutate: async (newStatus) => {
      const previousStatus = status;
      setStatus(newStatus);
      return { previousStatus };
    },
    onSuccess: (response, newStatus) => {
      onEventChange({ ...event, status: newStatus });
      toast.success(response.message ?? "Estado del turno actualizado");
    },
    onError: (_error, _newStatus, context) => {
      if (context?.previousStatus) setStatus(context.previousStatus);
    },
  });

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
