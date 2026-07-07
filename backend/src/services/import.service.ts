import { config } from "../config.js";
import {
  isCrmFormatHeaders,
  type ColumnMapping,
  type CrmField,
  type ImportEvent,
  type ImportResult,
  type IndexedRow,
  type MappedRecord,
  type SkippedRecord,
} from "../domain/crm.js";
import { finalizeRecord, normalizeMappings, type AiRecord } from "../domain/validation.js";
import { chunk, mapWithConcurrency } from "../utils/batch.js";

/** The Gemini SDK throws errors whose message is a raw JSON blob — surface only the human part. */
function describeAiFailure(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  try {
    const parsed = JSON.parse(message);
    if (typeof parsed?.error?.message === "string") return parsed.error.message;
  } catch {
    /* not JSON — use as-is */
  }
  return message.length > 160 ? `${message.slice(0, 160)}…` : message;
}
import { withRetry } from "../utils/retry.js";
import { AiExtractionService } from "./ai.service.js";

/**
 * Orchestrates a full import. Files already in CRM format bypass the AI and
 * are validated directly; everything else is batched out to Gemini with
 * bounded concurrency and retries, then re-validated. Progress events are
 * emitted as each batch settles.
 *
 * A batch that keeps failing never fails the import — its rows are reported
 * as skipped with the failure reason.
 */
export async function runImport(
  rows: Record<string, string>[],
  headers: string[],
  emit: (event: ImportEvent) => void,
): Promise<ImportResult> {
  if (isCrmFormatHeaders(headers)) return runPassthrough(rows, headers, emit);
  return runAiImport(rows, headers, emit);
}

/** Fast path: the file is already CRM-shaped — validate rows without any AI calls. */
function runPassthrough(
  rows: Record<string, string>[],
  headers: string[],
  emit: (event: ImportEvent) => void,
): ImportResult {
  const startedAt = Date.now();
  emit({ type: "start", totalRows: rows.length, totalBatches: 1, batchSize: rows.length });

  // Identity mapping: every column already is its CRM field.
  const mappings: ColumnMapping[] = headers.map((header) => ({
    source_column: header,
    crm_field: header.trim().toLowerCase() as CrmField,
  }));
  emit({ type: "plan", mappings });

  const records: MappedRecord[] = [];
  const skipped: SkippedRecord[] = [];

  rows.forEach((row, row_index) => {
    const identityMapped: AiRecord = { row_index };
    for (const [key, value] of Object.entries(row)) {
      identityMapped[key.trim().toLowerCase()] = value;
    }
    const result = finalizeRecord(identityMapped);
    if (result.ok) records.push(result.record);
    else skipped.push({ row_index, reason: result.reason, raw: row });
  });

  emit({
    type: "batch",
    batchIndex: 0,
    totalBatches: 1,
    batchesCompleted: 1,
    rowsProcessed: rows.length,
    imported: records.length,
    skipped: skipped.length,
    failed: false,
  });

  return {
    summary: {
      totalRows: rows.length,
      imported: records.length,
      skipped: skipped.length,
      totalBatches: 1,
      failedBatches: 0,
      durationMs: Date.now() - startedAt,
      model: "none",
      mode: "passthrough",
    },
    records,
    skipped,
    mappings,
  };
}

async function runAiImport(
  rows: Record<string, string>[],
  headers: string[],
  emit: (event: ImportEvent) => void,
): Promise<ImportResult> {
  const startedAt = Date.now();
  const ai = new AiExtractionService();

  const indexed: IndexedRow[] = rows.map((data, row_index) => ({ row_index, data }));
  const batches = chunk(indexed, config.batchSize);

  emit({
    type: "start",
    totalRows: rows.length,
    totalBatches: batches.length,
    batchSize: config.batchSize,
  });

  // Phase 1 — column analysis. The plan makes every batch interpret columns
  // identically and powers the mapping panel in the UI. Analysis failure is
  // never fatal: the import just proceeds without a plan.
  let mappings: ColumnMapping[] = [];
  let planText = "";
  try {
    const rawPlan = await withRetry(() => ai.analyzeColumns(headers, indexed), { attempts: 2 });
    mappings = normalizeMappings(rawPlan, headers);
    planText = mappings
      .filter((m) => m.crm_field !== "ignored")
      .map((m) => `${m.source_column} -> ${m.crm_field}${m.note ? ` (${m.note})` : ""}`)
      .join("\n");
    emit({ type: "plan", mappings });
  } catch (error) {
    console.warn(
      "[import] column analysis failed, continuing without a plan:",
      error instanceof Error ? error.message : error,
    );
  }

  const records: MappedRecord[] = [];
  const skipped: SkippedRecord[] = [];
  let batchesCompleted = 0;
  let rowsProcessed = 0;
  let failedBatches = 0;

  await mapWithConcurrency(batches, config.batchConcurrency, async (batch, batchIndex) => {
    let failed = false;
    let aiRecords: AiRecord[] = [];

    try {
      aiRecords = await withRetry(() => ai.mapBatch(batch, planText || undefined), {
        attempts: config.aiMaxRetries,
        onRetry: (attempt, error) =>
          console.warn(
            `[import] batch ${batchIndex + 1}/${batches.length} attempt ${attempt} failed:`,
            error instanceof Error ? error.message : error,
          ),
      });
    } catch (error) {
      failed = true;
      failedBatches++;
      const detail = describeAiFailure(error);
      for (const row of batch) {
        skipped.push({
          row_index: row.row_index,
          reason: `AI processing failed after ${config.aiMaxRetries} attempts: ${detail}`,
          raw: row.data,
        });
      }
    }

    if (!failed) {
      const byIndex = new Map(aiRecords.map((r) => [r.row_index, r]));
      for (const row of batch) {
        const aiRecord = byIndex.get(row.row_index);
        if (!aiRecord) {
          skipped.push({
            row_index: row.row_index,
            reason: "AI did not return a mapping for this row",
            raw: row.data,
          });
          continue;
        }
        const result = finalizeRecord(aiRecord);
        if (result.ok) {
          records.push(result.record);
        } else {
          skipped.push({ row_index: row.row_index, reason: result.reason, raw: row.data });
        }
      }
    }

    batchesCompleted++;
    rowsProcessed += batch.length;
    emit({
      type: "batch",
      batchIndex,
      totalBatches: batches.length,
      batchesCompleted,
      rowsProcessed,
      imported: records.length,
      skipped: skipped.length,
      failed,
    });
  });

  // Batches finish out of order under concurrency; present results in file order.
  records.sort((a, b) => a.row_index - b.row_index);
  skipped.sort((a, b) => a.row_index - b.row_index);

  return {
    summary: {
      totalRows: rows.length,
      imported: records.length,
      skipped: skipped.length,
      totalBatches: batches.length,
      failedBatches,
      durationMs: Date.now() - startedAt,
      model: config.geminiModel,
      mode: "ai",
    },
    records,
    skipped,
    mappings,
  };
}
