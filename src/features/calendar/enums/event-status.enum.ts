export const EEventStatus = {
  ABSENT: "absent",
  CANCELLED: "cancelled",
  IN_PROGRESS: "in_progress",
  PENDING: "pending",
  PRESENT: "present",
} as const;

export type TEventStatus = (typeof EEventStatus)[keyof typeof EEventStatus];
