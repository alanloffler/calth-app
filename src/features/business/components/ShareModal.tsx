import { Send } from "lucide-react";

import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Input } from "@components/ui/input";

import type { Dispatch, SetStateAction } from "react";

interface IProps {
  image: string | null;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function ShareModal({ image, open, setOpen }: IProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="gap-6 sm:min-w-120">
        <DialogHeader>
          <DialogTitle>Compartir código QR</DialogTitle>
          <DialogDescription className="sr-only"></DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-md border p-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              {image && <img src={image} alt="QR Code" className="size-10 object-contain" />}
              <span className="font-medium">E-mail</span>
            </div>
            <div className="flex items-center gap-3">
              <Input className="" placeholder="Ingresar email" />
              <Button variant="outline">
                <Send />
              </Button>
            </div>
          </div>
          {/* TODO: add tooltips */}
          <div className="flex flex-col gap-3 rounded-md border p-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              {image && <img src={image} alt="QR Code" className="size-10 object-contain" />}
              <span className="font-medium">WhatsApp</span>
            </div>
            <div className="flex items-center gap-3">
              <Input className="" placeholder="Ingresar número" />
              <Button variant="outline">
                <Send />
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} variant="secondary">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
