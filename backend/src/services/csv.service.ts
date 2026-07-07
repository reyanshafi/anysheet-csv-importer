import { parse } from "csv-parse/sync";
import { ApiError } from "../middleware/error.js";

export interface ParsedCsv {
  headers: string[];
  rows: Record<string, string>[];
}

/**
 * Parse an arbitrary CSV buffer into header names + row objects.
 *
 * Parsed as raw string arrays (not keyed by csv-parse) so that blank or
 * duplicate header cells — common in hand-made spreadsheets — can't drop or
 * merge columns: blanks become `column_N` and duplicates get a numeric suffix.
 */
export function parseCsvBuffer(buffer: Buffer): ParsedCsv {
  let grid: string[][];
  try {
    grid = parse(buffer, {
      bom: true,
      skip_empty_lines: true,
      relax_column_count: true,
      relax_quotes: true,
      trim: true,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new ApiError(400, `Could not parse CSV file: ${detail}`);
  }

  if (grid.length === 0) throw new ApiError(400, "The CSV file is empty.");
  if (grid.length === 1) {
    throw new ApiError(400, "The CSV file only contains a header row — no data to import.");
  }

  const headers = normalizeHeaders(grid[0]);
  const rows: Record<string, string>[] = [];

  for (const cells of grid.slice(1)) {
    if (cells.every((cell) => cell === "")) continue;
    const row: Record<string, string> = {};
    headers.forEach((header, i) => {
      row[header] = cells[i] ?? "";
    });
    // relax_column_count allows rows wider than the header; keep the overflow.
    for (let i = headers.length; i < cells.length; i++) {
      if (cells[i] !== "") row[`column_${i + 1}`] = cells[i];
    }
    rows.push(row);
  }

  if (rows.length === 0) throw new ApiError(400, "The CSV file has no non-empty data rows.");
  return { headers, rows };
}

function normalizeHeaders(headerRow: string[]): string[] {
  const seen = new Map<string, number>();
  return headerRow.map((raw, i) => {
    const base = raw.trim() || `column_${i + 1}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}_${count + 1}`;
  });
}
