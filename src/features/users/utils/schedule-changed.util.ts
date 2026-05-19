import type { IProfessionalProfile } from "@users/interfaces/professional-profile.interface";

export function hasScheduleChanged(
  profile: IProfessionalProfile,
  values: { startHour: string; endHour: string; workingDays: number[] },
): boolean {
  const currentDays = profile.workingDays.map(Number).sort().join(",");
  const newDays = [...values.workingDays].sort().join(",");

  return profile.startHour !== values.startHour || profile.endHour !== values.endHour || currentDays !== newDays;
}
