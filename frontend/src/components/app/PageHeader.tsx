import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SampleDataTag } from "@/components/ui/Badge";

export function PageHeader({ title, description, crumbs, actions, sample }: {
  title: string; description?: string; crumbs: { label: string; href?: string }[]; actions?: ReactNode; sample?: boolean;
}) {
  return (
    <div className="mb-6">
      <Breadcrumbs items={[{ label: "Workspace", href: "/app" }, ...crumbs]} />
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-ink-950">{title}</h1>
            {sample && <SampleDataTag />}
          </div>
          {description && <p className="mt-1 max-w-2xl text-sm text-ink-600">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function StatTile({ label, value, hint, href, tone }: { label: string; value: ReactNode; hint?: string; href?: string; tone?: "bad" | "warn" | "ok" }) {
  const color = tone === "bad" ? "text-bad-600" : tone === "warn" ? "text-warn-600" : tone === "ok" ? "text-ok-600" : "text-ink-950";
  const body = (
    <>
      <p className="text-[13px] font-medium text-ink-500">{label}</p>
      <p className={`mt-1.5 text-3xl font-semibold tabular-nums tracking-tight ${color}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
    </>
  );
  const cls = "block rounded-lg border border-line bg-white p-4 shadow-card";
  return href ? <a href={href} className={`${cls} transition-colors hover:border-brand-200`}>{body}</a> : <div className={cls}>{body}</div>;
}
