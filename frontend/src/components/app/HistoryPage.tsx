"use client";
import { AlertTriangle, BadgeCheck, History as HistoryIcon, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FilterSelect } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, Spinner } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import type { Stamp } from "@/data/types";
import { useActivity, useFacts, useStamps, useSubmissions } from "@/lib/data";
import { useSession } from "@/lib/session";
import { formatDate, uid } from "@/lib/utils";

export function HistoryPage() {
  const { toast } = useToast();
  const [stamps, setStamps, ready] = useStamps();
  const [facts] = useFacts();
  const [subs, setSubs] = useSubmissions();
  const [, setActivity] = useActivity();
  const [session] = useSession();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState<Stamp | null>(null);

  const rows = useMemo(() => { const n = q.trim().toLowerCase(); return stamps.filter((s) => (status === "all" || s.status === status) && (!n || [s.title, s.id, s.version].some((v) => v.toLowerCase().includes(n)))); }, [stamps, q, status]);
  if (!ready) return <Spinner />;
  const staleCount = stamps.filter((s) => s.status === "stale").length;
  const stamp = open ? stamps.find((s) => s.id === open.id) ?? open : null;
  const sub = stamp ? subs.find((s) => s.id === stamp.submissionId) : undefined;

  function reopen(s: Stamp) {
    const target = subs.find((x) => x.id === s.submissionId);
    if (!target) { toast("The original submission is not in this browser's sample data.", "error"); return; }
    const now = new Date().toISOString();
    setSubs((p) => p.map((x) => x.id === target.id ? { ...x, status: "pending", updated: now.slice(0, 10), history: [{ when: now, who: session?.name ?? "You", what: `Re-opened for review: ${s.staleReason ?? "stale verification"}` }, ...(x.history ?? [])] } : x));
    setActivity((p) => [{ id: uid("AC"), when: now, who: session?.name ?? "You", what: `re-opened “${target.title}” for review` }, ...p]);
    toast("Content re-opened for review"); setOpen(null);
  }

  return (
    <>
      <PageHeader title="Verification History" crumbs={[{ label: "Verification History" }]} sample description="Every approval records the product version and facts it was verified against. Stamps go stale when a bound fact changes." />
      {staleCount > 0 && <div role="status" className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-warn-50 p-3 text-sm text-warn-700"><AlertTriangle className="h-4 w-4" aria-hidden="true" />{staleCount} verification{staleCount > 1 ? "s are" : " is"} stale and need re-review.</div>}
      <Card>
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
          <label className="relative min-w-[220px] flex-1 sm:max-w-sm"><span className="sr-only">Search verifications</span><Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-ink-400" aria-hidden="true" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, stamp ID or version" className="h-9 w-full rounded-md border border-line-strong pl-8 pr-3 text-sm placeholder:text-ink-400" /></label>
          <FilterSelect label="Verification status" value={status} onChange={setStatus} options={[{ value: "all", label: "All statuses" }, { value: "valid", label: "Valid" }, { value: "stale", label: "Stale" }]} />
        </div>
        {rows.length === 0 ? <EmptyState icon={<HistoryIcon className="h-5 w-5" />} title="No verifications match" description="Approved content appears here with its stamp." /> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[720px]">
            <thead className="border-b border-line bg-surface-muted"><tr>{["Content", "Stamp", "Product version", "Verified", "Facts", "Status"].map((h) => <th key={h} scope="col" className="th">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-line">{rows.map((s) => (
              <tr key={s.id} className="hover:bg-surface-muted">
                <td className="td"><button type="button" onClick={() => setOpen(s)} className="text-left font-medium text-brand-700 hover:underline">{s.title}</button></td>
                <td className="td font-mono text-xs">{s.id}</td><td className="td">{s.version}</td><td className="td whitespace-nowrap">{formatDate(s.date)}</td><td className="td tabular-nums">{s.factIds.length}</td>
                <td className="td">{s.status === "valid" ? <Badge tone="ok">Valid</Badge> : <Badge tone="bad">Stale</Badge>}</td></tr>))}</tbody></table></div>)}
      </Card>

      <Modal open={!!stamp} onClose={() => setOpen(null)} title="Verification stamp" wide
        footer={stamp && <>{stamp.status === "stale" && <Button onClick={() => reopen(stamp)}>Re-open for review</Button>}<Button variant="secondary" onClick={() => setOpen(null)}>Close</Button></>}>
        {stamp && (
          <div className="space-y-5">
            <div className={`rounded-lg border p-4 ${stamp.status === "valid" ? "border-green-200 bg-ok-50" : "border-red-200 bg-bad-50"}`}>
              <p className="flex items-center gap-2 text-sm font-semibold text-ink-950">{stamp.status === "valid" ? <BadgeCheck className="h-4 w-4 text-ok-600" /> : <AlertTriangle className="h-4 w-4 text-bad-600" />}{stamp.status === "valid" ? "Valid verification" : "Stale verification"}</p>
              <p className="mt-2 text-[15px] text-ink-900">Verified against version {stamp.version} on {formatDate(stamp.date)}.</p>
              <p className="mt-1 text-xs text-ink-600">Reviewer: {stamp.reviewer} · {stamp.id}</p>
              {stamp.staleReason && <p className="mt-3 text-sm text-bad-700"><strong>Why it is stale:</strong> {stamp.staleReason}</p>}
            </div>
            <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Facts bound to this verification</p>
              {stamp.factIds.length === 0 ? <p className="text-sm text-ink-500">No facts were bound.</p> : (
                <ul className="space-y-2">{stamp.factIds.map((id) => { const f = facts.find((x) => x.id === id);
                  return <li key={id} className="flex flex-wrap items-center gap-2 rounded-md border border-line p-2.5 text-sm"><span className="font-mono text-xs">{id}</span>
                    {f ? <><span className="font-medium">{f.name}</span><span className="tabular-nums">{f.value} {f.unit}</span><span className="ml-auto font-mono text-xs text-ink-500">{f.file}:{f.line}</span></> : <span className="text-ink-500">Not in registry</span>}</li>; })}</ul>)}</div>
            {sub && <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Associated claims</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-ink-800">{sub.findings.map((f) => <li key={f.id}>“{f.claim}”</li>)}</ul>
              <Link href={`/app/reviews/${sub.id}`} className="mt-2 inline-block text-sm font-medium text-brand-700 hover:underline">Open submission {sub.id}</Link></div>}
          </div>)}
      </Modal>
    </>
  );
}
