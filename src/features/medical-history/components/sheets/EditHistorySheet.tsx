import { EditHistoryForm } from "@medical-history/components/forms/EditHistoryForm";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@components/ui/sheet";

import type { Dispatch, SetStateAction } from "react";

import type { IMedicalHistory } from "@medical-history/interfaces/medical-history.interface";

interface IProps {
  history: IMedicalHistory;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function EditHistorySheet({ history, open, setOpen }: IProps) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild></SheetTrigger>
      <SheetContent className="h-full gap-0 sm:min-w-120" onOpenAutoFocus={(e) => e.preventDefault()}>
        <SheetHeader className="border-b pt-8">
          <SheetTitle className="text-lg">Historia médica</SheetTitle>
          <SheetDescription className="text-base">
            Edición de historia para el paciente {history.user.firstName} {history.user.lastName}
          </SheetDescription>
        </SheetHeader>
        <div className="flex h-full min-h-0 flex-col">
          <EditHistoryForm history={history} setOpen={setOpen} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
