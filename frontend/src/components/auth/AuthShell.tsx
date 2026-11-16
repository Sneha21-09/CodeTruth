import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Info } from "lucide-react";

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      <main id="main" className="flex flex-col px-5 py-8 sm:px-10">
        <Logo />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="text-2xl font-semibold tracking-tight text-ink-950">{title}</h1>
          <p className="mt-1.5 text-sm text-ink-600">{subtitle}</p>
          <div className="mt-6">{children}</div>
          <p className="mt-6 text-sm text-ink-600">{footer}</p>
          <p className="mt-8 flex gap-2 rounded-md border border-line bg-surface-muted p-3 text-xs text-ink-600">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-500" aria-hidden="true" />
            Preview build: there is no server yet. Details stay in this browser, passwords are never stored and credentials are not verified.
          </p>
        </div>
        <Link href="/" className="text-xs text-ink-500 hover:underline">← Back to codetruth home</Link>
      </main>
      <aside className="hidden bg-ink-950 p-12 text-white lg:flex lg:flex-col lg:justify-center" aria-label="About CodeTruth">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-200">No source, no flag</p>
        <p className="mt-3 max-w-md text-3xl font-semibold leading-tight tracking-tight">Style checkers read words. CodeTruth reads the product.</p>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-400">Every factual finding points to an approved product fact, the source file and the line it came from.</p>
      </aside>
    </div>
  );
}
