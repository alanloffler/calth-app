import { Card } from "@components/ui/card";
import { EventStatus } from "@calendar/components/ui/EventStatus";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/ui/table";

import { es } from "date-fns/locale";
import { format } from "date-fns";
import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";

import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";
import { CalendarService } from "@calendar/services/calendar.service";
import { cn } from "@lib/utils";
import { useTryCatch } from "@core/hooks/useTryCatch";

interface IProps {
  className?: string;
}

export function LatestEvents({ className }: IProps) {
  const [events, setEvents] = useState<ICalendarEvent[]>();
  const { isLoading, tryCatch } = useTryCatch();

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

  useEffect(() => {
    getLatestEvents();
  }, [getLatestEvents]);

  if (isLoading) return <>Is Loading</>;

  return (
    <Card className={cn("gap-4 px-6", className)}>
      <h2 className="font-semibold">Últimos turnos</h2>
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
    </Card>
  );
}
