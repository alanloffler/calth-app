import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@lib/utils";

const badgeVariants = cva("inline-flex items-center justify-center font-medium uppercase", {
  variants: {
    size: {
      normal: "px-3 py-1.5 text-xs rounded-sm",
      small: "px-2 py-1 text-[10px] rounded-sm",
      large: "px-4 py-2 text-base rounded-md",
      icon: "px-1 text-xs rounded-xs size-4",
    },
    variant: {
      cyan: "bg-cyan-100 text-cyan-600",
      ic: "dark:bg-neutral-700 dark:text-neutral-200 bg-neutral-200 text-neutral-700 text-xs lowercase font-normal",
      id: "dark:bg-neutral-600 dark:text-neutral-100 bg-neutral-100 text-neutral-600 text-xs lowercase font-normal",
      gray: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800/80 dark:text-neutral-400",
      green: "bg-green-100 text-green-600 ",
      red: "bg-red-100 text-red-600",
      role: "dark:bg-indigo-600/30 dark:text-indigo-300 bg-indigo-100 text-indigo-600",
      recurrent: "bg-fuchsia-600 text-fuchsia-50",
    },
  },
  defaultVariants: {
    size: "normal",
    variant: "gray",
  },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
}

export function Badge({ children, size, variant, className, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ size, variant }), className)} {...props}>
      {children}
    </span>
  );
}
