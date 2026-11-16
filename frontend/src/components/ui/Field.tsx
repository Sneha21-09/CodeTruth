import { forwardRef, useId, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-md border bg-white px-3 text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus-visible:ring-offset-0 disabled:bg-surface-muted";

type FieldWrap = { label: string; error?: string; hint?: string; className?: string };

function Wrap({ id, label, error, hint, children, className }: FieldWrap & { id: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-ink-800">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
      {error && <p id={`${id}-err`} role="alert" className="mt-1 text-xs font-medium text-bad-600">{error}</p>}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, FieldWrap & InputHTMLAttributes<HTMLInputElement>>(
  function Input({ label, error, hint, className, id, ...rest }, ref) {
    const auto = useId();
    const fid = id ?? auto;
    return (
      <Wrap id={fid} label={label} error={error} hint={hint} className={className}>
        <input ref={ref} id={fid} aria-invalid={!!error} aria-describedby={error ? `${fid}-err` : undefined}
          className={cn(control, "h-10", error ? "border-bad-600" : "border-line-strong")} {...rest} />
      </Wrap>
    );
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, FieldWrap & TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ label, error, hint, className, id, ...rest }, ref) {
    const auto = useId();
    const fid = id ?? auto;
    return (
      <Wrap id={fid} label={label} error={error} hint={hint} className={className}>
        <textarea ref={ref} id={fid} aria-invalid={!!error} aria-describedby={error ? `${fid}-err` : undefined}
          className={cn(control, "min-h-[96px] py-2", error ? "border-bad-600" : "border-line-strong")} {...rest} />
      </Wrap>
    );
  },
);

export const Select = forwardRef<HTMLSelectElement, FieldWrap & SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ label, error, hint, className, id, children, ...rest }, ref) {
    const auto = useId();
    const fid = id ?? auto;
    return (
      <Wrap id={fid} label={label} error={error} hint={hint} className={className}>
        <select ref={ref} id={fid} aria-invalid={!!error}
          className={cn(control, "h-10 pr-8", error ? "border-bad-600" : "border-line-strong")} {...rest}>
          {children}
        </select>
      </Wrap>
    );
  },
);

/** Compact inline select used in toolbars (label is visually hidden but present for screen readers). */
export function FilterSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <label className="inline-flex items-center">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-md border border-line-strong bg-white px-2.5 text-[13px] text-ink-800">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
