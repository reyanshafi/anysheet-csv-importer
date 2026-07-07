/**
 * GrowEasy CRM domain model — the target schema every uploaded CSV is mapped into,
 * plus the wire types shared with the frontend.
 */

export const CRM_STATUSES = [
  "GOOD_LEAD_FOLLOW_UP",
  "DID_NOT_CONNECT",
  "BAD_LEAD",
  "SALE_DONE",
] as const;
export type CrmStatus = (typeof CRM_STATUSES)[number];

export const DATA_SOURCES = [
  "leads_on_demand",
  "meridian_tower",
  "eden_park",
  "varah_swamy",
  "sarjapur_plots",
] as const;
export type DataSource = (typeof DATA_SOURCES)[number];

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

/** A fully mapped CRM record. Unknown values are empty strings, never null. */
export type CrmRecord = Record<CrmField, string>;

/** A CRM record traced back to its source row (0-based, excluding the header row). */
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

/**
 * True when every header is already a GrowEasy CRM field name — the file is a
 * CRM export, so AI mapping would be an identity operation. Extra/unknown
 * columns disqualify: they may hold information the AI should merge into notes.
 */
export function isCrmFormatHeaders(headers: readonly string[]): boolean {
  if (headers.length < 2) return false;
  const fields = new Set<string>(CRM_FIELDS);
  return headers.every((header) => fields.has(header.trim().toLowerCase()));
}

/** One entry of the column mapping plan: which CRM field a source column feeds. */
export interface ColumnMapping {
  source_column: string;
  /** A CRM field name, or "ignored" for columns with no CRM value. */
  crm_field: CrmField | "ignored";
  /** Short AI explanation, e.g. "split into country code + number". */
  note?: string;
}

export interface ImportResult {
  summary: ImportSummary;
  records: MappedRecord[];
  skipped: SkippedRecord[];
  /** Column mapping plan; empty when analysis was unavailable. */
  mappings: ColumnMapping[];
}

/** NDJSON events streamed by POST /api/import. */
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

/** A source CSV row paired with its position in the file. */
export interface IndexedRow {
  row_index: number;
  data: Record<string, string>;
}
