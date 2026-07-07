"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import clsx from "clsx";

interface DataTableProps {
  headers: string[];
  rows: string[][];
  /** 1-based label shown in the leading # column for each row. */
  rowLabels?: (rowIndex: number) => string | number;
  /** Tailwind max-height class for the scroll container. */
  heightClass?: string;
}

const ROW_HEIGHT = 38;

/**
 * Virtualized data grid: renders only the visible window of rows, with a
 * sticky header and both scroll axes — smooth even for thousands of rows.
 */
export function DataTable({ headers, rows, rowLabels, heightClass = "max-h-[26rem]" }: DataTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? virtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end
      : 0;
  const columnCount = headers.length + 1;

  return (
    <div
      ref={scrollRef}
      className={clsx(
        "table-scroll overflow-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
        heightClass,
      )}
    >
      <table className="w-full min-w-max border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            <th className={clsx(headerCellClass, "w-14 text-right")}>#</th>
            {headers.map((header) => (
              <th key={header} className={headerCellClass}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paddingTop > 0 && (
            <tr aria-hidden>
              <td colSpan={columnCount} style={{ height: paddingTop, padding: 0, border: 0 }} />
            </tr>
          )}
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
              <tr
                key={virtualRow.index}
                className="group odd:bg-zinc-50/60 hover:bg-emerald-50/60 dark:odd:bg-zinc-800/30 dark:hover:bg-emerald-950/30"
              >
                <td
                  className={clsx(cellClass, "text-right font-mono text-xs text-zinc-400 dark:text-zinc-500")}
                  style={{ height: ROW_HEIGHT }}
                >
                  {rowLabels ? rowLabels(virtualRow.index) : virtualRow.index + 1}
                </td>
                {row.map((cell, columnIndex) => (
                  <td
                    key={columnIndex}
                    className={clsx(cellClass, cell === "" && "text-zinc-300 dark:text-zinc-600")}
                    style={{ height: ROW_HEIGHT }}
                    title={cell.length > 40 ? cell : undefined}
                  >
                    <span className="block max-w-[24rem] truncate">{cell === "" ? "—" : cell}</span>
                  </td>
                ))}
              </tr>
            );
          })}
          {paddingBottom > 0 && (
            <tr aria-hidden>
              <td colSpan={columnCount} style={{ height: paddingBottom, padding: 0, border: 0 }} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const headerCellClass =
  "sticky top-0 z-10 whitespace-nowrap border-b border-zinc-200 bg-zinc-100 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";

const cellClass =
  "whitespace-nowrap border-b border-zinc-100 px-3 py-0 align-middle dark:border-zinc-800/60";
