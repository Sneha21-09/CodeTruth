import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Tone = "neutral" | "brand" | "ok" | "warn" | "bad";
const tones: Record<Tone, string> = {
  neutral: "bg-surface-sunken text-ink-700 border-line",
  brand: "bg-brand-50 text-brand-700 border-brand-100",
  ok: "bg-ok-50 text-ok-700 border-green-200",
  warn: "bg-warn-50 text-warn-700 border-amber-200",
  bad: "bg-bad-50 text-bad-700 border-red-200",
};

export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}

export function SampleDataTag({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded border border-amber-200 bg-warn-50 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-warn-700", className)}>
      Sample data
    </span>
  );
}
