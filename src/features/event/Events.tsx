import { FilePenLine, FileText, Plus, Trash2 } from "lucide-react";

import { Badge } from "@components/Badge";
import { Button } from "@components/ui/button";
import { ConfirmDialog } from "@components/dialogs/ConfirmDialog";
import { DataTablePaginated } from "@components/data-table/DataTablePaginated";
import { EventStatus } from "@calendar/components/ui/EventStatus";
import { Filters } from "@event/components/Filters";
import { PageHeader } from "@components/pages/PageHeader";
import { Protected } from "@auth/components/Protected";
import { SortableHeader } from "@components/data-table/SortableHeader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";

import axios from "axios";
import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table";
import { enUS, es } from "date-fns/locale";
import { format, type Locale } from "date-fns";
import { toast } from "sonner";
import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";
import type { IEventFilters } from "@event/interfaces/filters.interface";
import { EventsService } from "@event/services/events.service";
import { EventsTableConfig } from "@core/config/table.config";
import { formatShortDateTime } from "@core/formatters/date.formatter";
import { queryClient } from "@core/lib/query-client";
import { useEventStore } from "@calendar/stores/event.store";

// TODO: get from config
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
    recurrent: false,
    status: undefined,
  });
  const [openRemoveHardDialog, setOpenRemoveHardDialog] = useState<boolean>(false);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: EventsTableConfig.limit });
  const [sorting, setSorting] = useState<SortingState>([]);
  const {
    refreshKey,
    selectedEvent,
    setOpenCreateEventSheet,
    setOpenEditEventSheet,
    setOpenViewEventSheet,
    setSelectedEvent,
  } = useEventStore();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["events", "list", filters, pagination, sorting, refreshKey],
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

  const handleSetFilters = useCallback<Dispatch<SetStateAction<IEventFilters>>>((action) => {
    setFilters(action);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

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
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {row.original.recurrentId && (
            <Badge size="icon" variant="recurrent">
              R
            </Badge>
          )}
          {row.original.title}
        </div>
      ),
    },
    {
      // NOTE: if accessorKey is replaced with id, then must use accessorFn
      id: "professional",
      header: ({ column }) => <SortableHeader column={column}>Profesional</SortableHeader>,
      accessorFn: (row) =>
        `${row.professional.professionalProfile?.professionalPrefix} ${row.professional.firstName} ${row.professional.lastName}`,
      cell: ({ row }) =>
        `${row.original.professional.professionalProfile?.professionalPrefix} ${row.original.professional.firstName} ${row.original.professional.lastName}`,
    },
    {
      id: "patient",
      header: ({ column }) => <SortableHeader column={column}>Paciente</SortableHeader>,
      accessorFn: (row) => `${row.user.firstName} ${row.user.lastName}`,
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
            <Protected requiredPermission="events-update">
              <TooltipTrigger asChild>
                <Button
                  className="hover:text-edit"
                  size="icon-sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedEvent(row.original);
                    setOpenEditEventSheet(true, false);
                  }}
                >
                  <FilePenLine />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Editar</TooltipContent>
            </Protected>
          </Tooltip>
          <Protected requiredPermission="events-delete-hard">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="hover:text-delete"
                  size="icon-sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedEvent(row.original);
                    setOpenRemoveHardDialog(true);
                  }}
                >
                  <Trash2 />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Eliminar</TooltipContent>
            </Tooltip>
          </Protected>
        </div>
      ),
    },
  ];

  const headers = {
    startDate: "Fecha",
    status: "Estado",
    title: "Título",
    professional: "Profesional",
    patient: "Paciente",
  };

  const formatters = {
    startDate: (row: ICalendarEvent) => formatShortDateTime(row.startDate, localeMap[LOCALE]),
    status: (row: ICalendarEvent) => row.status.replace("_", " "),
    title: (row: ICalendarEvent) => `${row.recurrentId ? "[R] " : ""}${row.title}`,
    professional: (row: ICalendarEvent) =>
      `${row.professional.professionalProfile?.professionalPrefix} ${row.professional.firstName} ${row.professional.lastName}`,
    patient: (row: ICalendarEvent) => `${row.user.firstName} ${row.user.lastName}`,
  };

  const { mutate: removeHardEvent, isPending: isRemoving } = useMutation({
    mutationFn: (id: string) => EventsService.removeHard(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success(response.message);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message ?? "Error desconocido";
        toast.error(message);
      }
    },
    onSettled: () => {
      setOpenRemoveHardDialog(false);
      setSelectedEvent(null);
    },
  });

  return (
    <>
      <div className="flex flex-col gap-8">
        <PageHeader title="Turnos" subtitle="Módulo de visualización y administración de turnos">
          <Protected requiredPermission="events-create">
            <Button size="lg" variant="default" onClick={() => setOpenCreateEventSheet(true)}>
              <Plus />
              Crear turno
            </Button>
          </Protected>
        </PageHeader>
        <Filters filters={filters} setFilters={handleSetFilters} onSearch={handleSearch} />
        <DataTablePaginated
          columns={columns}
          data={data?.data?.result}
          defaultPageSize={EventsTableConfig.limit}
          loading={isLoading}
          onPaginationChange={setPagination}
          onSortingChange={setSorting}
          pageSizes={EventsTableConfig.pageSizes}
          pagination={pagination}
          pdfFormatters={formatters}
          pdfHeaders={headers}
          rowCount={data?.data?.total}
          searchable={true}
        />
      </div>
      <ConfirmDialog
        title="Eliminar turno"
        description="¿Seguro que querés eliminar este turno?"
        alertMessage="El turno será eliminado de la base de datos. Esta acción es irreversible."
        callback={() => selectedEvent && removeHardEvent(selectedEvent.id)}
        loader={isRemoving}
        open={openRemoveHardDialog}
        setOpen={setOpenRemoveHardDialog}
        showAlert
        variant="destructive"
      >
        {selectedEvent && (
          <ul className="flex flex-col gap-1">
            <li className="flex items-center gap-2">
              <span className="font-semibold">Profesional:</span>
              {`${selectedEvent.professional.professionalProfile?.professionalPrefix} ${selectedEvent.professional.firstName} ${selectedEvent.professional.lastName}`}
            </li>
            <li className="flex items-center gap-2">
              <span className="font-semibold">Paciente:</span>
              {`${selectedEvent.user.firstName} ${selectedEvent.user.lastName}`}
            </li>
            <li className="flex items-center gap-2">
              <span className="font-semibold">Título:</span>
              {selectedEvent.title}
            </li>
            <li className="flex items-center gap-2">
              <span className="font-semibold">Fecha:</span>
              {format(selectedEvent.startDate, "P", { locale: es })}
            </li>
            <li className="flex items-center gap-2">
              <span className="font-semibold">Horario:</span>
              {`${format(selectedEvent.startDate, "HH:mm", { locale: es })} - ${format(selectedEvent.endDate, "HH:mm", { locale: es })} hs.`}
            </li>
          </ul>
        )}
      </ConfirmDialog>
    </>
  );
}
