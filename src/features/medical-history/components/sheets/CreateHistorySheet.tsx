import { CreateHistoryForm } from "@medical-history/components/forms/CreateHistoryForm";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@components/ui/sheet";

import type { Dispatch, SetStateAction } from "react";

import type { IUser } from "@users/interfaces/user.interface";

interface IProps {
  user: IUser;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function CreateHistorySheet({ user, open, setOpen }: IProps) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="h-full gap-0 sm:min-w-120">
        <SheetHeader className="border-b pt-8">
          <SheetTitle className="text-lg">Agregar historia médica</SheetTitle>
          <SheetDescription className="text-base">
            Creación de historia para el paciente {user?.firstName} {user?.lastName}
          </SheetDescription>
        </SheetHeader>
        <div className="flex h-full min-h-0 flex-col">
          <CreateHistoryForm user={user} setOpen={setOpen} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
