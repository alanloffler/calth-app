import { Search, X } from "lucide-react";

import { Input } from "@components/ui/input";
import { Pagination } from "@components/Pagination";
import { Skeleton } from "@components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/ui/table";

import { Activity, useMemo, useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { cn } from "@lib/utils";

interface DataTableProps<TData, TValue> {
  className?: string;
  columnVisibility?: any;
  columns: ColumnDef<TData, TValue>[];
  data: TData[] | undefined;
  defaultPageSize?: number;
  defaultSorting?: SortingState;
  loading?: boolean;
  pageSizes?: number[];
  searchable?: boolean;
}

export function DataTable<TData, TValue>({
  className,
  columnVisibility,
  columns,
  data,
  defaultPageSize = 5,
  defaultSorting = [],
  loading,
  pageSizes = [5, 10, 20, 50],
  searchable = true,
}: DataTableProps<TData, TValue>) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>(defaultSorting);

  const tableData = useMemo(() => (loading ? Array(5).fill({}) : data), [loading, data]);
  const tableColumns = useMemo(
    () =>
      loading
        ? columns.map((column) => ({
            ...column,
            cell: () => <Skeleton className="h-9 w-full" />,
          }))
        : columns,
    [loading, columns],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: tableData || [],
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: "includesString",
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      columnVisibility: columnVisibility,
      globalFilter: globalFilter,
      pagination: pagination,
      sorting: sorting,
    },
  });

  function handleClearSearch(): void {
    table.setGlobalFilter("");
    setGlobalFilter("");
  }

  return (
    <div className={cn("overflow-hidden rounded-md border shadow-sm", className)}>
      {searchable && (
        <div className="flex w-full items-center justify-end p-3">
          <div className="relative">
            <Search className="stroke-primary absolute top-1/2 left-5 h-4 w-4 -translate-x-1/2 -translate-y-1/2" />
            <Input
              value={globalFilter}
              className="w-55 pl-9"
              onChange={(e) => table.setGlobalFilter(String(e.target.value))}
              placeholder="Buscar..."
            />
            <Activity mode={globalFilter ? "visible" : "hidden"}>
              <button className="text-muted-foreground hover:text-foreground absolute top-1/2 -right-1.5 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1 transition-colors duration-100">
                <X className="h-4 w-4" onClick={handleClearSearch} />
              </button>
            </Activity>
          </div>
        </div>
      )}
      <div className="p-3">
        <Table className="dark:bg-muted">
          <TableHeader className="dark:bg-primary-foreground bg-neutral-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      className="py-2.5"
                      key={header.id}
                      style={{
                        minWidth: header.column.columnDef.minSize,
                        width: header.column.getSize(),
                      }}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      style={{
                        minWidth: cell.column.columnDef.minSize,
                        width: cell.column.getSize(),
                      }}
                      key={cell.id}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Sin resultados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {!loading && (
          <Pagination table={table} setPagination={setPagination} pagination={pagination} pageSizes={pageSizes} />
        )}
      </div>
    </div>
  );
}
