import { FileText, Trash2 } from "lucide-react";

import { Button } from "@components/ui/button";
import { DataTablePaginated } from "@components/data-table/DataTablePaginated";
import { EventStatus } from "@calendar/components/ui/EventStatus";
import { Filters } from "@event/components/Filters";
import { PageHeader } from "@components/pages/PageHeader";
import { SortableHeader } from "@components/data-table/SortableHeader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";
import { ViewEventSheet } from "@calendar/components/sheets/ViewEventSheet";

import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table";
import { enUS, es } from "date-fns/locale";
import { type Locale } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";
import type { IEventFilters } from "@event/interfaces/filters.interface";
import { EventsService } from "@event/services/events.service";
import { formatShortDateTime } from "@core/formatters/date.formatter";
import { useEventStore } from "@calendar/stores/event.store";

// TODO: get from config
const LIMIT = 10;
const LOCALE = "es";

const localeMap: Record<string, Locale> = {
  en: enUS,
  es: es,
};

export default function Events() {
  const [filters, setFilters] = useState<IEventFilters>({
    date: undefined,
    patientId: undefined,
    professionalId: undefined,
    status: undefined,
  });

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: LIMIT,
  });

  const [sorting, setSorting] = useState<SortingState>([]);

  const { setSelectedEvent, setOpenViewEventSheet, refreshKey } = useEventStore();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["events", filters, pagination, sorting],
    queryFn: () => {
      const sort = sorting[0];
      return EventsService.findEventsFiltered(
        filters,
        pagination.pageSize,
        pagination.pageIndex + 1,
        sort?.id,
        sort ? (sort.desc ? "desc" : "asc") : undefined,
      );
    },
  });

  useEffect(() => {
    refetch();
  }, [refetch, refreshKey]);

  const handleSearch = useCallback(() => refetch(), [refetch]);

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
      accessorFn: (row) => row.professional?.firstName,
      cell: ({ row }) =>
        `${row.original.professional.professionalProfile?.professionalPrefix} ${row.original.professional.firstName} ${row.original.professional.lastName}`,
    },
    {
      accessorKey: "user.firstName",
      header: ({ column }) => <SortableHeader column={column}>Paciente</SortableHeader>,
      accessorFn: (row) => row.user?.firstName,
      cell: ({ row }) => `${row.original.user.firstName} ${row.original.user.lastName}`,
    },
    {
      id: "actions",
      minSize: 168,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="hover:text-view"
                size="icon-sm"
                variant="outline"
                onClick={() => {
                  setSelectedEvent(row.original);
                  setOpenViewEventSheet(true);
                }}
              >
                <FileText />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ver detalles</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="hover:text-delete"
                size="icon-sm"
                variant="outline"
                onClick={() => {
                  setSelectedEvent(row.original);
                }}
              >
                <Trash2 />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Eliminar</TooltipContent>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-8">
        <PageHeader title="Turnos" subtitle="Módulo de visualización y administración de turnos" />
        <Filters filters={filters} setFilters={setFilters} onSearch={handleSearch} />
        <DataTablePaginated
          columns={columns}
          data={data?.data?.result}
          defaultPageSize={LIMIT}
          loading={isLoading}
          onPaginationChange={setPagination}
          onSortingChange={setSorting}
          rowCount={data?.data?.total}
          searchable={false}
        />
      </div>
      <ViewEventSheet />
    </>
  );
}
