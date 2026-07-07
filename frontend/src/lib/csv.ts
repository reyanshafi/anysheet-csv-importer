import Papa from "papaparse";
import { CRM_FIELDS, type MappedRecord, type SkippedRecord } from "./types";

export interface ParsedCsvFile {
  file: File;
  headers: string[];
  rows: string[][];
}

/**
 * Parse a CSV in the browser for the preview step (no AI involved).
 * Parsed without header-keying so blank/duplicate header cells can't drop
 * columns — mirrors the backend's normalization.
 */
export function parseCsvFile(file: File): Promise<ParsedCsvFile> {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(file, {
      skipEmptyLines: "greedy",
      complete: ({ data }) => {
        if (data.length === 0) {
          return reject(new Error("This CSV file is empty."));
        }
        if (data.length === 1) {
          return reject(new Error("This CSV only contains a header row — there is no data to import."));
        }
        const headers = normalizeHeaders(data[0]);
        const rows = data
          .slice(1)
          .map((cells) => headers.map((_, i) => cells[i] ?? ""))
          .filter((cells) => cells.some((cell) => cell.trim() !== ""));
        if (rows.length === 0) {
          return reject(new Error("This CSV has no non-empty data rows."));
        }
        resolve({ file, headers, rows });
      },
      error: (error) => reject(new Error(`Could not parse CSV: ${error.message}`)),
    });
  });
}

function normalizeHeaders(headerRow: string[]): string[] {
  const seen = new Map<string, number>();
  return headerRow.map((raw, i) => {
    const base = (raw ?? "").trim() || `column_${i + 1}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}_${count + 1}`;
  });
}

/** Download the imported records as a GrowEasy-format CSV. */
export function downloadRecordsCsv(records: MappedRecord[], sourceFileName: string): void {
  const csv = Papa.unparse({
    fields: [...CRM_FIELDS],
    data: records.map((record) => CRM_FIELDS.map((field) => record[field])),
  });
  triggerCsvDownload(csv, `groweasy-crm-${baseName(sourceFileName)}.csv`);
}

/**
 * Download skipped rows with their original columns plus the skip reason —
 * fix the issues and the file can be re-uploaded as-is.
 */
export function downloadSkippedCsv(
  skipped: SkippedRecord[],
  sourceHeaders: string[],
  sourceFileName: string,
): void {
  const csv = Papa.unparse({
    fields: [...sourceHeaders, "skip_reason"],
    data: skipped.map((entry) => [
      ...sourceHeaders.map((header) => entry.raw[header] ?? ""),
      entry.reason,
    ]),
  });
  triggerCsvDownload(csv, `skipped-rows-${baseName(sourceFileName)}.csv`);
}

const baseName = (fileName: string) => fileName.replace(/\.csv$/i, "");

function triggerCsvDownload(csv: string, fileName: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
