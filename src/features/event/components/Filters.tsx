import { ChevronDown, SlidersHorizontal } from "lucide-react";

import { Button } from "@components/ui/button";
import { Calendar } from "@components/ui/calendar";
import { Card } from "@components/ui/card";
import { Checkbox } from "@components/ui/checkbox";
import { ClearIconButton } from "@components/ui/ClearIconButton";
import { Label } from "@components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { SelectEventStatus } from "@event/components/ui/SelectEventStatus";
import { UserCombobox } from "@calendar/components/UserCombobox";

import { es } from "date-fns/locale";
import { format } from "date-fns";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

import type { IEventFilters } from "@event/interfaces/filters.interface";
import { cn } from "@core/lib/utils";
import { useSidebar } from "@components/ui/sidebar";

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
  const [recurrent, setRecurrent] = useState<boolean>(filters?.recurrent || false);
  const [status, setStatus] = useState<string | undefined>(filters?.status);
  const { open } = useSidebar();

  useEffect(() => {
    setFilters((prev) => ({ ...prev, date, patientId, professionalId, recurrent, status }));
  }, [date, professionalId, patientId, recurrent, status, setFilters]);

  useEffect(() => {
    Promise.resolve().then(onSearch);
  }, [onSearch]);

  const hasFilters = date || patientId || professionalId || recurrent || status;

  const handleClearFilters = () => {
    setDate(undefined);
    setPatientId(undefined);
    setProfessionalId(undefined);
    setRecurrent(false);
    setStatus(undefined);
    setFilters({
      date: undefined,
      patientId: undefined,
      professionalId: undefined,
      recurrent: false,
      status: undefined,
    });
    Promise.resolve().then(onSearch);
  };

  return (
    <Card className="flex-row items-center rounded-md p-3">
      <SlidersHorizontal className="hidden size-5 shrink-0 lg:block" />
      <div className="flex w-full flex-col items-center justify-between gap-3 lg:flex-row">
        <div
          className={cn(
            "grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:w-fit lg:grid-cols-5",
            open && "lg:grid-cols-4 xl:grid-cols-5",
          )}
        >
          {/* Date input */}
          <div className="flex items-center gap-3">
            <div className="w-full min-w-35 xl:w-45 2xl:w-50">
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
            <ClearIconButton state={date} setState={setDate} />
          </div>
          {/* Status input */}
          <div className="flex items-center gap-3">
            <div className="w-full min-w-35 xl:w-45 2xl:w-50">
              <SelectEventStatus status={status} setStatus={setStatus} />
            </div>
            <ClearIconButton state={status} setState={setStatus} />
          </div>
          {/* Professional input */}
          <div className="flex items-center gap-3">
            <div className="w-full min-w-35 xl:w-45 2xl:w-50">
              <UserCombobox
                placeholder="Profesional"
                userType="professional"
                value={professionalId}
                onChange={setProfessionalId}
              />
            </div>
            <ClearIconButton state={professionalId} setState={setProfessionalId} />
          </div>
          {/* Patient input */}
          <div className="flex items-center gap-3">
            <div className="w-full min-w-35 xl:w-45 2xl:w-50">
              <UserCombobox placeholder="Paciente" userType="patient" value={patientId} onChange={setPatientId} />
            </div>
            <ClearIconButton state={patientId} setState={setPatientId} />
          </div>
          {/* Recurrent input */}
          <div className="flex w-full min-w-35 items-center gap-3 xl:w-45 2xl:w-50">
            <Checkbox
              className="size-4.5"
              id="recurrent"
              checked={!!recurrent}
              onCheckedChange={() => setRecurrent(!recurrent)}
            />
            <Label className="font-normal" htmlFor="recurrent">
              Recurrentes
            </Label>
          </div>
        </div>
        <div className="flex w-full flex-col items-center justify-center gap-3 sm:w-fit sm:flex-row">
          {hasFilters && (
            <Button className="w-full sm:w-auto" onClick={handleClearFilters} size="sm" variant="ghost">
              Borrar todos
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
