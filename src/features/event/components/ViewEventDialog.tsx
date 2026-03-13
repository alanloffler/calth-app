import { Button } from "@components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@components/ui/dialog";

import type { Dispatch, SetStateAction } from "react";
import { es } from "date-fns/locale";
import { format } from "date-fns";

import { DEventStatus } from "@calendar/dictionaries/status.dictionary";
import { useEventStore } from "@calendar/stores/event.store";

interface IProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function ViewEventDialog({ open, setOpen }: IProps) {
  const { selectedEvent, setSelectedEvent } = useEventStore();

  if (!selectedEvent) return null;

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
            <span>{format(selectedEvent.startDate, "HH:mm", { locale: es })}</span>-
            <span>{format(selectedEvent.endDate, "HH:mm", { locale: es })}</span> hs.
          </div>
          <div className="flex gap-2">
            <span className="font-semibold">Estado:</span>
            <span>{DEventStatus[selectedEvent.status]}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold">Creación:</span>
            <span>{format(selectedEvent.createdAt, "PPPP", { locale: es })}</span> -
            <span>{format(selectedEvent.createdAt, "HH:mm", { locale: es })}</span> hs.
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              setSelectedEvent(null);
              setOpen(false);
            }}
            variant="default"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
