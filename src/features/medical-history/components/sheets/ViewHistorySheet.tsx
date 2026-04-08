import { Badge } from "@components/Badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@components/ui/sheet";

import type { Dispatch, SetStateAction } from "react";
import { es } from "date-fns/locale";
import { format } from "date-fns";

import type { IMedicalHistory } from "@medical-history/interfaces/medical-history.interface";
import { formatIc } from "@core/formatters/ic.formatter";

interface IProps {
  eventClick: Dispatch<SetStateAction<boolean>>;
  history: IMedicalHistory;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function ViewHistorySheet({ eventClick, history, open, setOpen }: IProps) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild></SheetTrigger>
      <SheetContent className="sm:min-w-120" onOpenAutoFocus={(e) => e.preventDefault()}>
        <SheetHeader className="pt-8">
          <SheetTitle className="text-lg">Historia médica</SheetTitle>
          <SheetDescription className="text-base">Detalles de la historia médica seleccionada</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-6 p-4">
          <ul className="flex flex-col gap-3">
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
            <li className="flex flex-col gap-3">
              <span className="font-semibold">Notas:</span>
              <div dangerouslySetInnerHTML={{ __html: history.comments }}></div>
            </li>
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}
