import { Database, Search, X } from "lucide-react";
import { FilePdf } from "@components/icons/FilePdf";
import { FileXls } from "@components/icons/FileXls";

import { Button } from "@components/ui/button";
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

import { cn } from "@core/lib/utils";
import { exportTableToPdf, type TPdfFormatter } from "@core/utils/exportPdf";
import { exportTableToXls, type TXlsFormatter } from "@core/utils/exportXls";

const EMPTY_ARRAY: never[] = [];

interface DataTableProps<TData, TValue> {
  className?: string;
  columnVisibility?: any;
  columns: ColumnDef<TData, TValue>[];
  controls?: { search?: boolean; exportExcel?: boolean; exportPdf?: boolean };
  data: TData[] | undefined;
  defaultPageSize?: number;
  defaultSorting?: SortingState;
  exportPdfConfig?: {
    filename?: string;
    formatters?: Record<string, TPdfFormatter<TData>>;
    headers?: Record<string, string>;
    title?: string;
  };
  exportXlsConfig?: {
    filename?: string;
    formatters?: Record<string, TXlsFormatter<TData>>;
    headers?: Record<string, string>;
    sheetName?: string;
  };
  loading?: boolean;
  pageSizes?: number[];
  rowCount?: number;
}

export function DataTable<TData, TValue>({
  className,
  columnVisibility,
  columns,
  controls,
  data,
  defaultPageSize = 5,
  defaultSorting = [],
  exportPdfConfig,
  exportXlsConfig,
  loading,
  pageSizes = [5, 10, 20, 50],
  rowCount,
}: DataTableProps<TData, TValue>) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>(defaultSorting);

  const tableData = useMemo(() => (loading ? Array(5).fill({}) : (data ?? EMPTY_ARRAY)), [loading, data]);
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
    data: tableData,
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
      {controls && Object.values(controls).some(Boolean) && (
        <div className="flex w-full items-center justify-end gap-3 p-3 pb-0">
          {controls.exportPdf && (
            <Button
              className="text-muted-foreground hover:bg-muted"
              size="icon"
              variant="outline"
              onClick={() =>
                exportTableToPdf({
                  filename: exportPdfConfig?.filename,
                  formatters: exportPdfConfig?.formatters,
                  headers: exportPdfConfig?.headers,
                  table,
                  title: exportPdfConfig?.title,
                })
              }
            >
              <FilePdf className="size-5" />
            </Button>
          )}
          {controls.exportExcel && (
            <Button
              className="text-muted-foreground hover:bg-muted"
              size="icon"
              variant="outline"
              onClick={() =>
                exportTableToXls({
                  filename: exportXlsConfig?.filename,
                  formatters: exportXlsConfig?.formatters,
                  headers: exportXlsConfig?.headers,
                  sheetName: exportXlsConfig?.sheetName,
                  table,
                })
              }
            >
              <FileXls className="size-5" />
            </Button>
          )}
          {controls.search && (
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
          )}
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
          <div className={cn("flex items-center", rowCount && rowCount > 0 ? "justify-between" : "justify-end")}>
            {rowCount && rowCount > 0 && (
              <div className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
                <Database className="size-4 text-sky-500 dark:text-sky-800" />
                {`${rowCount} filas`}
              </div>
            )}
            <Pagination table={table} pageSizes={pageSizes} />
          </div>
        )}
      </div>
    </div>
  );
}
