import { X, Check, FilePenLine, FileText, Trash2 } from "lucide-react";

import { Badge } from "@components/Badge";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { DataTable } from "@components/data-table/DataTable";
import { Protected } from "@auth/components/Protected";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@components/ui/sheet";

import type { ColumnDef } from "@tanstack/react-table";
import { es } from "date-fns/locale";
import { format } from "date-fns";
import { useState } from "react";

import type { IMedicalHistory } from "@medical-history/interfaces/medical-history.interface";
import type { TPermission } from "@permissions/interfaces/permission.type";
import { cn } from "@lib/utils";

interface IProps {
  history?: IMedicalHistory[];
  isLoading?: boolean;
}

export function HistoryTable({ history, isLoading }: IProps) {
  const [openSheet, setOpenSheet] = useState<boolean>(false);
  const [selectedHistory, setSelectedHistory] = useState<IMedicalHistory | undefined>(undefined);

  if (!history) return null;

  const columns: ColumnDef<any>[] = [
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
      accessorKey: "type",
      header: () => <div>Tipo</div>,
    },
    {
      accessorKey: "reason",
      header: () => <div>Motivo</div>,
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
          <Protected requiredPermission={"medical_history-view" as TPermission}>
            <Button
              onClick={() => {
                setOpenSheet(true);
                setSelectedHistory({ ...row.original, idx: row.index });
              }}
              size="icon-sm"
              variant="ghost"
            >
              <FileText />
            </Button>
          </Protected>
          <Protected requiredPermission={"medical_history-update" as TPermission}>
            <Button onClick={() => console.log(`Editar ${row.original.id}`)} size="icon-sm" variant="ghost">
              <FilePenLine />
            </Button>
          </Protected>
          <Protected requiredPermission={"medical_history-delete-hard" as TPermission}>
            <Button onClick={() => console.log(`Eliminar ${row.original.id}`)} size="icon-sm" variant="ghost">
              <Trash2 />
            </Button>
          </Protected>
        </div>
      ),
    },
  ];

  return history && history.length > 0 ? (
    <>
      {selectedHistory && (
        <Sheet open={openSheet} onOpenChange={setOpenSheet}>
          <SheetTrigger asChild></SheetTrigger>
          <SheetContent className="sm:min-w-[480px]" onOpenAutoFocus={(e) => e.preventDefault()}>
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
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold">Fecha de atención:</span>
                  <span>{format(selectedHistory.createdAt, "P", { locale: es })}</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold">Título:</span>
                  <p>{selectedHistory.reason}</p>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold">Receta:</span>
                  {selectedHistory.recipe ? <p>Contiene receta (true)</p> : <p>No contiene receta (false)</p>}
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold">Notas:</span>
                  <p>{selectedHistory.comments}</p>
                </li>
              </ul>
            </div>
          </SheetContent>
        </Sheet>
      )}
      <DataTable columns={columns} data={history} loading={isLoading} />
    </>
  ) : (
    <Card className="text-muted-foreground text-center">El paciente no posee historial médico</Card>
  );
}
