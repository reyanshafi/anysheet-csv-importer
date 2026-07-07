"use client";

import { DataTable } from "./DataTable";
import { formatFileSize, type ParsedCsvFile } from "@/lib/csv";
import { isCrmFormatHeaders } from "@/lib/types";

interface PreviewStepProps {
  parsed: ParsedCsvFile;
  error: string | null;
  onConfirm: () => void;
  onBack: () => void;
}

export function PreviewStep({ parsed, error, onConfirm, onBack }: PreviewStepProps) {
  const { file, headers, rows } = parsed;

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Preview your data</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Check that the file parsed correctly — nothing has been sent to the AI yet.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge label={file.name} title="File name" />
          <Badge label={formatFileSize(file.size)} title="File size" />
          <Badge label={`${rows.length.toLocaleString()} rows`} title="Data rows" />
          <Badge label={`${headers.length} columns`} title="Columns" />
        </div>
      </div>

      {isCrmFormatHeaders(headers) && (
        <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 h-4 w-4 shrink-0">
            <path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12L13 2Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>
            This file already matches the GrowEasy CRM format — confirming will validate it
            instantly, no AI processing needed.
          </span>
        </div>
      )}

      <DataTable headers={headers} rows={rows} heightClass="max-h-[55vh]" />

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          {error}
        </div>
      )}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Choose a different file
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          Confirm import · {rows.length.toLocaleString()} rows
        </button>
      </div>
    </section>
  );
}

function Badge({ label, title }: { label: string; title: string }) {
  return (
    <span
      title={title}
      className="max-w-[14rem] truncate rounded-full border border-zinc-200 bg-white px-3 py-1 font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
    >
      {label}
    </span>
  );
}
