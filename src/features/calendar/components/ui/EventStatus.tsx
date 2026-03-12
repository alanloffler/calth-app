import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { DEventStatus } from "@calendar/dictionaries/status.dictionary";
import { cn } from "@lib/utils";

const statusVariants = cva("inline-flex items-center justify-center font-medium uppercase", {
  variants: {
    size: {
      normal: "px-3 py-1.5 text-xs rounded-sm",
      small: "px-2 py-1 text-[10px] rounded-sm",
      large: "px-4 py-2 text-base rounded-md",
    },
    variant: {
      absent: "bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400",
      cancelled: "bg-red-100 text-red-600 dark:bg-red-950/80 dark:text-red-400",
      in_progress: "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-950/80 dark:text-fuchsia-400",
      pending: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800/80 dark:text-neutral-400",
      present: "bg-green-100 text-green-600 dark:bg-green-950/80 dark:text-green-400",
    },
  },
  defaultVariants: {
    size: "normal",
    variant: "pending",
  },
});

export interface IEventStatus extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof statusVariants> {}

export function EventStatus({ size, variant, className, ...props }: IEventStatus) {
  return (
    <div className={cn(statusVariants({ size, variant }), "min-w-0", className)} {...props}>
      <span className="truncate">{(variant && DEventStatus[variant]) || variant}</span>
    </div>
  );
}
