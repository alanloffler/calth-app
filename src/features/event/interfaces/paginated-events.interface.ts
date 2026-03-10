import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";

export interface IPaginatedEvents {
  data: ICalendarEvent[];
  total: number;
}
