import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";

import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";

import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";
import { CalendarService } from "@calendar/services/calendar.service";
import { cn } from "@lib/utils";
import { useTryCatch } from "@core/hooks/useTryCatch";

interface IProps {
  "aria-invalid"?: boolean;
  id?: string;
  onChange?: (value: ICalendarEvent) => void;
  value?: string;
  width?: string;
}

export function EventCombobox({ "aria-invalid": ariaInvalid, id, onChange, value = "", width }: IProps) {
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<ICalendarEvent[] | undefined>(undefined);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<ICalendarEvent | null>(null);
  const { isLoading, tryCatch } = useTryCatch();

  const findUsers = useCallback(async () => {
    const [response, error] = await tryCatch(CalendarService.findAllByBusiness(10));

    if (error) {
      setError("Error");
    }

    if (response && response?.statusCode === 200) {
      setEvents(response?.data);
    }
  }, [tryCatch, onChange]);

  useEffect(() => {
    findUsers();
  }, [findUsers]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className={cn(width ? width : "w-full")}>
        <Button
          aria-expanded={open}
          aria-invalid={ariaInvalid}
          className={cn(
            "font-normal disabled:opacity-100",
            value || error || isLoading ? "justify-between!" : "justify-end!",
            error || ariaInvalid ? "text-destructive border-destructive" : "",
          )}
          disabled={isLoading || error !== null}
          id={id}
          role="combobox"
          variant="outline"
        >
          {isLoading && "Cargando..."}
          {error && "Error"}
          <span>{selectedEvent ? `${format(selectedEvent.startDate, "P")} / ${selectedEvent.title}` : value}</span>
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
                  keywords={[event.professional.firstName]}
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
