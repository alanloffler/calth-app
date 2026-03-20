import { Activity } from "react";
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
import { useEffect, useState } from "react";

import { EventsService } from "@event/services/events.service";
import { tryCatch } from "@core/utils/try-catch";
import { Minus, Plus } from "lucide-react";

interface IProps {
  disabled: boolean;
  selectedDate: string;
  slotDuration: number | undefined;
}

export function ChooseRecurringDate({ disabled, selectedDate, slotDuration }: IProps) {
  const [days, setDays] = useState<number>(2);
  const [display, setDisplay] = useState<boolean>(false);
  const [openRecurringDialog, setOpenRecurringDialog] = useState<boolean>(false);

  function handleChecked(checked: boolean) {
    setDisplay(checked);
    setDays(2);
  }

  async function handleCheckAvailability(): Promise<void> {
    const [response, error] = await tryCatch(EventsService.checkRecurringAvailability(days));
    if (error) {
      toast.error(error.message);
    }
    if (response && response.statusCode === 200) {
      setOpenRecurringDialog(true);
    }
  }

  useEffect(() => {
    if (disabled) handleChecked(false);
  }, [disabled]);

  return (
    <>
      <div className="flex flex-col gap-2">
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
                defaultValue={"2"}
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
        </Activity>
      </div>
      <Dialog open={openRecurringDialog} onOpenChange={setOpenRecurringDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles del turno recurrente</DialogTitle>
            <DialogDescription className="sr-only"></DialogDescription>
          </DialogHeader>
          {slotDuration && (
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
              </ul>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setOpenRecurringDialog(false)} type="button" size="sm" variant="secondary">
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
