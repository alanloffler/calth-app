import { CircleX } from "lucide-react";

import { Button } from "@components/ui/button";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@lib/utils";

const ErrorVariants = cva("flex flex-col mx-auto w-fit items-center border font-medium md:flex-row", {
  variants: {
    size: {
      default: "rounded-lg p-3 gap-3 text-sm [&_svg]:size-5",
      lg: "rounded-xl p-4 gap-4 text-base [&_svg]:size-6",
    },
    variant: {
      destructive: "border-red-200 bg-red-100 text-red-500",
      warning: "border-amber-200 bg-amber-100 text-amber-500",
    },
  },
  defaultVariants: {
    size: "default",
    variant: "destructive",
  },
});

export interface ErrorProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof ErrorVariants> {
  className?: string;
  message: string;
  tryAgain?: boolean;
}

export function ErrorNotification({ className, message, tryAgain = true, size, variant, ...props }: ErrorProps) {
  return (
    <div className={cn(ErrorVariants({ size, variant }), className)} {...props}>
      <div className="flex items-center gap-3">
        <CircleX className="shrink-0" />
        <p>{message}</p>
      </div>
      {tryAgain && (
        <Button onClick={() => window.location.reload()} size={size} variant={variant ?? "destructive"}>
          Intentálo de nuevo
        </Button>
      )}
    </div>
  );
}
