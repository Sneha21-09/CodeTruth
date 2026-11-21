"use client";
import { cn } from "@/lib/utils";

export function Tabs<T extends string>({ tabs, value, onChange, label }: {
  tabs: { value: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void; label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button key={t.value} role="tab" type="button" aria-selected={active} onClick={() => onChange(t.value)}
            className={cn("-mb-px inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "border-brand-600 text-brand-700" : "border-transparent text-ink-500 hover:text-ink-800")}>
            {t.label}
            {t.count !== undefined && (
              <span className={cn("rounded-full px-1.5 text-xs", active ? "bg-brand-50 text-brand-700" : "bg-surface-sunken text-ink-500")}>{t.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
