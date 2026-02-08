import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@components/ui/sheet";

import type { Dispatch, SetStateAction } from "react";

interface IProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function EditHistorySheet({ open, setOpen }: IProps) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild></SheetTrigger>
      <SheetContent className="sm:min-w-[480px]" onOpenAutoFocus={(e) => e.preventDefault()}>
        <SheetHeader className="pt-8">
          <SheetTitle className="text-lg">Historia médica</SheetTitle>
          <SheetDescription className="text-base">Edición de la historia médica seleccionada</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-6 p-4">Editable content here</div>
      </SheetContent>
    </Sheet>
  );
}
