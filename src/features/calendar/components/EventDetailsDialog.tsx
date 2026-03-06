import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { EventStatus } from "@calendar/components/ui/EventStatus";
import { Loader } from "@components/Loader";

import { es } from "date-fns/locale";
import { format } from "date-fns";
import { toast } from "sonner";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useTryCatch } from "@core/hooks/useTryCatch";

import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";
import { CalendarService } from "@calendar/services/calendar.service";

interface IProps {
  eventId: string | null | undefined;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function EventDetailsDialog({ eventId, open, setOpen }: IProps) {
  const [event, setEvent] = useState<ICalendarEvent | undefined>(undefined);
  const { isLoading, tryCatch } = useTryCatch();

  useEffect(() => {
    if (!eventId) return;

    async function getEvent(eventId: string): Promise<void> {
      const [response, error] = await tryCatch(CalendarService.findOne(eventId));

      if (error) {
        setOpen(false);
        toast.error(error.message);
        return;
      }

      if (response && response.statusCode === 200) {
        setEvent(response.data);
      }
    }

    getEvent(eventId);
  }, [eventId, tryCatch]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="gap-6 sm:min-w-120">
        <DialogHeader>
          <DialogTitle>Detalles del turno</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <Loader className="justify-center" size={20} text="Cargando turno" />
        ) : (
          event && (
            <ul className="flex flex-col gap-2">
              <li className="flex gap-3">
                <span className="font-semibold">ID:</span>
                <span>{event?.id}</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold">Título:</span>
                <span>{event?.title}</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold">Fecha:</span>
                <span>{format(event?.startDate, "P", { locale: es })}</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold">Horario:</span>
                <span>
                  {`${format(event?.startDate, "HH:mm", { locale: es })} - ${format(event?.endDate, "HH:mm", { locale: es })} hs.`}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold">Profesional:</span>
                <span>
                  {`${event.professional.professionalProfile?.professionalPrefix}
                    ${event.professional.firstName}
                    ${event.professional.lastName}`}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold">Paciente:</span>
                <span>{`${event.user.firstName} ${event.user.lastName}`}</span>
              </li>
              <li>
                <EventStatus variant={event.status} />
              </li>
            </ul>
          )
        )}
        <DialogFooter>
          <Button onClick={() => setOpen(false)} variant="default">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
