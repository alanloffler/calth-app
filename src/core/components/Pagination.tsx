import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";

import type { PaginationState, Table } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

interface IProps {
  pageSizes: number[];
  pagination: PaginationState;
  table: Table<any>;
}

export function Pagination({ pageSizes, pagination, table }: IProps) {
  return (
    <section className={`dark:bg-muted flex items-center justify-end gap-2 p-5 md:gap-5`}>
      <Select value={`${table.getState().pagination.pageSize}`} onValueChange={(e) => table.setPageSize(parseInt(e))}>
        <SelectTrigger className="text-muted-foreground text-xs" size="default">
          <SelectValue placeholder={table.getState().pagination.pageSize} />
        </SelectTrigger>
        <SelectContent className="w-16.25 min-w-px" onCloseAutoFocus={(e) => e.preventDefault()}>
          <SelectGroup className="[&_svg]:h-4 [&_svg]:w-4">
            {pageSizes.map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`} className="justify-between text-xs">
                {pageSize}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <div className={cn("flex items-center space-x-2")}>
        {table.getPageCount() > 1 && (
          <>
            <Button
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.setPageIndex(0)}
              size="icon"
              variant="secondary"
            >
              <ArrowLeft size={16} />
            </Button>
            <Button
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              size="icon"
              variant="secondary"
            >
              <ChevronLeft size={16} />
            </Button>
          </>
        )}
        <span className="text-muted-foreground px-1 text-xs">
          {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
        </span>
        {table.getPageCount() > 1 && (
          <>
            <Button disabled={!table.getCanNextPage()} onClick={() => table.nextPage()} size="icon" variant="secondary">
              <ChevronRight size={16} />
            </Button>
            <Button
              disabled={!table.getCanNextPage()}
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              size="icon"
              variant="secondary"
            >
              <ArrowRight size={16} />
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
