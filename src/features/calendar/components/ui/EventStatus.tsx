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
      absent: "bg-amber-100 text-amber-600",
      attended: "bg-green-100 text-green-600",
      cancelled: "bg-red-100 text-red-600",
      in_progress: "bg-fuchsia-100 text-fuchsia-600",
      pending: "bg-neutral-100 text-neutral-600",
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
    <div className={cn(statusVariants({ size, variant }), className)} {...props}>
      {(variant && DEventStatus[variant]) || variant}
    </div>
  );
}
