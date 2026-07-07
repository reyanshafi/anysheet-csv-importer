import Link from "next/link";
import { DocsSidebar } from "@/components/DocsSidebar";

const CRM_FIELDS: { field: string; description: string }[] = [
  { field: "created_at", description: "Lead creation date (ISO 8601, always parseable by new Date())" },
  { field: "name", description: "Lead's full name" },
  { field: "email", description: "Primary email address" },
  { field: "country_code", description: "Phone country code, e.g. +91" },
  { field: "mobile_without_country_code", description: "Mobile number, digits only" },
  { field: "company", description: "Company / organization name" },
  { field: "city", description: "City" },
  { field: "state", description: "State / region" },
  { field: "country", description: "Country" },
  { field: "lead_owner", description: "Salesperson or agent assigned to the lead" },
  { field: "crm_status", description: "Pipeline status — one of the allowed enum values below" },
  { field: "crm_note", description: "Remarks, extra phones/emails, anything that doesn't fit elsewhere" },
  { field: "data_source", description: "Campaign / project source — one of the allowed enum values below" },
  { field: "possession_time", description: "Property possession timeframe, if applicable" },
  { field: "description", description: "Any remaining descriptive info about the lead's requirement" },
];

const CRM_STATUSES = ["GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE"];
const DATA_SOURCES = ["leads_on_demand", "meridian_tower", "eden_park", "varah_swamy", "sarjapur_plots"];

const EVENT_TYPES: { type: string; description: string }[] = [
  { type: "start", description: "Emitted once: total rows, total batches, batch size" },
  { type: "plan", description: "The column-mapping plan (empty array in passthrough mode's identity mapping is still sent)" },
  { type: "batch", description: "Emitted once per completed batch: progress counts and whether it failed" },
  { type: "result", description: "Final event: full summary, imported records, skipped records, mapping plan" },
  { type: "error", description: "Emitted only if the import fails outright (e.g. no file, bad CSV)" },
];

export default function DocsPage() {
  return (
    <div className="pt-6 sm:pt-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <DocsSidebar />

        {/* content */}
        <div className="min-w-0 max-w-3xl flex-1 space-y-14">
          <header>
            
            <h1 className="text-3xl font-bold tracking-tight">Docs</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">
              Everything you need to use CRMWise or integrate directly with its API.
            </p>
        </header>

        <Section id="overview" title="Overview">
          <p>
            CRMWise takes any CSV — Facebook lead exports, Google Ads, other CRMs, hand-made
            spreadsheets — and maps it into a structured CRM record, regardless of column names,
            order, or formatting.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <Bullet>AI-powered column mapping, batched for large files</Bullet>
            <Bullet>Files already in CRM format skip the AI entirely (instant, zero cost)</Bullet>
            <Bullet>Every AI-mapped record is re-validated in code — never trusted blindly</Bullet>
            <Bullet>Live progress streamed back as the import runs</Bullet>
          </ul>
        </Section>

        <Section id="how-it-works" title="How it works">
          <ol className="space-y-4">
            <Step n={1} title="Upload">
              Drag & drop or browse for a .csv file (up to 10 MB by default).
            </Step>
            <Step n={2} title="Preview">
              The file is parsed locally in your browser and shown in a table — nothing is sent
              anywhere yet.
            </Step>
            <Step n={3} title="Confirm">
              Once you confirm, the file is uploaded to the backend, which streams back live
              progress as it processes.
            </Step>
            <Step n={4} title="Results">
              Imported and skipped records are shown separately, with reasons for every skip and a
              downloadable CSV of each.
            </Step>
          </ol>
          <p className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
            <strong>Passthrough mode:</strong> if every column header already matches a CRM field
            name exactly, the AI step is skipped entirely — rows are validated directly. This
            makes re-importing an already-exported CRMWise CSV effectively instant.
          </p>
        </Section>

        <Section id="crm-fields" title="CRM fields">
          <p className="mb-4">
            The AI maps as many of these fields as it confidently can from your CSV. Missing
            values are left blank, never invented.
          </p>
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full min-w-max text-left text-sm">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-800">
                  <th className="px-4 py-2.5 font-semibold">Field</th>
                  <th className="px-4 py-2.5 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody>
                {CRM_FIELDS.map(({ field, description }, i) => (
                  <tr
                    key={field}
                    className={i % 2 === 1 ? "bg-zinc-50 dark:bg-zinc-900/40" : undefined}
                  >
                    <td className="whitespace-nowrap px-4 py-2 font-mono text-xs text-emerald-700 dark:text-emerald-400">
                      {field}
                    </td>
                    <td className="px-4 py-2 text-zinc-600 dark:text-zinc-300">{description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="allowed-values" title="Allowed values">
          <p className="mb-3 text-sm">
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-800">
              crm_status
            </code>{" "}
            — mapped by meaning (e.g. &quot;ringing no answer&quot; → DID_NOT_CONNECT). Left blank
            if nothing matches confidently.
          </p>
          <PillList items={CRM_STATUSES} />
          <p className="mb-3 mt-6 text-sm">
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-800">
              data_source
            </code>{" "}
            — matched flexibly on meaning/spelling. Left blank rather than forced.
          </p>
          <PillList items={DATA_SOURCES} />
        </Section>

        <Section id="api-reference" title="API reference">
          <Endpoint method="GET" path="/api/health">
            <p>Liveness check — also reports the active model and whether AI is configured.</p>
            <CodeBlock>{`{ "status": "ok", "model": "gemini-3.1-flash-lite", "aiConfigured": true }`}</CodeBlock>
          </Endpoint>

          <Endpoint method="POST" path="/api/import">
            <p>
              Multipart upload, field name <code className="font-mono text-xs">file</code> (.csv).
              Responds with <code className="font-mono text-xs">application/x-ndjson</code> — one
              JSON event per line, streamed live as the import progresses.
            </p>
            <CodeBlock>{`curl -N -X POST -F "file=@leads.csv" https://your-api.example.com/api/import`}</CodeBlock>

            <p className="mt-4 mb-2 font-medium text-zinc-700 dark:text-zinc-200">Event types</p>
            <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full min-w-max text-left text-sm">
                <thead>
                  <tr className="bg-zinc-100 dark:bg-zinc-800">
                    <th className="px-4 py-2 font-semibold">type</th>
                    <th className="px-4 py-2 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {EVENT_TYPES.map(({ type, description }, i) => (
                    <tr key={type} className={i % 2 === 1 ? "bg-zinc-50 dark:bg-zinc-900/40" : undefined}>
                      <td className="whitespace-nowrap px-4 py-2 font-mono text-xs text-emerald-700 dark:text-emerald-400">
                        {type}
                      </td>
                      <td className="px-4 py-2 text-zinc-600 dark:text-zinc-300">{description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 mb-2 font-medium text-zinc-700 dark:text-zinc-200">Example stream</p>
            <CodeBlock>{`{"type":"start","totalRows":48,"totalBatches":1,"batchSize":100}
{"type":"plan","mappings":[{"source_column":"Full Name","crm_field":"name"}, ...]}
{"type":"batch","batchIndex":0,"totalBatches":1,"batchesCompleted":1,"rowsProcessed":48,"imported":44,"skipped":4,"failed":false}
{"type":"result","summary":{"totalRows":48,"imported":44,"skipped":4,"totalBatches":1,"failedBatches":0,"durationMs":4210,"model":"gemini-3.1-flash-lite","mode":"ai"},"records":[...],"skipped":[...],"mappings":[...]}`}</CodeBlock>
          </Endpoint>
        </Section>

        <Section id="configuration" title="Configuration">
          <p>
            All limits and AI behavior are controlled via backend environment variables —
            batch size, concurrency, retries, row/file limits, per-IP rate limiting, and the
            model itself. See{" "}
            <a
              href="https://github.com/reyanshafi/groweasy-csv-importer#env-vars"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-600 underline underline-offset-2 dark:text-emerald-400"
            >
              the README
            </a>{" "}
            for the full list and defaults.
          </p>
        </Section>

        <Section id="tips" title="Tips & FAQ">
          <FaqItem q="Why was my row skipped?">
            A row is skipped if it has neither a usable email nor mobile number — the one hard
            rule that can&apos;t be waived. Every skip reason is shown on the results screen and
            included in the downloadable skipped-rows CSV.
          </FaqItem>
          <FaqItem q="Why did my large file take a while?">
            Rows are sent to the AI in batches (100 rows by default) with a few running in
            parallel. If the AI provider rate-limits a request, the import automatically waits and
            retries rather than failing — large files may pause briefly rather than error out.
          </FaqItem>
          <FaqItem q="Can I re-import my own CRMWise export?">
            Yes — if the CSV&apos;s headers already match the CRM field names exactly, it&apos;s
            detected automatically and validated instantly without calling the AI at all.
          </FaqItem>
        </Section>

        <div className="border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <Link
            href="/import"
            className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
          >
            ← Back to the importer
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}

function Section(props: Readonly<{ id: string; title: string; children: React.ReactNode }>) {
  const { id, title, children } = props;
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold tracking-tight">
        <span className="h-5 w-1 rounded-full bg-emerald-500" aria-hidden />
        {title}
      </h2>
      <div className="text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-300">
        {children}
      </div>
    </section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
      <span>{children}</span>
    </li>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600/10 text-xs font-bold text-emerald-600 ring-1 ring-emerald-600/25 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/25">
        {n}
      </span>
      <div>
        <p className="font-medium text-zinc-800 dark:text-zinc-100">{title}</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{children}</p>
      </div>
    </li>
  );
}

function PillList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-mono text-xs text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function Endpoint({
  method,
  path,
  children,
}: {
  method: "GET" | "POST";
  path: string;
  children: React.ReactNode;
}) {
  const methodStyle =
    method === "GET"
      ? "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300";
  return (
    <div className="mb-8 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="mb-3 flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${methodStyle}`}>{method}</span>
        <code className="font-mono text-sm text-zinc-800 dark:text-zinc-100">{path}</code>
      </div>
      {children}
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="mt-2 overflow-x-auto rounded-lg bg-zinc-900 p-4 text-xs leading-relaxed text-zinc-100">
      <code className="font-mono">{children}</code>
    </pre>
  );
}

function FaqItem({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group mb-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
      <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-zinc-800 [&::-webkit-details-marker]:hidden dark:text-zinc-100">
        {q}
      </summary>
      <p className="border-t border-zinc-100 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
        {children}
      </p>
    </details>
  );
}
