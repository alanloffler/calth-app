import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";

export interface IScheduleImpactPayload {
  professionalId: string;
  startHour: string;
  endHour: string;
  workingDays: number[];
}

export interface IScheduleImpactResponse {
  affectedCount: number;
  events: ICalendarEvent[];
}
