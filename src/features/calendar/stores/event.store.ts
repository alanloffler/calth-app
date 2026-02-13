import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";

interface EventState {
  events?: ICalendarEvent[];
  openEditEventSheet: boolean;
  openViewEventSheet: boolean;
  refreshKey: number;
  selectedEvent: ICalendarEvent | null;
}

interface EventActions {
  setEvents: (events?: ICalendarEvent[]) => void;
  setOpenEditEventSheet: (open: boolean) => void;
  setOpenViewEventSheet: (open: boolean) => void;
  setSelectedEvent: (event: ICalendarEvent | null) => void;
  triggerRefresh: () => void;
}

export const useEventStore = create(
  persist<EventState & EventActions>(
    (set) => ({
      events: undefined,
      openEditEventSheet: false,
      openViewEventSheet: false,
      refreshKey: 0,
      selectedEvent: null,

      setEvents: (events) => set({ events }),
      setOpenEditEventSheet: (open) => set({ openEditEventSheet: open }),
      setOpenViewEventSheet: (open) => set({ openViewEventSheet: open }),
      setSelectedEvent: (event) => set({ selectedEvent: event }),
      triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
    }),
    {
      name: "calth-app-events",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
