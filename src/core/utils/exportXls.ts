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
  filename = `table-${Date.now()}.xlsx`,
  formatters = {},
  headers = {},
  table,
  sheetName = "Sheet1",
}: TProps<T>): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  const allowedColumnIds = Object.keys(headers);

  const rows = table.getRowModel().rows;

  const data: string[][] = rows.map((row) =>
    allowedColumnIds.map((colId) => {
      const formatter = formatters[colId];
      if (formatter) return formatter(row.original);

      const value = row.getValue(colId);
      if (value == null) return "";
      if (typeof value === "object") return JSON.stringify(value);
      return String(value);
    }),
  );

  const colWidths = allowedColumnIds.map((colId, colIndex) => {
    const headerLength = (headers[colId] ?? colId).length;
    const maxCellLength = Math.max(headerLength, ...data.map((row) => row[colIndex]?.length || 0));
    return Math.min(Math.max(maxCellLength + 2, 10), 50);
  });

  worksheet.columns = allowedColumnIds.map((id, i) => ({
    key: id,
    header: headers[id] ?? id,
    width: colWidths[i],
  }));

  const headerRow = worksheet.getRow(1);
  headerRow.height = 24;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { vertical: "middle" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "f4f4f4" },
    };
  });

  data.forEach((rowArr) => {
    const row = worksheet.addRow(rowArr);
    row.height = 16;
    row.eachCell((cell) => {
      cell.alignment = { vertical: "middle" };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), filename);
}
