import { Check, Minus, Plus } from "lucide-react";

import { Activity, useCallback } from "react";
import { Badge } from "@components/Badge";
import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";

import { addMinutes, format } from "date-fns";
import { es } from "date-fns/locale";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";

import type { IRecurrentDayResponse } from "@event/interfaces/recurrent-day.interface";
import { EventsService } from "@event/services/events.service";
import { cn } from "@lib/utils";
import { tryCatch } from "@core/utils/try-catch";

interface IProps {
  disabled: boolean;
  error?: string;
  onActiveChange: (active: boolean) => void;
  onConfirm: (dates: string[], count: number) => void;
  onSuggestionSelect: (date: string) => void;
  professionalId: string;
  recurringDays: IRecurrentDayResponse | undefined;
  selectedDate: string;
  setRecurringDays: Dispatch<SetStateAction<IRecurrentDayResponse | undefined>>;
  slotDuration: number | undefined;
}

export function ChooseRecurringDate({
  disabled,
  error,
  onActiveChange,
  onConfirm,
  onSuggestionSelect,
  professionalId,
  recurringDays,
  selectedDate,
  setRecurringDays,
  slotDuration,
}: IProps) {
  const [days, setDays] = useState<number>(2);
  const [display, setDisplay] = useState<boolean>(false);
  const [isNotAvailableError, setIsNotAvailableError] = useState<boolean>(false);
  const [isFetchingError, setIsFetchingError] = useState<boolean>(false);
  const [openRecurringDialog, setOpenRecurringDialog] = useState<boolean>(false);

  const handleChecked = useCallback(
    (checked: boolean): void => {
      setDisplay(checked);
      setDays(2);
      onActiveChange(checked);
    },
    [onActiveChange],
  );

  async function handleCheckAvailability(): Promise<void> {
    setIsNotAvailableError(false);
    setIsFetchingError(false);
    const [response, error] = await tryCatch(
      EventsService.checkRecurringAvailability(professionalId, selectedDate, days),
    );
    if (error) {
      setIsFetchingError(true);
    }
    if (response && response.statusCode === 200 && response.data) {
      setRecurringDays(response.data);

      const isNotAvailable = response.data.dates.some((d) => d.available === false);
      if (isNotAvailable) {
        setIsNotAvailableError(true);
        return;
      }

      setOpenRecurringDialog(true);
    }
  }

  useEffect(() => {
    if (disabled) handleChecked(false);
  }, [disabled, handleChecked]);

  useEffect(() => {
    setRecurringDays(undefined);
    setOpenRecurringDialog(false);
    setIsNotAvailableError(false);
  }, [selectedDate, setRecurringDays]);

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={display}
            className="size-4.5"
            disabled={disabled || !slotDuration}
            id="recurring"
            name="recurring"
            onCheckedChange={() => handleChecked(!display)}
          />
          <FieldLabel htmlFor="recurring">Recurrente</FieldLabel>
          {recurringDays && recurringDays?.dates.length > 0 && (
            <Button onClick={() => setRecurringDays(undefined)} size="sm" variant="secondary">
              Elegir de nuevo
            </Button>
          )}
        </div>
        {error && (
          <div className="w-fit rounded-md border border-red-200 bg-red-100 px-2 py-1 text-sm text-red-600">
            {error}
          </div>
        )}
        <Activity mode={display && !disabled ? "visible" : "hidden"}>
          {!recurringDays && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Button
                  disabled={days <= 2}
                  onClick={() => setDays((prev) => prev - 1)}
                  size="icon-sm"
                  type="button"
                  variant="secondary"
                >
                  <Minus />
                </Button>
                <Input
                  className="max-w-15 appearance-none text-center"
                  inputMode="numeric"
                  maxLength={2}
                  onChange={(e) => (e.target.value !== "" ? setDays(Number(e.target.value)) : setDays(2))}
                  readOnly
                  value={days}
                />
                <Button
                  disabled={days >= 10}
                  onClick={() => {
                    setDays((prev) => prev + 1);
                  }}
                  size="icon-sm"
                  type="button"
                  variant="secondary"
                >
                  <Plus />
                </Button>
              </div>
              <Button
                disabled={days === 0}
                onClick={handleCheckAvailability}
                type="button"
                size="sm"
                variant="secondary"
              >
                Comprobar disponibilidad
              </Button>
            </div>
          )}
          {(recurringDays && recurringDays.dates.length === 0) ||
            (isNotAvailableError ? (
              <div className="flex flex-col gap-3">
                <div className="w-fit rounded-md border border-red-200 bg-red-100 px-2 py-1 text-sm text-red-600">
                  No hay {days} turnos recurrentes disponibles, elegí otra fecha u horario
                </div>
                <ul className="flex flex-col gap-1">
                  {recurringDays?.dates.map((d) => (
                    <li className="flex items-center gap-3" key={d.date}>
                      <Badge size="small" variant={d.available ? "green" : "gray"}>
                        {d.available ? "Disponible" : "Ocupado"}
                      </Badge>
                      <span className="text-sm">{format(d.date, "PPPP", { locale: es })}</span>
                    </li>
                  ))}
                </ul>
                {recurringDays && recurringDays.suggestion && (
                  <div className="flex items-center justify-between gap-3 rounded-md border border-blue-100 bg-blue-50 p-3 text-blue-600 shadow-xs">
                    <div className="flex gap-3">
                      <h3 className="font-semibold">Sugerencia:</h3>
                      <span>{`${format(recurringDays?.suggestion, "EEEE", { locale: es })} a las ${format(recurringDays?.suggestion, "HH:mm", { locale: es })} hs.`}</span>
                    </div>
                    <Button onClick={() => onSuggestionSelect(recurringDays.suggestion)} size="sm" type="button" variant="default">
                      Elegir
                    </Button>
                  </div>
                )}
                {/*{JSON.stringify(recurringDays?.suggestion && format(recurringDays?.suggestion, "PPPP HH:mm"))}*/}
              </div>
            ) : (
              recurringDays && (
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-medium">Se van a crear {days} turnos recurrentes</h3>
                  <ul className="flex flex-col gap-1">
                    {recurringDays?.dates.map((d) => (
                      <li className="flex items-center gap-3" key={d.date}>
                        <span className="flex w-fit rounded-full bg-green-200 p-0.5">
                          <Check className="size-3.5 text-green-700" />
                        </span>
                        <span className="text-sm">{format(d.date, "EEEE, P - HH:mm", { locale: es })} hs.</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            ))}
          {isFetchingError && (
            <div className="w-fit rounded-md border border-red-200 bg-red-100 px-2 py-1 text-sm text-red-600">
              Error al buscar recurrencia para el turno
            </div>
          )}
        </Activity>
      </div>
      <Dialog open={openRecurringDialog} onOpenChange={setOpenRecurringDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles del turno recurrente</DialogTitle>
            <DialogDescription className="sr-only"></DialogDescription>
          </DialogHeader>
          {slotDuration && selectedDate && (
            <div className="flex flex-col gap-2">
              <p>Van a ser creados {days} turnos recurrentes en el mismo día y horario.</p>
              <ul className="flex flex-col gap-2">
                <li className="flex gap-2">
                  <span className="font-semibold">Día:</span>
                  <span>{format(selectedDate, "EEEE", { locale: es })}</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">Horario:</span>
                  <span>
                    {format(selectedDate, "HH:mm", { locale: es })} -{" "}
                    {format(addMinutes(selectedDate, slotDuration), "HH:mm", { locale: es })} hs.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">Recurrencia:</span>
                  <span>{days} turnos</span>
                </li>
                <li
                  className={cn(
                    "flex flex-col gap-1",
                    !recurringDays || recurringDays.dates.length === 0 ? "items-center" : "",
                  )}
                >
                  <span className="font-semibold">Detalles:</span>
                  <ul className="flex flex-col gap-1 pl-2">
                    {recurringDays && recurringDays.dates.length > 0 ? (
                      recurringDays.dates.map((d, idx) => (
                        <li className="flex items-center gap-2" key={d.date}>
                          <Badge className="uppercase" size="small" variant="ic">
                            Turno {idx + 1}
                          </Badge>
                          <span> {format(d.date, "PPPP", { locale: es })}</span>
                        </li>
                      ))
                    ) : (
                      <li className="rounded-md border border-red-200 bg-red-100 px-2 py-1 text-sm text-red-600">
                        No hay {days} turnos recurrentes disponibles
                      </li>
                    )}
                  </ul>
                </li>
              </ul>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setOpenRecurringDialog(false)} type="button" size="default" variant="secondary">
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (recurringDays && recurringDays.dates.length > 0) {
                  onConfirm(
                    recurringDays.dates.map((d) => d.date),
                    days,
                  );
                }
                setOpenRecurringDialog(false);
              }}
              type="button"
              size="default"
              variant="default"
            >
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
