import { Button } from "@components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@components/ui/dialog";
import { EventStatus } from "@calendar/components/ui/EventStatus";

import type { Dispatch, SetStateAction } from "react";
import { es } from "date-fns/locale";
import { format } from "date-fns";

import { useEventStore } from "@calendar/stores/event.store";

interface IProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function ViewEventDialog({ open, setOpen }: IProps) {
  const { selectedEvent, setSelectedEvent } = useEventStore();

  if (!selectedEvent) return null;

  function handleClose(): void {
    setSelectedEvent(null);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="gap-6 sm:min-w-120">
        <DialogHeader>
          <DialogTitle>{selectedEvent.title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          <div className="flex gap-2">
            <span className="font-semibold">Profesional:</span>
            <span>
              {`${selectedEvent.professional.professionalProfile?.professionalPrefix} ${selectedEvent.professional.firstName} ${selectedEvent.professional.lastName}`}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold">Paciente:</span>
            <span>{`${selectedEvent.user.firstName} ${selectedEvent.user.lastName}`}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold">Fecha:</span>
            <span>{format(selectedEvent.startDate, "P", { locale: es })}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold">Horario:</span>
            <span>{`${format(selectedEvent.startDate, "HH:mm", { locale: es })} - ${format(selectedEvent.endDate, "HH:mm", { locale: es })} hs.`}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Estado:</span>
            <EventStatus variant={selectedEvent.status} />
          </div>
          <div className="text-muted-foreground flex gap-2 pt-4 text-sm">
            <span>Creado el</span>
            <span>{`${format(selectedEvent.createdAt, "PPPP", { locale: es })} - ${format(selectedEvent.createdAt, "HH:mm", { locale: es })} hs.`}</span>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleClose} variant="default">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
