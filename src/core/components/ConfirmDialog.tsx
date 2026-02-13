import { CircleAlert } from "lucide-react";

import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Label } from "@components/ui/label";
import { Loader } from "@components/Loader";

import { useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";

interface IProps {
  alertMessage?: string;
  callback: () => void;
  children: ReactNode;
  description?: string;
  loader?: boolean;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  showAlert?: boolean;
  title: string;
  variant: "destructive" | "warning";
}
export function ConfirmDialog({
  alertMessage,
  callback,
  children,
  description,
  loader = false,
  open,
  setOpen,
  showAlert = false,
  title,
  variant,
}: IProps) {
  const [accepted, setAccepted] = useState<boolean | "indeterminate">(false);

  useEffect(() => {
    if (open === false) setAccepted(false);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="gap-6 sm:min-w-120">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="grid gap-4">
          <div className="flex flex-col gap-1">{children}</div>
          {showAlert && (
            <div className="flex flex-col gap-4">
              <div className="mx-auto flex w-fit items-center gap-2 rounded-md border border-amber-300/70 bg-amber-200/70 p-2 text-sm font-medium text-pretty text-amber-600 dark:border-amber-900/70 dark:bg-amber-950/70">
                <CircleAlert className="h-5 w-5 shrink-0" />
                {alertMessage ? alertMessage : "Esta acción es irreversible."}
              </div>
              <div className="flex justify-start gap-3">
                <Checkbox id="accept" className="size-5" checked={accepted} onCheckedChange={setAccepted} />
                <Label htmlFor="accept">Sí, comprendo que esta acción es irreversible</Label>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} variant="ghost">
            Cancelar
          </Button>
          <Button
            disabled={showAlert && !accepted}
            onClick={() => {
              callback();
              setOpen(false);
            }}
            variant={variant}
          >
            {loader ? (
              <Loader color="white" text={variant === "destructive" ? "Eliminando" : "Restaurando"} />
            ) : variant === "destructive" ? (
              "Eliminar"
            ) : (
              "Restaurar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
