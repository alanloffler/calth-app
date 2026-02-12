import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";

interface EventState {
  events: ICalendarEvent[];
  selectedEvent: ICalendarEvent | null;
}

interface EventActions {
  setEvents: (events: ICalendarEvent[]) => void;
  setSelectedEvent: (event: ICalendarEvent) => void;
}

export const useEventStore = create(
  persist<EventState & EventActions>(
    (set) => ({
      events: [],
      selectedEvent: null,
      setEvents: (events) => set({ events }),
      setSelectedEvent: (event) => set({ selectedEvent: event }),
    }),
    {
      name: "calth-app-events",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
