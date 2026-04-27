import autotable from "jspdf-autotable";
import jsPDF from "jspdf";
import type { Table } from "@tanstack/react-table";

type TProps<T> = {
  filename?: string;
  formatters?: Record<string, TFormatter<T>>;
  headers?: Record<string, string>;
  table: Table<T>;
  title?: string;
};

export type TFormatter<T> = (row: T) => string;

export function exportTableToPdf<T>({
  filename = "table.pdf",
  formatters = {},
  headers = {},
  table,
  title,
}: TProps<T>): void {
  const doc = new jsPDF();

  let y = 14;
  if (title) {
    doc.setFontSize(16);
    doc.text(title, 14, y);
    y += 8;
  }

  const columns = table.getAllLeafColumns().filter((col) => col.getIsVisible() && col.id !== "actions");
  const headerRow = columns.map((col) => headers[col.id] ?? col.id);
  const rows = table.getRowModel().rows;

  const body = rows.map((row) =>
    columns.map((col) => {
      const formatter = formatters[col.id];
      if (formatter) return formatter(row.original);

      const value = row.getValue(col.id);
      if (value === null || value === undefined) return "";
      if (typeof value === "object") return JSON.stringify(value);

      return String(value);
    }),
  );

  autotable(doc, {
    head: [headerRow],
    body,
    startY: y,
    styles: { fontSize: 8 },
    theme: "plain",
  });

  doc.save(filename);
}
