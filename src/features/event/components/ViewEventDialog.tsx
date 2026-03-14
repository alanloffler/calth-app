import { CalendarCheck, Clock } from "lucide-react";

import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { UpdateStatus } from "@event/components/ui/UpdateStatus";

import type { Dispatch, SetStateAction } from "react";
import { es } from "date-fns/locale";
import { format } from "date-fns";

import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";
import { useEventStore } from "@calendar/stores/event.store";

interface IProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>> | ((open: boolean) => void);
  onEventChange?: () => void;
}

export function ViewEventDialog({ open, setOpen, onEventChange }: IProps) {
  const { selectedEvent, setSelectedEvent } = useEventStore();

  if (!selectedEvent) return null;

  function handleClose(): void {
    setSelectedEvent(null);
    setOpen(false);
  }

  const handleEventChange = (updatedEvent: ICalendarEvent) => {
    setSelectedEvent(updatedEvent);
    onEventChange?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="gap-6 sm:min-w-120">
        <DialogHeader>
          <DialogTitle>{selectedEvent.title}</DialogTitle>
          <DialogDescription className="sr-only"></DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <div>
            <UpdateStatus event={selectedEvent} onEventChange={handleEventChange} size="md" />
          </div>
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
          <div className="flex items-center gap-2">
            <CalendarCheck className="size-5" />
            <span>{format(selectedEvent.startDate, "P", { locale: es })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="size-5" />
            <span>{`${format(selectedEvent.startDate, "HH:mm", { locale: es })} - ${format(selectedEvent.endDate, "HH:mm", { locale: es })} hs.`}</span>
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
