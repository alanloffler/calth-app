import { format, type Locale } from "date-fns";

export function formatShortDate(date: Date, locale: Locale): string {
  return format(date, "P", { locale: locale }).split("/").slice(0, 2).join("/");
}

export function formatShortDateTime(date: Date, locale: Locale): string {
  const time = format(date, "HH:mm", { locale: locale });
  return format(date, "P", { locale: locale }).split("/").slice(0, 2).join("/") + " " + time;
}
