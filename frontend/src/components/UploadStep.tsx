"use client";

import { useDropzone } from "react-dropzone";
import clsx from "clsx";

interface UploadStepProps {
  onFile: (file: File) => void;
  parsing: boolean;
  error: string | null;
}

const MAX_SIZE_MB = 10;

export function UploadStep({ onFile, parsing, error }: UploadStepProps) {
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    accept: { "text/csv": [".csv"], "application/vnd.ms-excel": [".csv"] },
    maxSize: MAX_SIZE_MB * 1024 * 1024,
    multiple: false,
    disabled: parsing,
    onDropAccepted: (files) => onFile(files[0]),
  });

  const rejection = fileRejections[0]?.errors[0];
  const rejectionMessage =
    rejection?.code === "file-too-large"
      ? `That file is over the ${MAX_SIZE_MB} MB limit.`
      : rejection
        ? "Only .csv files are supported."
        : null;
  const message = error ?? rejectionMessage;

  return (
    <section className="mx-auto max-w-2xl">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Import leads from <span className="text-emerald-600 dark:text-emerald-400">any CSV</span>
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Facebook lead exports, Google Ads, CRM dumps, hand-made spreadsheets — AI maps the
          columns into GrowEasy CRM records for you.
        </p>
      </div>

      <div
        {...getRootProps()}
        className={clsx(
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors",
          isDragActive
            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
            : "border-zinc-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/40 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/20",
          parsing && "pointer-events-none opacity-60",
        )}
      >
        <input {...getInputProps()} />
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
          {parsing ? <Spinner /> : <UploadIcon />}
        </span>
        {parsing ? (
          <p className="text-sm font-medium">Parsing CSV…</p>
        ) : isDragActive ? (
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Drop it here
          </p>
        ) : (
          <>
            <p className="text-sm font-medium">
              Drag &amp; drop your CSV here, or{" "}
              <span className="text-emerald-600 underline underline-offset-2 dark:text-emerald-400">
                browse files
              </span>
            </p>
            <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">
              .csv up to {MAX_SIZE_MB} MB · any column layout
            </p>
          </>
        )}
      </div>

      {message && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          {message}
        </div>
      )}

      <div className="mt-12">
        <p className="mb-5 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
          How it works
        </p>
        <ol className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-0">
          <HowItWorksStep
            step={1}
            title="Preview first"
            description="Inspect your rows before anything is sent for processing."
          />
          <StepConnector />
          <HowItWorksStep
            step={2}
            title="AI mapping"
            description="Gemini matches your columns to CRM fields, batch by batch."
          />
          <StepConnector />
          <HowItWorksStep
            step={3}
            title="Clean output"
            description="Valid statuses, parseable dates, skipped rows explained."
          />
        </ol>
      </div>
    </section>
  );
}

function HowItWorksStep({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <li className="flex flex-1 items-start gap-3 sm:flex-col sm:items-center sm:gap-0 sm:text-center">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600/10 text-xs font-bold text-emerald-600 ring-1 ring-emerald-600/25 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/25">
        {step}
      </span>
      <span className="sm:mt-2.5">
        <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          {title}
        </span>
        <span className="mt-1 block max-w-[15rem] text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          {description}
        </span>
      </span>
    </li>
  );
}

function StepConnector() {
  return (
    <span
      aria-hidden
      className="mt-3.5 hidden h-px w-16 shrink-0 border-t border-dashed border-zinc-300 sm:block dark:border-zinc-700"
    />
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <path
        d="M12 16V4m0 0 4 4m-4-4L8 8M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 animate-spin">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
