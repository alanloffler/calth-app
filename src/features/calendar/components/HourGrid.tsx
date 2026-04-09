import { Button } from "@components/ui/button";

import type z from "zod";
import type { UseFormReturn } from "react-hook-form";
import { format, parseISO } from "date-fns";
import { useEffect, useMemo, useState } from "react";

import type { ICalendarConfig } from "@calendar/interfaces/calendar-config.interface";
import type { eventSchema } from "@calendar/schemas/event.schema";
import { cn } from "@core/lib/utils";

interface IProps {
  form: UseFormReturn<z.infer<typeof eventSchema>>;
  isInvalid?: boolean;
  professionalConfig: ICalendarConfig;
  takenSlots?: string[];
}

function parseTime(time: string): { hours: number; minutes: number } {
  const [hours, minutes] = time.split(":").map(Number);
  return { hours, minutes };
}

function timeToMinutesDate(time: Date): number {
  return time.getHours() * 60 + time.getMinutes();
}

export function HourGrid({ form, isInvalid, professionalConfig, takenSlots = [] }: IProps) {
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const dateValue = form.watch("startDate");

  useEffect(() => {
    if (!dateValue) {
      setSelectedHour(null);
      return;
    }

    const date = new Date(dateValue);
    const hasValidHour = date.getHours() !== 0 || date.getMinutes() !== 0;

    if (hasValidHour) {
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      setSelectedHour(`${hours}:${minutes}`);
    } else {
      setSelectedHour(null);
    }
  }, [dateValue]);

  const { slots, separatorIndex } = useMemo(() => {
    const { startHour, endHour, step, dailyExceptionStart, dailyExceptionEnd } = professionalConfig;

    const duration = step;
    const startMinutes = timeToMinutesDate(startHour);
    const endMinutes = timeToMinutesDate(endHour);
    const hasExceptions = dailyExceptionStart && dailyExceptionEnd;

    const formatSlot = (mins: number): string => {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    };

    if (!hasExceptions) {
      const allSlots: string[] = [];
      for (let mins = startMinutes; mins < endMinutes; mins += duration) {
        allSlots.push(formatSlot(mins));
      }
      return { slots: allSlots, separatorIndex: -1 };
    }

    const exceptionFromMinutes = timeToMinutesDate(dailyExceptionStart!);
    const exceptionToMinutes = timeToMinutesDate(dailyExceptionEnd!);

    const morningSlots: string[] = [];
    for (let mins = startMinutes; mins < exceptionFromMinutes; mins += duration) {
      morningSlots.push(formatSlot(mins));
    }

    const afternoonSlots: string[] = [];
    for (let mins = exceptionToMinutes; mins < endMinutes; mins += duration) {
      afternoonSlots.push(formatSlot(mins));
    }

    return {
      slots: [...morningSlots, ...afternoonSlots],
      separatorIndex: morningSlots.length,
    };
  }, [professionalConfig]);

  function handleHourClick(hour: string) {
    const currentDate = form.getValues("startDate");
    if (!currentDate) return;

    const newDate = parseISO(currentDate);
    const isToggleOff = selectedHour === hour;

    if (isToggleOff) {
      newDate.setHours(0);
      newDate.setMinutes(0);
      newDate.setSeconds(0);
      setSelectedHour(null);
    } else {
      const { hours, minutes } = parseTime(hour);
      newDate.setHours(hours);
      newDate.setMinutes(minutes);
      newDate.setSeconds(0);
      setSelectedHour(hour);
    }

    form.setValue("startDate", format(newDate, "yyyy-MM-dd'T'HH:mm:ssXXX"), {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  if (slots.length === 0) return null;

  const beforeSeparator = separatorIndex > 0 ? slots.slice(0, separatorIndex) : slots;
  const afterSeparator = separatorIndex > 0 ? slots.slice(separatorIndex) : [];

  const totalSlots = beforeSeparator.length + afterSeparator.length;
  const gridCols = totalSlots < 21 ? "grid-cols-3" : totalSlots < 34 ? "grid-cols-4" : "grid-cols-5";

  function getButtonClasses(hour: string) {
    const isTaken = takenSlots.includes(hour);
    return cn(
      "hover:text-foreground text-foreground/60 h-fit w-[52px] disabled:opacity-100",
      totalSlots < 31 ? "px-2 py-1 text-sm" : "px-1.5 py-1 text-xs",
      isInvalid && "border-destructive",
      selectedHour === hour &&
        "bg-primary border-primary hover:bg-primary hover:border-primary text-white hover:text-white",
      isTaken &&
        "border-rose-100 bg-rose-50 text-rose-400 line-through dark:border-rose-900/30 dark:bg-rose-950/70 dark:text-rose-800",
    );
  }

  return (
    <div className="flex flex-col items-start gap-3 rounded-md border p-3 shadow-xs">
      <div className={cn("grid gap-1", gridCols)}>
        {beforeSeparator.map((hour) => (
          <Button
            className={getButtonClasses(hour)}
            disabled={takenSlots.includes(hour)}
            key={hour}
            onClick={() => handleHourClick(hour)}
            type="button"
            variant="outline"
          >
            {hour}
          </Button>
        ))}
      </div>
      {afterSeparator.length > 0 && (
        <>
          <div
            className={cn(
              "h-px w-full",
              isInvalid ? "bg-destructive" : "bg-gray-300",
              gridCols === "grid-cols-3" ? "max-w-27" : gridCols === "grid-cols-4" ? "max-w-41" : "max-w-55",
            )}
          />
          <div className={cn("grid gap-1", gridCols)}>
            {afterSeparator.map((hour) => (
              <Button
                className={getButtonClasses(hour)}
                disabled={takenSlots.includes(hour)}
                key={hour}
                onClick={() => handleHourClick(hour)}
                type="button"
                variant="outline"
              >
                {hour}
              </Button>
            ))}
          </div>
        </>
      )}
      <div className="text-muted-foreground mt-2 flex items-center gap-2 place-self-start text-xs">
        <span className="flex size-3 rounded-full border border-rose-200 bg-rose-100 dark:border-rose-900 dark:bg-rose-950"></span>
        <span>No disponibles</span>
      </div>
    </div>
  );
}
