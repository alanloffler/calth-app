import { X } from "lucide-react";

import { cn } from "@core/lib/utils";

interface IProps {
  state: any | undefined;
  onClear: () => void;
  type?: "button" | "submit" | "reset" | undefined;
}

export function ClearIconButton({ state, onClear, type = "button" }: IProps) {
  return (
    <button
      className={cn(
        "bg-muted-foreground hover:bg-foreground flex size-4 shrink-0 items-center justify-center rounded-full opacity-0 transition-opacity",
        state && "pointer-events-auto opacity-100",
      )}
      onClick={onClear}
      type={type}
    >
      <X className="text-background size-3" />
    </button>
  );
}
