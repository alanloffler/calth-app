import { Minus, Plus } from "lucide-react";

import { Activity, useCallback } from "react";
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
import { toast } from "sonner";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";

import { EventsService } from "@event/services/events.service";
import { cn } from "@lib/utils";
import { tryCatch } from "@core/utils/try-catch";

interface IProps {
  disabled: boolean;
  error?: string;
  onActiveChange: (active: boolean) => void;
  onConfirm: (dates: string[], count: number) => void;
  recurringDays: { date: string }[] | undefined;
  selectedDate: string;
  setRecurringDays: Dispatch<SetStateAction<{ date: string }[] | undefined>>;
  slotDuration: number | undefined;
}

export function ChooseRecurringDate({
  disabled,
  error,
  onActiveChange,
  onConfirm,
  recurringDays,
  selectedDate,
  setRecurringDays,
  slotDuration,
}: IProps) {
  const [days, setDays] = useState<number>(2);
  const [display, setDisplay] = useState<boolean>(false);
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
    const [response, error] = await tryCatch(EventsService.checkRecurringAvailability(selectedDate, days));
    if (error) {
      toast.error(error.message);
    }
    if (response && response.statusCode === 200) {
      setOpenRecurringDialog(true);
      setRecurringDays(response.data);
    }
  }

  useEffect(() => {
    if (disabled) handleChecked(false);
  }, [disabled, handleChecked]);

  useEffect(() => {
    setRecurringDays(undefined);
    setOpenRecurringDialog(false);
  }, [selectedDate, setRecurringDays]);

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={display}
            disabled={disabled || !slotDuration}
            id="recurring"
            name="recurring"
            onCheckedChange={() => handleChecked(!display)}
          />
          <FieldLabel htmlFor="recurring">Recurrente</FieldLabel>
        </div>
        {error && (
          <div className="w-fit rounded-md border border-red-200 bg-red-100 px-2 py-1 text-sm text-red-600">
            {error}
          </div>
        )}
        <Activity mode={display && !disabled ? "visible" : "hidden"}>
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
            <Button disabled={days === 0} onClick={handleCheckAvailability} type="button" size="sm" variant="secondary">
              Comprobar disponibilidad
            </Button>
          </div>
          {recurringDays && recurringDays.length === 0 && (
            <div className="w-fit rounded-md border border-red-200 bg-red-100 px-2 py-1 text-sm text-red-600">
              No hay {days} turnos recurrentes disponibles, elegí otra fecha u horario
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
                    {addMinutes(selectedDate, slotDuration).getHours()}:
                    {addMinutes(selectedDate, slotDuration).getMinutes()} hs.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">Recurrencia:</span>
                  <span>{days} turnos</span>
                </li>
                <li className={cn("flex gap-2", !recurringDays || recurringDays.length === 0 ? "items-center" : "")}>
                  <span className="font-semibold">Detalles:</span>
                  <ul className="flex flex-col gap-1">
                    {recurringDays && recurringDays.length > 0 ? (
                      recurringDays.map((d) => <li key={d.date}>{format(d.date, "PPPP", { locale: es })}</li>)
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
                if (recurringDays && recurringDays.length > 0) {
                  onConfirm(
                    recurringDays.map((d) => d.date),
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
