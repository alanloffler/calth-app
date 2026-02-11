import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { ICalendarConfig } from "@calendar/interfaces/calendar-config.interface";
import type { IUser } from "@users/interfaces/user.interface";
import type { TView } from "@calendar/interfaces/calendar-view.type";

interface CalendarState {
  selectedDate: Date;
  selectedProfessional: IUser | null;
  selectedProfessionalConfig: ICalendarConfig | null;
  selectedView: TView;
  setSelectedDate: (date: Date) => void;
  setSelectedProfessional: (user: IUser) => void;
  setSelectedProfessionalConfig: (config: ICalendarConfig) => void;
  setSelectedView: (view: TView) => void;
}

export const useCalendarStore = create(
  persist<CalendarState>(
    (set) => ({
      selectedDate: new Date(),
      selectedProfessional: null,
      selectedProfessionalConfig: null,
      selectedView: "week",
      setSelectedDate: (date) => set({ selectedDate: date }),
      setSelectedProfessional: (user) => set({ selectedProfessional: user }),
      setSelectedProfessionalConfig: (config) => set({ selectedProfessionalConfig: config }),
      setSelectedView: (view) => set({ selectedView: view }),
    }),
    {
      name: "calth-app-calendar",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) =>
        ({
          selectedDate: state.selectedDate,
          selectedView: state.selectedView,
        }) as CalendarState,
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<CalendarState>;

        return {
          ...currentState,
          ...persisted,
          selectedDate: persisted?.selectedDate ? new Date(persisted.selectedDate) : currentState.selectedDate,
        };
      },
    },
  ),
);
