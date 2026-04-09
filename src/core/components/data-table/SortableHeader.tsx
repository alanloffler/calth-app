import { ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";

import type { Column } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { cn } from "@core/lib/utils";

export function SortableHeader<TData, TValue>({
  alignment = "left",
  column,
  children,
  className,
}: {
  alignment?: "center" | "left" | "right";
  column: Column<TData, TValue>;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full",
        alignment === "center" && "justify-center",
        alignment === "left" && "justify-start",
        alignment === "right" && "justify-end",
      )}
    >
      <button
        className={cn("flex h-8 items-center gap-1", className)}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {children}
        {column.getIsSorted() === "asc" ? (
          <ChevronUp className="h-4 w-4 opacity-70" strokeWidth={1} />
        ) : column.getIsSorted() === "desc" ? (
          <ChevronDown className="h-4 w-4 opacity-70" strokeWidth={1} />
        ) : (
          <ChevronsUpDown className="h-4 w-4 opacity-70" strokeWidth={1} />
        )}
      </button>
    </div>
  );
}
