"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

interface NavItem {
  id: string;
  label: string;
  icon: (props: { className?: string }) => React.ReactElement;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { id: "overview", label: "Overview", icon: DocIcon },
      { id: "how-it-works", label: "How it works", icon: BoltIcon },
    ],
  },
  {
    label: "Reference",
    items: [
      { id: "crm-fields", label: "CRM fields", icon: GridIcon },
      { id: "allowed-values", label: "Allowed values", icon: CheckCircleIcon },
      { id: "api-reference", label: "API reference", icon: TerminalIcon },
    ],
  },
  {
    label: "Setup",
    items: [{ id: "configuration", label: "Configuration", icon: SlidersIcon }],
  },
  {
    label: "Help",
    items: [{ id: "tips", label: "Tips & FAQ", icon: HelpIcon }],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

/** Docs table of contents, grouped by category, that highlights whichever section is in view. */
export function DocsSidebar() {
  const [activeId, setActiveId] = useState(ALL_ITEMS[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-100px 0px -70% 0px", threshold: 0 },
    );

    const elements = ALL_ITEMS.map((item) => document.getElementById(item.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="hidden shrink-0 lg:sticky lg:top-20 lg:block lg:h-fit lg:w-56">
      {NAV_GROUPS.map((group, groupIndex) => (
        <div key={group.label} className={groupIndex > 0 ? "mt-6" : undefined}>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = activeId === item.id;
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={clsx(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-emerald-50 font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function DocIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <rect x="5" y="3" width="14" height="18" rx="1.5" strokeLinejoin="round" />
      <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
    </svg>
  );
}

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <path d="M12.75 3 5 13h5.5L9.5 21 19 10h-5.5L12.75 3Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <rect x="3.75" y="3.75" width="16.5" height="16.5" rx="2" />
      <path d="M3.75 12h16.5M12 3.75v16.5" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <circle cx="12" cy="12" r="8.25" />
      <path d="m8.5 12.3 2.4 2.4 4.6-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TerminalIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <path d="m7.5 9.5 3 2.5-3 2.5M13 14.5h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SlidersIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
      <circle cx="9" cy="7" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="7" cy="17" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function HelpIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M9.75 9.3a2.25 2.25 0 0 1 4.5 0c0 1.35-1.8 1.8-1.8 3.15" strokeLinecap="round" />
      <circle cx="12" cy="16.2" r="0.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
