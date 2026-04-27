import ExcelJS from "exceljs";
import type { Table } from "@tanstack/react-table";
import { saveAs } from "file-saver";

type TProps<T> = {
  filename?: string;
  formatters?: Record<string, TXlsFormatter<T>>;
  headers?: Record<string, string>;
  table: Table<T>;
  sheetName?: string;
};

export type TXlsFormatter<T> = (row: T) => string;

export async function exportTableToXls<T>({
  filename = "table.xlsx",
  formatters = {},
  headers = {},
  table,
  sheetName = "Sheet1",
}: TProps<T>): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  const columns = table.getAllLeafColumns().filter((col) => col.getIsVisible() && col.id !== "actions");
  const headerRow = columns.map((col) => {
    if (headers[col.id]) return headers[col.id];
    if (typeof col.columnDef.header === "string") return col.columnDef.header;
    return col.id;
  });

  const header = worksheet.addRow(headerRow);
  header.font = { bold: true };
  header.height = 24;
  header.alignment = { vertical: "middle" };
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "f4f4f4" } };

  const rows = table.getRowModel().rows;
  rows.forEach((row) => {
    const rowData = columns.map((col) => {
      const formatter = formatters[col.id];
      if (formatter) return formatter(row.original);

      const value = row.getValue(col.id);
      if (value == null) return "";
      if (typeof value === "object") return JSON.stringify(value);
      return String(value);
    });

    const newRow = worksheet.addRow(rowData);
    newRow.height = 16;
    newRow.alignment = { vertical: "middle" };
  });

  worksheet.columns.forEach((col) => {
    col.width = 20;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), filename);
}
