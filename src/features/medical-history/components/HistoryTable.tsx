import { X, Check, FilePenLine, FileText, Trash2, RotateCcw, Ban } from "lucide-react";

import { Badge } from "@components/Badge";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { ConfirmDialog } from "@components/ConfirmDialog";
import { DataTable } from "@components/data-table/DataTable";
import { EditHistorySheet } from "@medical-history/components/sheets/EditHistorySheet";
import { EventDetailsDialog } from "@calendar/components/EventDetailsDialog";
import { Protected } from "@auth/components/Protected";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";

import type { ColumnDef } from "@tanstack/react-table";
import { es } from "date-fns/locale";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";

import type { IMedicalHistory } from "@medical-history/interfaces/medical-history.interface";
import type { TPermission } from "@permissions/interfaces/permission.type";
import { HistoryTableConfig } from "@core/config/table.config";
import { MedicalHistoryService } from "@medical-history/services/medical-history.service";
import { cn } from "@lib/utils";
import { formatIc } from "@core/formatters/ic.formatter";
import { useTryCatch } from "@core/hooks/useTryCatch";

interface IProps {
  history?: IMedicalHistory[];
  isLoading?: boolean;
  onUpdated: () => void;
}

export function HistoryTable({ history, isLoading, onUpdated }: IProps) {
  const [openEditSheet, setOpenEditSheet] = useState<boolean>(false);
  const [openEventDialog, setOpenEventDialog] = useState<boolean>(false);
  const [openRemoveDialog, setOpenRemoveDialog] = useState<boolean>(false);
  const [openRemoveHardDialog, setOpenRemoveHardDialog] = useState<boolean>(false);
  const [openRestoreDialog, setOpenRestoreDialog] = useState<boolean>(false);
  const [openSheet, setOpenSheet] = useState<boolean>(false);
  const [selectedHistory, setSelectedHistory] = useState<IMedicalHistory | undefined>(undefined);
  const { isLoading: isRemoving, tryCatch: tryCatchRemove } = useTryCatch();
  const { isLoading: isRemovingHard, tryCatch: tryCatchRemoveHard } = useTryCatch();
  const { isLoading: isRestoring, tryCatch: tryCatchRestore } = useTryCatch();

  if (!history) return null;

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

  async function softRemoveHistory(id: string): Promise<void> {
    const [response, error] = await tryCatchRemove(MedicalHistoryService.softRemove(id));

    if (error) {
      toast.error(error.message);
      return;
    }

    if (response && response.statusCode === 200) {
      toast.success(response.message);
      onUpdated();
    }
  }

  async function restoreHistory(id: string): Promise<void> {
    if (!id) return;

    const [response, error] = await tryCatchRestore(MedicalHistoryService.restore(id));

    if (error) {
      toast.error(error.message);
      return;
    }

    if (response && response.statusCode === 200) {
      toast.success(response.message);
      onUpdated();
    }
  }

  async function removeHardHistory(id: string): Promise<void> {
    if (!id) return;

    const [response, error] = await tryCatchRemoveHard(MedicalHistoryService.remove(id));

    if (error) {
      toast.error(error.message);
      return;
    }

    if (response && response.statusCode === 200) {
      toast.success(response.message);
      onUpdated();
    }
  }

  return history && history.length > 0 ? (
    <>
      {selectedHistory && (
        <Sheet open={openSheet} onOpenChange={setOpenSheet}>
          <SheetTrigger asChild></SheetTrigger>
          <SheetContent className="sm:min-w-120" onOpenAutoFocus={(e) => e.preventDefault()}>
            <SheetHeader className="pt-8">
              <SheetTitle className="text-lg">Historia médica</SheetTitle>
              <SheetDescription className="text-base">Detalles de la historia médica seleccionada</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-6 p-4">
              <ul className="flex flex-col gap-3">
                <li>
                  <h1 className="text-center text-xl font-semibold">{selectedHistory.reason}</h1>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold">Paciente:</span>
                  <span>{`${selectedHistory.user.firstName} ${selectedHistory.user.lastName}`}</span>
                  <Badge variant="ic">{formatIc(selectedHistory.user.ic)}</Badge>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold">Profesional:</span>
                  <span>{`${selectedHistory.professional.professionalProfile?.professionalPrefix} ${selectedHistory.professional.firstName} ${selectedHistory.professional.lastName}`}</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold">Fecha de atención:</span>
                  <span>{format(selectedHistory.date, "P", { locale: es })}</span>
                </li>
                {selectedHistory.eventId && (
                  <li className="flex gap-3">
                    <span className="font-semibold">Evento:</span>
                    <button onClick={() => setOpenEventDialog(true)}>
                      <Badge variant="id">{selectedHistory.eventId.split("-")[0]}</Badge>
                    </button>
                  </li>
                )}
                <li className="flex gap-3">
                  <span className="font-semibold">Título:</span>
                  <p>{selectedHistory.reason}</p>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold">Receta:</span>
                  {selectedHistory.recipe ? <p>Contiene receta (true)</p> : <p>No contiene receta (false)</p>}
                </li>
                <li className="flex flex-col gap-3">
                  <span className="font-semibold">Notas:</span>
                  <div dangerouslySetInnerHTML={{ __html: selectedHistory.comments }}></div>
                </li>
              </ul>
            </div>
          </SheetContent>
        </Sheet>
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
          onUpdated={onUpdated}
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
          <EventDetailsDialog eventId={selectedHistory.eventId} open={openEventDialog} setOpen={setOpenEventDialog} />
        </>
      )}
    </>
  ) : (
    <Card className="text-muted-foreground text-center">El paciente no posee historial médico</Card>
  );
}
