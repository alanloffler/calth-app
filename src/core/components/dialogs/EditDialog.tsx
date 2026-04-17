import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Loader } from "@components/Loader";

import type { Dispatch, ReactNode, SetStateAction } from "react";

interface IProps {
  callback: () => void;
  children: ReactNode;
  description?: string;
  loader?: boolean;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  title: string;
}

export function EditDialog({ callback, children, description, loader, open, setOpen, title }: IProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="gap-6 sm:min-w-120">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="grid gap-4">
          <div className="flex flex-col gap-1">{children}</div>
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} variant="ghost">
            Cancelar
          </Button>
          <Button disabled={loader} onClick={() => callback()} variant="warning">
            {loader ? <Loader color="white" text="Guardando" /> : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
