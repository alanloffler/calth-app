import { EditHistoryForm } from "@medical-history/components/forms/EditHistoryForm";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@components/ui/sheet";

import type { Dispatch, SetStateAction } from "react";

import type { IMedicalHistory } from "@medical-history/interfaces/medical-history.interface";

interface IProps {
  history: IMedicalHistory;
  onUpdated: () => void;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function EditHistorySheet({ history, onUpdated, open, setOpen }: IProps) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild></SheetTrigger>
      <SheetContent className="sm:min-w-[480px]" onOpenAutoFocus={(e) => e.preventDefault()}>
        <SheetHeader className="pt-8">
          <SheetTitle className="text-lg">Historia médica</SheetTitle>
          <SheetDescription className="text-base">
            Edición de historia para el paciente {history.user.firstName} {history.user.lastName}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-6 p-4">
          <EditHistoryForm history={history} onUpdated={onUpdated} setOpen={setOpen} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
