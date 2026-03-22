import { describe, it, expect } from "vitest";
import { format } from "date-fns";
import { eventSchema } from "@calendar/schemas/event.schema";

// Creates a date string in LOCAL time so getHours() in the refine always
// sees the intended hour, regardless of the test environment's timezone.
function makeDateString(hours: number, minutes = 0): string {
  const d = new Date(2026, 2, 22, hours, minutes, 0);
  return format(d, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

// RFC 4122 compliant UUIDs (version 4: third segment starts with 4,
// fourth segment starts with 8/9/a/b — required by Zod v4).
const validEvent = {
  professionalId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  userId: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
  title: "Consulta médica",
  startDate: makeDateString(10, 30),
};

describe("eventSchema", () => {
  // ─── Happy path ────────────────────────────────────────────────────────────

  it("passes with valid minimal data", () => {
    expect(eventSchema.safeParse(validEvent).success).toBe(true);
  });

  it("passes with valid recurring fields", () => {
    const result = eventSchema.safeParse({
      ...validEvent,
      recurringCount: 3,
      recurringDates: [
        makeDateString(10, 30),
        makeDateString(10, 30),
        makeDateString(10, 30),
      ],
    });
    expect(result.success).toBe(true);
  });

  it("passes when recurring fields are omitted entirely", () => {
    expect(eventSchema.safeParse(validEvent).success).toBe(true);
  });

  // ─── professionalId ────────────────────────────────────────────────────────

  it("fails when professionalId is not a UUID", () => {
    const result = eventSchema.safeParse({ ...validEvent, professionalId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("fails when professionalId is empty", () => {
    const result = eventSchema.safeParse({ ...validEvent, professionalId: "" });
    expect(result.success).toBe(false);
  });

  // ─── userId ────────────────────────────────────────────────────────────────

  it("fails when userId is not a UUID", () => {
    const result = eventSchema.safeParse({ ...validEvent, userId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  // ─── title ─────────────────────────────────────────────────────────────────

  it("fails when title is empty", () => {
    const result = eventSchema.safeParse({ ...validEvent, title: "" });
    expect(result.success).toBe(false);
  });

  it("fails when title is shorter than 3 characters", () => {
    const result = eventSchema.safeParse({ ...validEvent, title: "AB" });
    expect(result.success).toBe(false);
  });

  it("passes when title has exactly 3 characters", () => {
    const result = eventSchema.safeParse({ ...validEvent, title: "ABC" });
    expect(result.success).toBe(true);
  });

  // ─── startDate ─────────────────────────────────────────────────────────────

  it("fails when startDate is empty", () => {
    const result = eventSchema.safeParse({ ...validEvent, startDate: "" });
    expect(result.success).toBe(false);
  });

  it("fails when startDate is midnight (00:00) — no hour selected", () => {
    const result = eventSchema.safeParse({ ...validEvent, startDate: makeDateString(0, 0) });
    expect(result.success).toBe(false);
    const issue = result.error?.issues.find((i) => i.path.includes("startDate"));
    expect(issue?.message).toBe("Debe seleccionar un horario");
  });

  it("passes when startDate has a non-zero hour", () => {
    const result = eventSchema.safeParse({ ...validEvent, startDate: makeDateString(9, 0) });
    expect(result.success).toBe(true);
  });

  it("passes when startDate has zero hours but non-zero minutes", () => {
    const result = eventSchema.safeParse({ ...validEvent, startDate: makeDateString(0, 30) });
    expect(result.success).toBe(true);
  });

  // ─── recurringDates / recurringCount superRefine ───────────────────────────

  it("fails when recurringCount is set but recurringDates is missing", () => {
    const result = eventSchema.safeParse({ ...validEvent, recurringCount: 3 });
    expect(result.success).toBe(false);
    const issue = result.error?.issues.find((i) => i.path.includes("recurringDates"));
    expect(issue?.message).toMatch(/Solo hay 0/);
  });

  it("fails when recurringDates has fewer items than recurringCount", () => {
    const result = eventSchema.safeParse({
      ...validEvent,
      recurringCount: 3,
      recurringDates: [makeDateString(10, 30), makeDateString(10, 30)],
    });
    expect(result.success).toBe(false);
    const issue = result.error?.issues.find((i) => i.path.includes("recurringDates"));
    expect(issue?.message).toMatch(/Solo hay 2.*3/);
  });

  it("fails when recurringDates has more items than recurringCount", () => {
    const result = eventSchema.safeParse({
      ...validEvent,
      recurringCount: 2,
      recurringDates: [makeDateString(10, 30), makeDateString(10, 30), makeDateString(10, 30)],
    });
    expect(result.success).toBe(false);
  });

  it("skips recurring validation when recurringCount is undefined", () => {
    const result = eventSchema.safeParse({
      ...validEvent,
      recurringDates: [makeDateString(10, 30)],
    });
    expect(result.success).toBe(true);
  });
});
