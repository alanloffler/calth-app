import * as XLSX from "xlsx";
import type { Table } from "@tanstack/react-table";

type TProps<T> = {
  filename?: string;
  formatters?: Record<string, TXlsFormatter<T>>;
  headers?: Record<string, string>;
  table: Table<T>;
  sheetName?: string;
};

export type TXlsFormatter<T> = (row: T) => string;

export function exportTableToXls<T>({
  filename = "table.xlsx",
  formatters = {},
  headers = {},
  table,
  sheetName = "Sheet1",
}: TProps<T>): void {
  const columns = table.getAllLeafColumns().filter((col) => col.getIsVisible() && col.id !== "actions");
  const headerRow = columns.map((col) => {
    if (headers[col.id]) return headers[col.id];
    if (typeof col.columnDef.header === "string") return col.columnDef.header;
    return col.id;
  });
  const rows = table.getRowModel().rows;

  const data = rows.map((row) => {
    const obj: Record<string, string> = {};

    columns.forEach((col, idx) => {
      const key = headerRow[idx];
      const formatter = formatters[col.id];
      if (formatter) {
        obj[key] = formatter(row.original);
        return;
      }

      const value = row.getValue(col.id);
      if (value == null) obj[key] = "";
      else if (typeof value === "object") obj[key] = JSON.stringify(value);
      else obj[key] = String(value);
    });

    return obj;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
}
