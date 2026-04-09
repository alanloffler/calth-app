import { Checkbox } from "@components/ui/checkbox";

import { addDays, eachDayOfInterval, format, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";

import { cn } from "@core/lib/utils";

interface IProps {
  "aria-invalid"?: boolean;
  disabled?: boolean;
  onChange?: (value: number[]) => void;
  value?: number[];
}

export function WorkingDays({ "aria-invalid": ariaInvalid, disabled, onChange, value = [] }: IProps) {
  const firstDayOfCurrentWeek = startOfWeek(new Date(), { locale: es });
  const weekdays = eachDayOfInterval({
    start: firstDayOfCurrentWeek,
    end: addDays(firstDayOfCurrentWeek, 6),
  }).map((day) => format(day, "EE", { locale: es }));

  const indexToDayValue = (index: number): number => (index + 1) % 7;

  function handleChecked(index: number, checked: "indeterminate" | boolean) {
    if (!onChange) return;

    const dayValue = indexToDayValue(index);

    if (checked === true) {
      onChange([...value, dayValue].sort((a, b) => a - b));
    } else {
      onChange(value.filter((day) => day !== dayValue));
    }
  }

  return (
    <div
      className={cn(
        "flex justify-between gap-3 rounded-md p-1 md:justify-start lg:gap-5",
        ariaInvalid && "ring-destructive ring-2",
      )}
    >
      {weekdays.map((dayLabel, index) => (
        <div key={index} className="flex flex-col items-center gap-1">
          <Checkbox
            aria-invalid={ariaInvalid}
            checked={value.includes(indexToDayValue(index))}
            disabled={disabled}
            id="workingDays"
            onCheckedChange={(checked) => handleChecked(index, checked)}
          />
          <span className="text-xs font-normal uppercase">{dayLabel}</span>
        </div>
      ))}
    </div>
  );
}
