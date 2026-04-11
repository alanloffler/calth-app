import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";

import type { Dispatch, SetStateAction } from "react";

interface IProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function ShareModal({ open, setOpen }: IProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="gap-6 sm:min-w-120">
        <DialogHeader>
          <DialogTitle>Compartir código QR</DialogTitle>
          <DialogDescription className="sr-only"></DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">content here</div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} variant="default">
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
