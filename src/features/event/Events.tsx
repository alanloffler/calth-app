import { FileText } from "lucide-react";

import { Button } from "@components/ui/button";
import { DataTable } from "@components/data-table/DataTable";
import { EventStatus } from "@calendar/components/ui/EventStatus";
import { Filters } from "@event/components/Filters";
import { SortableHeader } from "@components/data-table/SortableHeader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";

import type { ColumnDef } from "@tanstack/react-table";
import { enUS, es } from "date-fns/locale";
import { type Locale } from "date-fns";
import { useQuery } from "@tanstack/react-query";

import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";
import { EventsService } from "@event/services/events.service";
import { formatShortDateTime } from "@core/formatters/date.formatter";

const LIMIT = 10;

const localeMap: Record<string, Locale> = {
  en: enUS,
  es: es,
};

const LOCALE = "es";

export default function Events() {
  const { data: events } = useQuery({
    queryKey: ["events", LIMIT],
    queryFn: () => EventsService.findAllByBusiness(LIMIT),
  });

  const columns: ColumnDef<ICalendarEvent>[] = [
    {
      accessorKey: "startDate",
      header: ({ column }) => <SortableHeader column={column}>Fecha</SortableHeader>,
      cell: ({ row }) => formatShortDateTime(row.original?.startDate, localeMap[LOCALE]),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <SortableHeader column={column}>Estado</SortableHeader>,
      cell: ({ row }) => (
        <div className="flex justify-start">
          <EventStatus size="small" variant={row.original.status}>
            {row.original.status}
          </EventStatus>
        </div>
      ),
    },
    {
      accessorKey: "title",
      enableHiding: true,
      header: ({ column }) => <SortableHeader column={column}>Título</SortableHeader>,
    },
    {
      accessorKey: "professional.firstName",
      header: ({ column }) => <SortableHeader column={column}>Profesional</SortableHeader>,
      cell: ({ row }) =>
        `${row.original.professional.professionalProfile?.professionalPrefix} ${row.original.professional.firstName} ${row.original.professional.lastName}`,
    },
    {
      accessorKey: "user.firstName",
      header: ({ column }) => <SortableHeader column={column}>Paciente</SortableHeader>,
      cell: ({ row }) => `${row.original.user.firstName} ${row.original.user.lastName}`,
    },
    {
      id: "actions",
      minSize: 168,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="hover:text-view" size="icon-sm" variant="outline">
                <FileText />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ver detalles</TooltipContent>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Filters />
      <DataTable columns={columns} data={events?.data} />
    </div>
  );
}
