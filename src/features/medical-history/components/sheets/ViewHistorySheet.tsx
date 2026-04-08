import { FilePenLine } from "lucide-react";

import { Badge } from "@components/Badge";
import { Button } from "@components/ui/button";
import { Protected } from "@auth/components/Protected";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";

import type { Dispatch, SetStateAction } from "react";
import { es } from "date-fns/locale";
import { format } from "date-fns";

import type { IMedicalHistory } from "@medical-history/interfaces/medical-history.interface";
import type { TPermission } from "@permissions/interfaces/permission.type";
import { formatIc } from "@core/formatters/ic.formatter";

interface IProps {
  eventClick: Dispatch<SetStateAction<boolean>>;
  history: IMedicalHistory;
  onEdit: () => void;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function ViewHistorySheet({ eventClick, history, onEdit, open, setOpen }: IProps) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild></SheetTrigger>
      <SheetContent className="flex flex-col sm:min-w-120" onOpenAutoFocus={(e) => e.preventDefault()}>
        <SheetHeader className="pt-8">
          <SheetTitle className="text-lg">Historia médica</SheetTitle>
          <SheetDescription className="text-base">Detalles de la historia médica seleccionada</SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-6 p-4">
          <ul className="flex min-h-0 flex-1 flex-col gap-3">
            <li>
              <h1 className="text-center text-xl font-semibold">{history.reason}</h1>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold">Paciente:</span>
              <span>{`${history.user.firstName} ${history.user.lastName}`}</span>
              <Badge variant="ic">{formatIc(history.user.ic)}</Badge>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold">Profesional:</span>
              <span>{`${history.professional.professionalProfile?.professionalPrefix} ${history.professional.firstName} ${history.professional.lastName}`}</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold">Fecha de atención:</span>
              <span>{format(history.date, "P", { locale: es })}</span>
            </li>
            {history.eventId && (
              <li className="flex gap-3">
                <span className="font-semibold">Evento:</span>
                <button onClick={() => eventClick(true)}>
                  <Badge variant="id">{history.eventId.split("-")[0]}</Badge>
                </button>
              </li>
            )}
            <li className="flex gap-3">
              <span className="font-semibold">Título:</span>
              <p>{history.reason}</p>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold">Receta:</span>
              {history.recipe ? <p>Contiene receta (true)</p> : <p>No contiene receta (false)</p>}
            </li>
            <li className="bg-muted mt-4 flex min-h-0 flex-1 flex-col gap-3 rounded-md border p-2">
              <span className="text-center font-semibold">Notas</span>
              <div
                className="bg-background min-h-0 flex-1 overflow-y-auto rounded-sm border p-2"
                dangerouslySetInnerHTML={{ __html: history.comments }}
              ></div>
            </li>
          </ul>
          <div>
            <Protected requiredPermission={"medical_history-update" as TPermission}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="hover:text-edit" onClick={onEdit} size="icon-sm" variant="ghost">
                    <FilePenLine />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Editar</TooltipContent>
              </Tooltip>
            </Protected>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
