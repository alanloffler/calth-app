import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";

import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";
import { EventsService } from "@event/services/events.service";
import { useTryCatch } from "@core/hooks/useTryCatch";

export default function Events() {
  const [events, setEvents] = useState<ICalendarEvent[]>([]);
  const { isLoading, tryCatch: tryCatchEvents } = useTryCatch();

  const getEvents = useCallback(async () => {
    const [response, error] = await tryCatchEvents(EventsService.findAllByBusiness(10));

    if (error) {
      toast.error(error.message);
      return;
    }

    if (response && response.statusCode === 200 && response.data) {
      setEvents(response.data);
    }
  }, [tryCatchEvents]);

  useEffect(() => {
    getEvents();
  }, []);

  return <>{JSON.stringify(events, null, 2)}</>;
}
