import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { EventStatus } from "@calendar/components/ui/EventStatus";
import { Link } from "react-router";
import { Loader } from "@components/Loader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/ui/table";

import { es } from "date-fns/locale";
import { format } from "date-fns";
import { toast } from "sonner";
import { useCallback, useEffect } from "react";

import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";
import { CalendarService } from "@calendar/services/calendar.service";
import { cn } from "@lib/utils";
import { useEventStore } from "@calendar/stores/event.store";
import { useTryCatch } from "@core/hooks/useTryCatch";

interface IProps {
  className?: string;
}

export function LatestEvents({ className }: IProps) {
  const setOpenViewEventSheet = useEventStore((state) => state.setOpenViewEventSheet);
  const setSelectedEvent = useEventStore((state) => state.setSelectedEvent);
  const { isLoading, tryCatch } = useTryCatch();
  const { events, setEvents, refreshKey } = useEventStore();

  const getLatestEvents = useCallback(async () => {
    const [response, error] = await tryCatch(CalendarService.findAllByBusiness(5));

    if (error) {
      toast.error(error.message);
      return;
    }

    if (response && response.statusCode === 200) {
      setEvents(response.data);
    }
  }, [tryCatch]);

  function handleSelectEvent(event: ICalendarEvent): void {
    setSelectedEvent(event);
    setOpenViewEventSheet(true);
  }

  useEffect(() => {
    getLatestEvents();
  }, [getLatestEvents, refreshKey]);

  return (
    <Card className={cn("relative gap-4 px-6", className)}>
      <h2 className="font-semibold">Últimos turnos</h2>
      {isLoading ? (
        <Loader absolute size={20} text="Cargando turnos" />
      ) : (
        <>
          <Table>
            <TableHeader className="dark:bg-primary-foreground bg-neutral-100">
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Horario</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Profesional</TableHead>
                <TableHead>Paciente</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events?.map((event) => (
                <TableRow
                  className="hover:cursor-pointer hover:bg-neutral-50/80 dark:hover:bg-neutral-900/50"
                  key={event.id}
                  onClick={() => handleSelectEvent(event)}
                >
                  <TableCell>{format(event.startDate, "dd/MM", { locale: es })}</TableCell>
                  <TableCell>{format(event.startDate, "HH:mm", { locale: es }) + " hs."}</TableCell>
                  <TableCell>
                    <EventStatus size="small" variant={event.status} />
                  </TableCell>
                  <TableCell>{event.title}</TableCell>
                  <TableCell>{`${event.professional.professionalProfile?.professionalPrefix} ${event.professional.firstName} ${event.professional.lastName}`}</TableCell>
                  <TableCell>{`${event.user.firstName} ${event.user.lastName}`}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button className="text-foreground justify-end" variant="link" asChild>
            <Link to="/calendar">Ver todos</Link>
          </Button>
        </>
      )}
    </Card>
  );
}
