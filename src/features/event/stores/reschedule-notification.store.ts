import { create } from "zustand";

import { EventsService } from "@event/services/events.service";

interface RescheduleNotificationState {
  count: number;
  eventsId: string[];
  isLoading: boolean;
}

interface RescheduleNotificationActions {
  fetch: (professionalId?: string) => Promise<void>;
  reset: () => void;
}

export const useRescheduleNotificationStore = create<RescheduleNotificationState & RescheduleNotificationActions>(
  (set) => ({
    count: 0,
    eventsId: [],
    isLoading: false,

    fetch: async (professionalId?) => {
      set({ isLoading: true });
      try {
        const response = await EventsService.findNeedsReschedule(professionalId);
        if (response.data) set({ count: response.data.count, eventsId: response.data.eventsId });
      } finally {
        set({ isLoading: false });
      }
    },
    reset: () => set({ count: 0, eventsId: [], isLoading: false }),
  }),
);
