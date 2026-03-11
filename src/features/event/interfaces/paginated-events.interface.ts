import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";

export interface IPaginatedEvents {
  result: ICalendarEvent[];
  total: number;
}
