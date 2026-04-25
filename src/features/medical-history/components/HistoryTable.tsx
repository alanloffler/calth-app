import { X, Check, FilePenLine, FileText, Trash2, RotateCcw, Ban } from "lucide-react";

import { Badge } from "@components/Badge";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { ConfirmDialog } from "@components/dialogs/ConfirmDialog";
import { DataTable } from "@components/data-table/DataTable";
import { EditHistorySheet } from "@medical-history/components/sheets/EditHistorySheet";
import { Protected } from "@auth/components/Protected";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";
import { ViewEventDialog } from "@event/components/ViewEventDialog";
import { ViewHistorySheet } from "@medical-history/components/sheets/ViewHistorySheet";

import type { ColumnDef } from "@tanstack/react-table";
import { es } from "date-fns/locale";
import { format } from "date-fns";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import type { IMedicalHistory } from "@medical-history/interfaces/medical-history.interface";
import type { TPermission } from "@permissions/interfaces/permission.type";
import { CalendarService } from "@calendar/services/calendar.service";
import { HistoryTableConfig } from "@core/config/table.config";
import { MedicalHistoryService } from "@medical-history/services/medical-history.service";
import { cn } from "@core/lib/utils";
import { queryClient } from "@core/lib/query-client";
import { useEventStore } from "@calendar/stores/event.store";

interface IProps {
  history?: IMedicalHistory[];
  isLoading?: boolean;
}

export function HistoryTable({ history, isLoading }: IProps) {
  const [openEditSheet, setOpenEditSheet] = useState<boolean>(false);
  const [openEventDialog, setOpenEventDialog] = useState<boolean>(false);
  const [openRemoveDialog, setOpenRemoveDialog] = useState<boolean>(false);
  const [openRemoveHardDialog, setOpenRemoveHardDialog] = useState<boolean>(false);
  const [openRestoreDialog, setOpenRestoreDialog] = useState<boolean>(false);
  const [openSheet, setOpenSheet] = useState<boolean>(false);
  const [selectedHistory, setSelectedHistory] = useState<IMedicalHistory | undefined>(undefined);
  const { setSelectedEvent } = useEventStore();

  const { data: relatedEvent } = useQuery({
    queryKey: ["medical-history", "event"],
    queryFn: () => CalendarService.findOne(selectedHistory?.eventId as string),
    enabled: !!selectedHistory?.eventId,
    select: (response) => response && response.data,
  });

  useEffect(() => {
    if (relatedEvent) setSelectedEvent(relatedEvent);
  }, [relatedEvent, setSelectedEvent]);

  const columns: ColumnDef<IMedicalHistory>[] = [
    {
      accessorKey: "id",
      enableHiding: true,
      enableSorting: false,
      size: 80,
      header: () => <div className="text-center">ID</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge size="small" variant="id">
            {row.original?.id.slice(0, 5)}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "date",
      header: () => <div className="text-center">Fecha de atención</div>,
      cell: ({ row }) => <div className="text-center">{format(row.original?.date, "P", { locale: es })}</div>,
    },
    {
      accessorKey: "reason",
      header: () => <div>Título</div>,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <span>{row.original.reason}</span>
          {row.original.deletedAt && <Ban className="h-4 w-4 text-rose-500" />}
        </div>
      ),
    },
    {
      accessorKey: "professional",
      header: () => <div className="text-center">Profesional</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {`${row.original.professional.professionalProfile?.professionalPrefix} ${row.original.professional.firstName} ${row.original.professional.lastName}`}
        </div>
      ),
    },
    {
      accessorKey: "recipe",
      header: () => <div className="text-center">Receta</div>,
      cell: ({ row }) => (
        <div
          className={cn(
            "flex w-fit place-self-center rounded-full border bg-gray-200 p-0.5",
            row.original?.recipe
              ? "border-green-200 bg-green-100 text-green-500 dark:border-green-900/70 dark:bg-green-950"
              : "border-red-200 bg-red-100 text-red-500 dark:border-red-900/70 dark:bg-red-950",
          )}
        >
          {row.original?.recipe ? <Check className="size-3.5" /> : <X className="size-3.5" />}
        </div>
      ),
    },
    {
      id: "actions",
      minSize: 168,
      header: () => <div>Acciones</div>,
      cell: ({ row }) => (
        <div className="flex justify-start gap-1">
          {row.original.deletedAt ? (
            <Protected requiredPermission={"medical_history-restore" as TPermission}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {
                      setSelectedHistory({ ...row.original });
                      setOpenRestoreDialog(true);
                    }}
                    size="icon-sm"
                    variant="ghost"
                  >
                    <RotateCcw />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Restaurar</TooltipContent>
              </Tooltip>
            </Protected>
          ) : (
            <>
              <Protected requiredPermission={"medical_history-view" as TPermission}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="hover:text-view"
                      onClick={() => {
                        setOpenSheet(true);
                        setSelectedHistory({ ...row.original });
                      }}
                      size="icon-sm"
                      variant="ghost"
                    >
                      <FileText />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Ver detalles</TooltipContent>
                </Tooltip>
              </Protected>
              <Protected requiredPermission={"medical_history-update" as TPermission}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="hover:text-edit"
                      onClick={() => {
                        setSelectedHistory({ ...row.original });
                        setOpenEditSheet(true);
                      }}
                      size="icon-sm"
                      variant="ghost"
                    >
                      <FilePenLine />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Editar</TooltipContent>
                </Tooltip>
              </Protected>
              <Protected requiredPermission={"medical_history-delete" as TPermission}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="hover:text-delete"
                      onClick={() => {
                        setSelectedHistory({ ...row.original });
                        setOpenRemoveDialog(true);
                      }}
                      size="icon-sm"
                      variant="ghost"
                    >
                      <Trash2 />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Eliminar</TooltipContent>
                </Tooltip>
              </Protected>
              <Protected requiredPermission={"medical_history-delete-hard" as TPermission}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="hover:text-delete gap-0"
                      onClick={() => {
                        setSelectedHistory({ ...row.original });
                        setOpenRemoveHardDialog(true);
                      }}
                      size="icon-sm"
                      variant="ghost"
                    >
                      <Trash2 />
                      <span>!</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Eliminar permanente</TooltipContent>
                </Tooltip>
              </Protected>
            </>
          )}
        </div>
      ),
    },
  ];

  const { mutate: softRemoveHistory, isPending: isRemoving } = useMutation({
    mutationKey: ["medical-history", "soft-remove"],
    mutationFn: (id: string) => MedicalHistoryService.softRemove(id),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ["medical-history", selectedHistory?.userId] });
      setOpenSheet(false);
    },
    onSettled: () => {
      setOpenRemoveDialog(false);
    },
  });

  const { mutate: restoreHistory, isPending: isRestoring } = useMutation({
    mutationKey: ["medical-history", "restore"],
    mutationFn: (id: string) => MedicalHistoryService.restore(id),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ["medical-history", selectedHistory?.userId] });
    },
    onSettled: () => {
      setOpenRestoreDialog(false);
    },
  });

  const { mutate: removeHardHistory, isPending: isRemovingHard } = useMutation({
    mutationKey: ["medical-history", "hard-remove"],
    mutationFn: (id: string) => MedicalHistoryService.remove(id),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ["medical-history", selectedHistory?.userId] });
    },
    onSettled: () => {
      setOpenRemoveHardDialog(false);
    },
  });

  return history && history.length > 0 ? (
    <>
      {selectedHistory && (
        <>
          <ViewHistorySheet
            eventClick={setOpenEventDialog}
            history={selectedHistory}
            open={openSheet}
            setOpen={setOpenSheet}
            onEdit={() => setOpenEditSheet(true)}
            onDelete={() => setOpenRemoveDialog(true)}
          />
          {/* TODO: use a global sheet like event, or at least do not show overlay*/}
          <ViewEventDialog open={openEventDialog} setOpen={setOpenEventDialog} />
        </>
      )}
      <DataTable
        columns={columns}
        data={history}
        defaultPageSize={HistoryTableConfig.limit}
        loading={isLoading}
        pageSizes={HistoryTableConfig.pageSizes}
      />
      {selectedHistory && (
        <EditHistorySheet
          open={openEditSheet}
          setOpen={setOpenEditSheet}
          history={selectedHistory}
          onUpdated={() => {}}
        />
      )}
      {selectedHistory && (
        <>
          <ConfirmDialog
            title="Eliminar historia médica"
            description="¿Seguro que querés eliminar esta historia médica?"
            callback={() => softRemoveHistory(selectedHistory.id)}
            loader={isRemoving}
            open={openRemoveDialog}
            setOpen={setOpenRemoveDialog}
            variant="destructive"
          >
            <ul>
              <li className="flex items-center gap-2">
                <span className="font-semibold">Fecha:</span>
                {format(selectedHistory.date, "P", { locale: es })}
              </li>
              <li className="flex items-center gap-2">
                <span className="font-semibold">Pacient:</span>
                {`${selectedHistory.user.firstName} ${selectedHistory.user.lastName}`}
              </li>
              <li className="flex items-center gap-2">
                <span className="font-semibold">Título:</span>
                <span>{selectedHistory.reason}</span>
              </li>
            </ul>
          </ConfirmDialog>
          <ConfirmDialog
            title="Restaurar historia médica"
            description="¿Seguro que querés restaurar esta historia médica?"
            callback={() => restoreHistory(selectedHistory.id)}
            loader={isRestoring}
            open={openRestoreDialog}
            setOpen={setOpenRestoreDialog}
            variant="warning"
          >
            <ul>
              <li className="flex items-center gap-2">
                <span className="font-semibold">Fecha:</span>
                {format(selectedHistory.date, "P", { locale: es })}
              </li>
              <li className="flex items-center gap-2">
                <span className="font-semibold">Pacient:</span>
                {`${selectedHistory.user.firstName} ${selectedHistory.user.lastName}`}
              </li>
              <li className="flex items-center gap-2">
                <span className="font-semibold">Título:</span>
                <span>{selectedHistory.reason}</span>
              </li>
              <li className="pt-2">
                <span className="text-muted-foreground text-sm">
                  Historia médica eliminada el {format(selectedHistory.deletedAt, "P", { locale: es })}
                </span>
              </li>
            </ul>
          </ConfirmDialog>
          <ConfirmDialog
            title="Eliminar historia médica"
            description="¿Seguro que querés eliminar esta historia médica?"
            alertMessage="La historia médica será eliminada de la base de datos. Esta acción es irreversible."
            callback={() => removeHardHistory(selectedHistory.id)}
            loader={isRemovingHard}
            open={openRemoveHardDialog}
            setOpen={setOpenRemoveHardDialog}
            showAlert
            variant="destructive"
          >
            <ul>
              <li className="flex items-center gap-2">
                <span className="font-semibold">Fecha:</span>
                {format(selectedHistory.date, "P", { locale: es })}
              </li>
              <li className="flex items-center gap-2">
                <span className="font-semibold">Pacient:</span>
                {`${selectedHistory.user.firstName} ${selectedHistory.user.lastName}`}
              </li>
              <li className="flex items-center gap-2">
                <span className="font-semibold">Título:</span>
                <span>{selectedHistory.reason}</span>
              </li>
            </ul>
          </ConfirmDialog>
        </>
      )}
    </>
  ) : (
    <Card className="text-muted-foreground text-center">El paciente no posee historial médico</Card>
  );
}
