"use client";

import { useCallback, useRef, useState } from "react";
import { ProcessingCard } from "@/components/ProcessingCard";
import { PreviewStep } from "@/components/PreviewStep";
import { ResultsStep } from "@/components/ResultsStep";
import { Stepper, type StepIndex } from "@/components/Stepper";
import { UploadStep } from "@/components/UploadStep";
import { applyEventToProgress, importCsv } from "@/lib/api";
import { parseCsvFile, type ParsedCsvFile } from "@/lib/csv";
import type { ImportProgress, ImportResult } from "@/lib/types";

type Step = "upload" | "preview" | "processing" | "results";

const STEP_INDEX: Record<Step, StepIndex> = {
  upload: 0,
  preview: 1,
  processing: 2,
  results: 3,
};

export default function Home() {
  const [step, setStep] = useState<Step>("upload");
  const [parsed, setParsed] = useState<ParsedCsvFile | null>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setParsing(true);
    setError(null);
    try {
      setParsed(await parseCsvFile(file));
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not parse that file.");
    } finally {
      setParsing(false);
    }
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!parsed) return;
    setError(null);
    setProgress(null);
    setStep("processing");
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const importResult = await importCsv(
        parsed.file,
        (event) => setProgress((prev) => applyEventToProgress(prev, event)),
        controller.signal,
      );
      setResult(importResult);
      setStep("results");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setStep("preview"); // user cancelled — back to preview, no error banner
        return;
      }
      setError(err instanceof Error ? err.message : "Import failed unexpectedly.");
      setStep("preview");
    } finally {
      abortRef.current = null;
    }
  }, [parsed]);

  const handleCancel = useCallback(() => abortRef.current?.abort(), []);

  const handleRestart = useCallback(() => {
    abortRef.current?.abort();
    setStep("upload");
    setParsed(null);
    setError(null);
    setProgress(null);
    setResult(null);
  }, []);

  return (
    <div className="pt-10 sm:pt-16">
      <Stepper current={STEP_INDEX[step]} />

      {step === "upload" && <UploadStep onFile={handleFile} parsing={parsing} error={error} />}

      {step === "preview" && parsed && (
        <PreviewStep
          parsed={parsed}
          error={error}
          onConfirm={handleConfirm}
          onBack={handleRestart}
        />
      )}

      {step === "processing" && <ProcessingCard progress={progress} onCancel={handleCancel} />}

      {step === "results" && result && parsed && (
        <ResultsStep
          result={result}
          sourceHeaders={parsed.headers}
          sourceFileName={parsed.file.name}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
