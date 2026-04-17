import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@components/ui/dialog";

import type { Dispatch, ReactNode, SetStateAction } from "react";

interface IProps {
  children: ReactNode;
  description?: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  title: string;
}

export function EditDialog({ children, description, open, setOpen, title }: IProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="gap-6 sm:min-w-120">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className={description ? "" : "sr-only"}>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="flex flex-col gap-1">{children}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
