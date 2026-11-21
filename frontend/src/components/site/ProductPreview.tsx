import { AlertTriangle, CheckCircle2, FileCode2 } from "lucide-react";

/** Static illustration of a verification finding. Clearly labelled as an example. */
export function ProductPreview() {
  return (
    <figure className="relative">
      <div className="overflow-hidden rounded-xl border border-line-strong bg-white shadow-pop">
        <div className="flex items-center justify-between border-b border-line bg-surface-muted px-4 py-2.5">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong" /><span className="h-2.5 w-2.5 rounded-full bg-line-strong" /><span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          </div>
          <span className="text-xs font-medium text-ink-500">Spring launch announcement · Review</span>
          <span className="w-10" />
        </div>
        <div className="grid md:grid-cols-[1.05fr_1fr]">
          <div className="border-b border-line p-5 md:border-b-0 md:border-r">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Submitted copy</p>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-800">
              Northwind now{" "}
              <mark className="rounded bg-red-100 px-1 text-bad-700">supports 15 file formats</mark>, so every team can bring their work in without conversion. Start with{" "}
              <mark className="rounded bg-amber-100 px-1 text-warn-700">50 free credits</mark>.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-ink-600">
              <CheckCircle2 className="h-4 w-4 text-ok-600" aria-hidden="true" /> 2 claims matched to approved facts
            </div>
          </div>
          <div className="space-y-3 bg-surface-muted p-5">
            <div className="rounded-lg border border-red-200 bg-white p-3.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-bad-600" aria-hidden="true" />
                <span className="text-sm font-semibold text-ink-950">Factual mismatch</span>
                <span className="ml-auto rounded-full bg-bad-50 px-2 py-0.5 text-[11px] font-semibold text-bad-700">Critical</span>
              </div>
              <dl className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
                <div><dt className="text-ink-500">Claimed</dt><dd className="font-semibold text-ink-900">15 formats</dd></div>
                <div><dt className="text-ink-500">Product says</dt><dd className="font-semibold text-ink-900">12 formats</dd></div>
              </dl>
              <p className="mt-2.5 flex items-center gap-1.5 rounded bg-surface-sunken px-2 py-1.5 font-mono text-[11px] text-ink-700">
                <FileCode2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> config/formats.yaml:14
              </p>
              <div className="mt-2.5 text-[13px] leading-snug">
                <p className="rounded-t bg-red-50 px-2 py-1 text-bad-700 line-through decoration-1">supports 15 file formats</p>
                <p className="rounded-b bg-green-50 px-2 py-1 text-ok-700">supports 12 file formats</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs text-ink-500">Illustrative example using sample product data.</figcaption>
    </figure>
  );
}
