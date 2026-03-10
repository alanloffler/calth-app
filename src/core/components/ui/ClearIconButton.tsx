import { X } from "lucide-react";

import type { Dispatch, SetStateAction } from "react";
import { cn } from "@lib/utils";

interface IProps {
  state: any | undefined;
  setState: Dispatch<SetStateAction<any | undefined>>;
}
export function ClearIconButton({ state, setState }: IProps) {
  return (
    <button
      className={cn(
        "bg-muted-foreground hover:bg-foreground flex size-4 shrink-0 items-center justify-center rounded-full opacity-0 transition-opacity",
        state && "pointer-events-auto opacity-100",
      )}
      onClick={() => setState(undefined)}
    >
      <X className="text-background size-3" />
    </button>
  );
}
