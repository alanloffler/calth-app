import { CalendarClock } from "lucide-react";

import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/ui/table";

import { es } from "date-fns/locale";
import { format } from "date-fns";

import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";

interface IProps {
  affectedEvents: ICalendarEvent[];
  open: boolean;
  onCancel: () => void;
  onSaveAndManage: () => void;
}

export function ScheduleImpactDialog({ affectedEvents, open, onCancel, onSaveAndManage }: IProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="gap-6 sm:min-w-160">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="size-5 shrink-0 text-amber-500" />
            Turnos afectados por el cambio de horario
          </DialogTitle>
          <DialogDescription>
            {affectedEvents.length === 1
              ? "1 turno pendiente queda fuera del nuevo horario"
              : `${affectedEvents.length} turnos pendientes quedan fuera del nuevo horario`}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-80 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Horario</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {affectedEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{`${event.user.firstName} ${event.user.lastName}`}</TableCell>
                  <TableCell>{format(new Date(event.startDate), "P", { locale: es })}</TableCell>
                  <TableCell>{`${format(new Date(event.startDate), "HH:mm")} - ${format(new Date(event.endDate), "HH:mm")} hs.`}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button onClick={onCancel} variant="ghost">
            Cancelar
          </Button>
          <Button onClick={onSaveAndManage} variant="default">
            Guardar y gestionar turnos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
