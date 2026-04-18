import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";

import { es } from "date-fns/locale";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";
import { CalendarService } from "@calendar/services/calendar.service";
import { cn } from "@core/lib/utils";

interface IProps {
  "aria-invalid"?: boolean;
  disabled?: boolean;
  id?: string;
  onChange?: (value: ICalendarEvent) => void;
  professionalId: string;
  userId: string;
  value?: string;
  width?: string;
}

export function EventCombobox({
  "aria-invalid": ariaInvalid,
  disabled = false,
  id,
  onChange,
  professionalId,
  userId,
  value = "",
  width,
}: IProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<ICalendarEvent | null>(null);

  const {
    data: events,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["events", professionalId, userId],
    queryFn: () => CalendarService.findByBusinessProfessionalPatient(professionalId, userId),
    select: (response) => (response?.statusCode === 200 ? response?.data : undefined),
  });

  useEffect(() => {
    if (!events || !value) return;
    const match = events.find((e) => e.id === value);
    if (match) setSelectedEvent(match);
  }, [events, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className={cn(width ? width : "w-full")}>
        <Button
          aria-expanded={open}
          aria-invalid={ariaInvalid}
          className={cn(
            "justify-between font-normal disabled:opacity-100",
            error || ariaInvalid ? "text-destructive border-destructive" : "",
            disabled ? "opacity-50!" : "",
          )}
          disabled={isLoading || error !== null || disabled}
          id={id}
          role="combobox"
          variant="outline"
        >
          {isLoading && "Cargando..."}
          {error && "Error"}
          <span className="truncate">
            {selectedEvent ? `${format(selectedEvent.startDate, "P")} / ${selectedEvent.title}` : value}
          </span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("p-0", width ? width : "w-full")}
        onTouchMove={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        <Command>
          <CommandInput className="h-9" />
          <CommandList>
            <CommandEmpty>Sin resultados</CommandEmpty>
            <CommandGroup>
              {events?.map((event) => (
                <CommandItem
                  key={event.id}
                  keywords={[event.title, format(event.startDate, "P", { locale: es })]}
                  onSelect={() => {
                    setSelectedEvent(event);
                    onChange?.(event);
                    setOpen(false);
                  }}
                  value={event.id}
                >
                  {`${format(event.startDate, "P")} / ${event.title}`}
                  <Check className={cn("ml-auto", value === event.id ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
