import { Check, X } from "lucide-react";

import { cn } from "@core/lib/utils";

interface IProps {
  state: boolean;
}

export function CheckedIcon({ state }: IProps) {
  return (
    <div
      className={cn(
        "flex w-fit place-self-center rounded-full border bg-gray-200 p-0.5",
        state === true
          ? "border-green-200 bg-green-100 text-green-500 dark:border-green-900/70 dark:bg-green-950"
          : "border-red-200 bg-red-100 text-red-500 dark:border-red-900/70 dark:bg-red-950",
      )}
    >
      {state === true ? <Check className="size-3.5" /> : <X className="size-3.5" />}
    </div>
  );
}
