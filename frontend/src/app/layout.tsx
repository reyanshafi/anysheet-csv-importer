import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { ThemeToggle } from "@/components/ThemeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CRMWise - AI CSV Importer",
  description:
    "Upload any CSV — Facebook leads, ad exports, messy spreadsheets — and let AI map it into structured CRM records.",
};

// Applies the saved (or system) theme before first paint to avoid a flash.
const themeInitScript = `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark");}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="h-[18px] w-[18px]"
                  aria-hidden
                >
                  <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold tracking-tight">CRMWise</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">AI CSV Importer</p>
              </div>
            </Link>
            <div className="flex items-center gap-1">
              <Link
                href="/docs"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                Docs
              </Link>
              <a
                href="https://github.com/reyanshafi/groweasy-csv-importer"
                target="_blank"
                rel="noreferrer"
                aria-label="View source on GitHub"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]" aria-hidden>
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.53-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12v3.15c0 .3.21.66.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
                </svg>
              </a>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
        <footer className="border-t border-zinc-200 py-4 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          ©{" "}
          {new Date().getFullYear()}{" "}
          <a
            href="https://rayanshafi.dev"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-zinc-700 underline-offset-2 hover:text-emerald-600 hover:underline dark:text-zinc-300 dark:hover:text-emerald-400"
          >
            Rayan Shafi
          </a>
          . All rights reserved.
        </footer>
      </body>
    </html>
  );
}
