import type z from "zod";
import { endOfDay, endOfWeek, endOfMonth, startOfWeek, startOfMonth, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

import type { ICalendarConfig } from "@calendar/interfaces/calendar-config.interface";
import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";
import type { IProfessionalProfile } from "@users/interfaces/professional-profile.interface";
import type { eventSchema } from "@calendar/schemas/event.schema";

function toUTCMidnight(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));
}

function toUTCEndOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999));
}

export function formatDateToString(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm:ssxxx");
}

export function parseCalendarConfig(profile: IProfessionalProfile): ICalendarConfig {
  let dailyExceptionStart = undefined;
  let dailyExceptionEnd = undefined;

  if (profile.dailyExceptionStart && profile.dailyExceptionEnd) {
    dailyExceptionStart = new Date();
    dailyExceptionStart.setHours(
      parseInt(profile.dailyExceptionStart.slice(0, 2), 10),
      parseInt(profile.dailyExceptionStart.slice(3, 5), 10),
      0,
      0,
    );

    dailyExceptionEnd = new Date();
    dailyExceptionEnd.setHours(
      parseInt(profile.dailyExceptionEnd.slice(0, 2), 10),
      parseInt(profile.dailyExceptionEnd.slice(3, 5), 10),
      0,
      0,
    );
  }

  const startHour = new Date();
  startHour.setHours(parseInt(profile.startHour.slice(0, 2), 10), parseInt(profile.startHour.slice(3, 5), 10), 0, 0);

  const endHour = new Date();
  endHour.setHours(parseInt(profile.endHour.slice(0, 2), 10), parseInt(profile.endHour.slice(3, 5), 10), 0, 0);

  const step = Math.ceil(Number(profile.slotDuration));

  const timeSlots = Math.ceil(60 / step);

  const workingDays = profile.workingDays.map((day) => parseInt(day, 10));
  const excludedDays = [0, 1, 2, 3, 4, 5, 6].filter((day) => !workingDays.includes(day));

  return {
    dailyExceptionStart,
    dailyExceptionEnd,
    startHour,
    endHour,
    step,
    timeSlots,
    excludedDays,
  };
}

export function dailyExceptionRange(date: Date, dailyExceptionStart: Date, dailyExceptionEnd: Date): boolean {
  const hour = date.getHours();
  return hour >= dailyExceptionStart.getHours() && hour < dailyExceptionEnd.getHours();
}

export function createEventPropGetter() {
  return (event: ICalendarEvent) => {
    return {
      className: `event-status-${event.status}`,
    };
  };
}

export function createSlotPropGetter(calendarConfig: ICalendarConfig | null) {
  return (date: Date) => {
    if (!calendarConfig) return {};

    if (
      calendarConfig.dailyExceptionStart &&
      calendarConfig.dailyExceptionEnd &&
      dailyExceptionRange(date, calendarConfig.dailyExceptionStart, calendarConfig.dailyExceptionEnd)
    ) {
      return { className: "rbc-slot-lunch" };
    }

    return {};
  };
}

export function isDayAvailable(day: Date, excludedDays?: number[]): boolean {
  if (!excludedDays) return false;

  const dayOfWeek = day.getDay();
  return !excludedDays.includes(dayOfWeek);
}

export function isHourSlotAvailable(date: Date, config: ICalendarConfig): boolean {
  const hours = date.getHours();
  const minutes = date.getMinutes();

  if (hours === 0 && minutes === 0) return true;

  const selectedTimeInMinutes = hours * 60 + minutes;
  const startMinutes = config.startHour.getHours() * 60 + config.startHour.getMinutes();
  const endMinutes = config.endHour.getHours() * 60 + config.endHour.getMinutes();

  if (selectedTimeInMinutes < startMinutes || selectedTimeInMinutes >= endMinutes) {
    return false;
  }

  if (config.dailyExceptionStart && config.dailyExceptionEnd) {
    const exceptionStartMinutes = config.dailyExceptionStart.getHours() * 60 + config.dailyExceptionStart.getMinutes();
    const exceptionEndMinutes = config.dailyExceptionEnd.getHours() * 60 + config.dailyExceptionEnd.getMinutes();

    if (selectedTimeInMinutes >= exceptionStartMinutes && selectedTimeInMinutes < exceptionEndMinutes) {
      return false;
    }
  }

  const minutesFromStart = selectedTimeInMinutes - startMinutes;
  if (minutesFromStart % config.step !== 0) {
    return false;
  }

  return true;
}

export function getCalendarDateRange(
  range: { start: Date; end: Date } | Date[],
  view: "month" | "week" | "day",
): { start: Date; end: Date } {
  switch (view) {
    case "month": {
      const { start, end } = range as { start: Date; end: Date };
      return {
        start: startOfWeek(start, { locale: es, weekStartsOn: 1 }),
        end: endOfWeek(end, { locale: es, weekStartsOn: 1 }),
      };
    }
    case "week": {
      const dates = range as Date[];
      return {
        start: dates[0],
        end: endOfWeek(dates[6], { locale: es, weekStartsOn: 1 }),
      };
    }
    case "day": {
      const dates = range as Date[];
      return {
        start: dates[0],
        end: endOfDay(dates[0]),
      };
    }
  }
}

export function getCalendarRangeFromDate(date: Date, view: "month" | "week" | "day"): { start: Date; end: Date } {
  switch (view) {
    case "month":
      return {
        start: startOfWeek(startOfMonth(date), { locale: es, weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(date), { locale: es, weekStartsOn: 1 }),
      };
    case "week":
      return {
        start: startOfWeek(date, { locale: es, weekStartsOn: 1 }),
        end: endOfWeek(date, { locale: es, weekStartsOn: 1 }),
      };
    case "day":
      return {
        start: toUTCMidnight(date),
        end: toUTCEndOfDay(date),
      };
  }
}

export function getEventFormValues(event: ICalendarEvent): z.infer<typeof eventSchema> {
  return {
    professionalId: event.professionalId,
    startDate: format(
      typeof event.startDate === "string" ? parseISO(event.startDate) : event.startDate,
      "yyyy-MM-dd'T'HH:mm:ssXXX",
    ),
    title: event.title,
    userId: event.userId,
  };
}

export function getEventTimeSlot(event: ICalendarEvent | null): string | null {
  if (!event?.startDate) return null;
  const date = typeof event.startDate === "string" ? parseISO(event.startDate) : event.startDate;
  return format(date, "HH:mm");
}
