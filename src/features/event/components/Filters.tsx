import { Calendar as CalendarIcon, ChevronDown, SlidersHorizontal } from "lucide-react";

import { Button } from "@components/ui/button";
import { Calendar } from "@components/ui/calendar";
import { Card } from "@components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { UserCombobox } from "@calendar/components/UserCombobox";

import { es } from "date-fns/locale";
import { format } from "date-fns";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

import type { IEventFilters } from "@event/interfaces/filters.interface";

interface IProps {
  filters?: IEventFilters;
  setFilters: Dispatch<SetStateAction<IEventFilters | undefined>>;
}

export function Filters({ filters, setFilters }: IProps) {
  const [calendarOpen, setCalendarOpen] = useState<boolean>(false);
  const [date, setDate] = useState<Date | undefined>(filters?.date);
  const [patientId, setPatientId] = useState<string | undefined>(filters?.patientId);
  const [professionalId, setProfessionalId] = useState<string | undefined>(filters?.professionalId);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, date, patientId, professionalId }));
  }, [date, professionalId, patientId]);

  const hasFilters = date || patientId || professionalId;

  const handleClearFilters = () => {
    setDate(undefined);
    setPatientId(undefined);
    setProfessionalId(undefined);
    setFilters(undefined);
  };

  return (
    <Card className="bg-primary/5 flex-row items-center rounded-md p-3">
      <SlidersHorizontal className="size-5" />
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-50">
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date-picker-simple"
                  className="w-full justify-start px-3 py-2 font-normal"
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="size-4" />
                      {date ? format(date, "P", { locale: es }) : "Fecha"}
                    </div>
                    <ChevronDown className="opacity-50" />
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(selectedDate) => {
                    setDate(selectedDate);
                    setCalendarOpen(false);
                  }}
                  defaultMonth={date}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="w-50">
            <UserCombobox
              placeholder="Profesional"
              userType="professional"
              value={professionalId}
              onChange={setProfessionalId}
            />
          </div>
          <div className="w-50">
            <UserCombobox placeholder="Paciente" userType="patient" value={patientId} onChange={setPatientId} />
          </div>
          {hasFilters && (
            <Button className="text-foreground" size="sm" variant="link" onClick={handleClearFilters}>
              Borrar
            </Button>
          )}
        </div>
        <Button size="default" variant="default">
          Buscar
        </Button>
      </div>
    </Card>
  );
}
