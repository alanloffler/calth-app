import { ChevronDown, SlidersHorizontal } from "lucide-react";

import { Button } from "@components/ui/button";
import { Calendar } from "@components/ui/calendar";
import { Card } from "@components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { SelectEventStatus } from "@event/components/ui/SelectEventStatus";
import { UserCombobox } from "@calendar/components/UserCombobox";

import { es } from "date-fns/locale";
import { format } from "date-fns";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

import type { IEventFilters } from "@event/interfaces/filters.interface";

interface IProps {
  filters?: IEventFilters;
  onSearch: () => void;
  setFilters: Dispatch<SetStateAction<IEventFilters>>;
}

export function Filters({ filters, onSearch, setFilters }: IProps) {
  const [calendarOpen, setCalendarOpen] = useState<boolean>(false);
  const [date, setDate] = useState<Date | undefined>(filters?.date);
  const [patientId, setPatientId] = useState<string | undefined>(filters?.patientId);
  const [professionalId, setProfessionalId] = useState<string | undefined>(filters?.professionalId);
  const [status, setStatus] = useState<string | undefined>(filters?.status);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, date, patientId, professionalId, status }));
  }, [date, professionalId, patientId, status, setFilters]);

  const hasFilters = date || patientId || professionalId || status;

  const handleClearFilters = () => {
    setDate(undefined);
    setPatientId(undefined);
    setProfessionalId(undefined);
    setStatus(undefined);
    setFilters({
      date: undefined,
      patientId: undefined,
      professionalId: undefined,
      status: undefined,
    });
    Promise.resolve().then(onSearch);
  };

  return (
    <Card className="flex-row items-center rounded-md p-3">
      <SlidersHorizontal className="hidden size-5 shrink-0 lg:block" />
      <div className="flex w-full flex-col items-center justify-between gap-3 lg:flex-row">
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:w-fit lg:grid-cols-4">
          <div className="w-full min-w-30 xl:w-45 2xl:w-50">
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date-picker-simple"
                  className="w-full justify-start px-3 py-2 font-normal"
                >
                  <div className="flex w-full min-w-0 items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate">{date ? format(date, "P", { locale: es }) : "Fecha"}</span>
                    </div>
                    <ChevronDown className="shrink-0 opacity-50" />
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
          <div className="w-full min-w-30 xl:w-45 2xl:w-50">
            <UserCombobox
              placeholder="Profesional"
              userType="professional"
              value={professionalId}
              onChange={setProfessionalId}
            />
          </div>
          <div className="w-full min-w-30 xl:w-45 2xl:w-50">
            <UserCombobox placeholder="Paciente" userType="patient" value={patientId} onChange={setPatientId} />
          </div>
          <div className="w-full min-w-30 xl:w-45 2xl:w-50">
            <SelectEventStatus status={status} setStatus={setStatus} />
          </div>
        </div>
        <div className="flex w-full flex-col items-center justify-center gap-3 sm:w-fit sm:flex-row">
          {hasFilters && (
            <Button className="w-full sm:w-auto" size="sm" variant="link" onClick={handleClearFilters}>
              Borrar
            </Button>
          )}
          <Button className="w-full sm:w-auto" size="default" variant="default" onClick={onSearch}>
            Buscar
          </Button>
        </div>
      </div>
    </Card>
  );
}
