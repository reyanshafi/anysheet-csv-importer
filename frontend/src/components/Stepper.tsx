"use client";

import clsx from "clsx";

const STEPS = ["Upload", "Preview", "Import", "Results"] as const;
export type StepIndex = 0 | 1 | 2 | 3;

export function Stepper({ current }: { current: StepIndex }) {
  return (
    <ol className="mx-auto mb-8 flex w-full max-w-2xl items-center" aria-label="Import progress">
      {STEPS.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={label} className={clsx("flex items-center", index > 0 && "flex-1")}>
            {index > 0 && (
              <span
                aria-hidden
                className={clsx(
                  "mx-2 h-0.5 flex-1 rounded transition-colors sm:mx-3",
                  done || active ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-800",
                )}
              />
            )}
            <span className="flex items-center gap-2">
              <span
                className={clsx(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  done && "bg-emerald-600 text-white",
                  active && "bg-emerald-600 text-white ring-4 ring-emerald-600/20",
                  !done && !active && "bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
                )}
              >
                {done ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3.5 w-3.5">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={clsx(
                  "text-xs font-medium sm:text-sm",
                  active ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400",
                  // keep the row compact on small screens
                  !active && "hidden sm:inline",
                )}
              >
                {label}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
