import { describe, it, expect } from "vitest";
import {
  formatDateToString,
  isDayAvailable,
  isHourSlotAvailable,
  dailyExceptionRange,
  createEventPropGetter,
  createSlotPropGetter,
} from "@calendar/utils/calendar.utils";
import type { ICalendarConfig } from "@calendar/interfaces/calendar-config.interface";
import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeTime(hours: number, minutes = 0): Date {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function makeConfig(overrides: Partial<ICalendarConfig> = {}): ICalendarConfig {
  return {
    startHour: makeTime(9),
    endHour: makeTime(18),
    step: 30,
    timeSlots: 2,
    excludedDays: [0, 6], // Sunday, Saturday
    dailyExceptionStart: undefined,
    dailyExceptionEnd: undefined,
    ...overrides,
  };
}

// ─── formatDateToString ──────────────────────────────────────────────────────

describe("formatDateToString", () => {
  it("formats a date to an ISO-like string with timezone offset", () => {
    const date = new Date(2026, 2, 22, 10, 30, 0); // Mar 22 2026 10:30
    const result = formatDateToString(date);
    expect(result).toMatch(/^2026-03-22T10:30:00/);
  });

  it("zero-pads hours and minutes", () => {
    const date = new Date(2026, 0, 5, 9, 5, 0); // Jan 5 09:05
    const result = formatDateToString(date);
    expect(result).toMatch(/^2026-01-05T09:05:00/);
  });
});

// ─── isDayAvailable ──────────────────────────────────────────────────────────

describe("isDayAvailable", () => {
  it("returns false when excludedDays is undefined", () => {
    const monday = new Date(2026, 2, 23); // Monday
    expect(isDayAvailable(monday, undefined)).toBe(false);
  });

  it("returns false when the day is in excludedDays", () => {
    const sunday = new Date(2026, 2, 22); // Sunday = 0
    expect(isDayAvailable(sunday, [0, 6])).toBe(false);
  });

  it("returns false for Saturday when excluded", () => {
    const saturday = new Date(2026, 2, 28); // Saturday = 6
    expect(isDayAvailable(saturday, [0, 6])).toBe(false);
  });

  it("returns true when the day is not in excludedDays", () => {
    const monday = new Date(2026, 2, 23); // Monday = 1
    expect(isDayAvailable(monday, [0, 6])).toBe(true);
  });

  it("returns true when excludedDays is empty", () => {
    const monday = new Date(2026, 2, 23);
    expect(isDayAvailable(monday, [])).toBe(true);
  });
});

// ─── isHourSlotAvailable ─────────────────────────────────────────────────────

describe("isHourSlotAvailable", () => {
  const config = makeConfig(); // 09:00–18:00, step 30

  it("returns true for midnight (00:00) — no hour selected yet", () => {
    const midnight = new Date(2026, 2, 22, 0, 0);
    expect(isHourSlotAvailable(midnight, config)).toBe(true);
  });

  it("returns true for the start hour (09:00)", () => {
    const date = new Date(2026, 2, 22, 9, 0);
    expect(isHourSlotAvailable(date, config)).toBe(true);
  });

  it("returns true for a valid aligned slot (09:30)", () => {
    const date = new Date(2026, 2, 22, 9, 30);
    expect(isHourSlotAvailable(date, config)).toBe(true);
  });

  it("returns false for time before startHour", () => {
    const date = new Date(2026, 2, 22, 8, 0);
    expect(isHourSlotAvailable(date, config)).toBe(false);
  });

  it("returns false for time equal to endHour (exclusive)", () => {
    const date = new Date(2026, 2, 22, 18, 0);
    expect(isHourSlotAvailable(date, config)).toBe(false);
  });

  it("returns false for time after endHour", () => {
    const date = new Date(2026, 2, 22, 19, 0);
    expect(isHourSlotAvailable(date, config)).toBe(false);
  });

  it("returns false for a slot not aligned with step (09:15 with step 30)", () => {
    const date = new Date(2026, 2, 22, 9, 15);
    expect(isHourSlotAvailable(date, config)).toBe(false);
  });

  it("returns false when time falls inside the daily exception range", () => {
    const configWithException = makeConfig({
      dailyExceptionStart: makeTime(13),
      dailyExceptionEnd: makeTime(14),
    });
    const lunchTime = new Date(2026, 2, 22, 13, 0);
    expect(isHourSlotAvailable(lunchTime, configWithException)).toBe(false);
  });

  it("returns true for the slot right after the daily exception ends", () => {
    const configWithException = makeConfig({
      dailyExceptionStart: makeTime(13),
      dailyExceptionEnd: makeTime(14),
    });
    const afterLunch = new Date(2026, 2, 22, 14, 0);
    expect(isHourSlotAvailable(afterLunch, configWithException)).toBe(true);
  });
});

// ─── dailyExceptionRange ─────────────────────────────────────────────────────

describe("dailyExceptionRange", () => {
  it("returns true when the hour is within the exception range", () => {
    const date = new Date(2026, 2, 22, 13, 0);
    expect(dailyExceptionRange(date, makeTime(13), makeTime(14))).toBe(true);
  });

  it("returns false when the hour is before the exception range", () => {
    const date = new Date(2026, 2, 22, 12, 0);
    expect(dailyExceptionRange(date, makeTime(13), makeTime(14))).toBe(false);
  });

  it("returns false when the hour equals the exception end (exclusive upper bound)", () => {
    const date = new Date(2026, 2, 22, 14, 0);
    expect(dailyExceptionRange(date, makeTime(13), makeTime(14))).toBe(false);
  });

  it("returns false when the hour is after the exception range", () => {
    const date = new Date(2026, 2, 22, 15, 0);
    expect(dailyExceptionRange(date, makeTime(13), makeTime(14))).toBe(false);
  });
});

// ─── createEventPropGetter ───────────────────────────────────────────────────

describe("createEventPropGetter", () => {
  it("returns a className based on event status", () => {
    const getter = createEventPropGetter();
    const event = { status: "confirmed" } as ICalendarEvent;
    expect(getter(event)).toEqual({ className: "event-status-confirmed" });
  });

  it("uses the exact status string in the className", () => {
    const getter = createEventPropGetter();
    const event = { status: "cancelled" } as ICalendarEvent;
    expect(getter(event)).toEqual({ className: "event-status-cancelled" });
  });
});

// ─── createSlotPropGetter ────────────────────────────────────────────────────

describe("createSlotPropGetter", () => {
  it("returns an empty object when calendarConfig is null", () => {
    const getter = createSlotPropGetter(null);
    expect(getter(new Date())).toEqual({});
  });

  it("returns an empty object when no daily exception is configured", () => {
    const getter = createSlotPropGetter(makeConfig());
    expect(getter(new Date(2026, 2, 22, 10, 0))).toEqual({});
  });

  it("returns lunch className when time is inside the daily exception range", () => {
    const config = makeConfig({
      dailyExceptionStart: makeTime(13),
      dailyExceptionEnd: makeTime(14),
    });
    const getter = createSlotPropGetter(config);
    const lunchTime = new Date(2026, 2, 22, 13, 0);
    expect(getter(lunchTime)).toEqual({ className: "rbc-slot-lunch" });
  });

  it("returns empty object for time outside the daily exception range", () => {
    const config = makeConfig({
      dailyExceptionStart: makeTime(13),
      dailyExceptionEnd: makeTime(14),
    });
    const getter = createSlotPropGetter(config);
    expect(getter(new Date(2026, 2, 22, 10, 0))).toEqual({});
  });
});
