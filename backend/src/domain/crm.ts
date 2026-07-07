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
}

export interface ImportResult {
  summary: ImportSummary;
  records: MappedRecord[];
  skipped: SkippedRecord[];
}

/** NDJSON events streamed by POST /api/import. */
export type ImportEvent =
  | { type: "start"; totalRows: number; totalBatches: number; batchSize: number }
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
