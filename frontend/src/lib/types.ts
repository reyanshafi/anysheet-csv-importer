/**
 * Wire types shared with the backend API (kept in sync with
 * backend/src/domain/crm.ts).
 */

export const CRM_FIELDS = [
  "created_at",
  "name",
  "email",
  "country_code",
  "mobile_without_country_code",
  "company",
  "city",
  "state",
  "country",
  "lead_owner",
  "crm_status",
  "crm_note",
  "data_source",
  "possession_time",
  "description",
] as const;
export type CrmField = (typeof CRM_FIELDS)[number];

export type CrmRecord = Record<CrmField, string>;

export interface MappedRecord extends CrmRecord {
  row_index: number;
}

export interface SkippedRecord {
  row_index: number;
  reason: string;
  raw: Record<string, string>;
}

export interface ImportSummary {
  totalRows: number;
  imported: number;
  skipped: number;
  totalBatches: number;
  failedBatches: number;
  durationMs: number;
  model: string;
  /** "passthrough" = file was already in CRM format; validated without AI. */
  mode: "ai" | "passthrough";
}

/** Mirrors the backend detector: every header is already a CRM field name. */
export function isCrmFormatHeaders(headers: readonly string[]): boolean {
  if (headers.length < 2) return false;
  const fields = new Set<string>(CRM_FIELDS);
  return headers.every((header) => fields.has(header.trim().toLowerCase()));
}

/** One entry of the column mapping plan: which CRM field a source column feeds. */
export interface ColumnMapping {
  source_column: string;
  crm_field: CrmField | "ignored";
  note?: string;
}

export interface ImportResult {
  summary: ImportSummary;
  records: MappedRecord[];
  skipped: SkippedRecord[];
  /** Column mapping plan; empty when analysis was unavailable. */
  mappings: ColumnMapping[];
}

export type ImportEvent =
  | { type: "start"; totalRows: number; totalBatches: number; batchSize: number }
  | { type: "plan"; mappings: ColumnMapping[] }
  | {
      type: "batch";
      batchIndex: number;
      totalBatches: number;
      batchesCompleted: number;
      rowsProcessed: number;
      imported: number;
      skipped: number;
      failed: boolean;
    }
  | ({ type: "result" } & ImportResult)
  | { type: "error"; message: string };

/** Live progress snapshot derived from streamed events. */
export interface ImportProgress {
  totalRows: number;
  totalBatches: number;
  batchesCompleted: number;
  rowsProcessed: number;
  imported: number;
  skipped: number;
}
