"use client";
import { Check, Database, GitCompare, Pencil, Search, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { FactBadge } from "@/components/app/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FilterSelect, Input } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, Spinner } from "@/components/ui/States";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import type { Fact, FactStatus } from "@/data/types";
import { useActivity, useFacts, useStamps } from "@/lib/data";
import { useSession } from "@/lib/session";
import { cn, formatDate, uid } from "@/lib/utils";

type Tab = "all" | FactStatus;

export function FactsPage() {
  const params = useSearchParams();
  const { toast } = useToast();
  const [facts, setFacts, ready] = useFacts();
  const [, setStamps] = useStamps();
  const [, setActivity] = useActivity();
  const [session] = useSession();
  const [tab, setTab] = useState<Tab>((params.get("status") as Tab) ?? "all");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const [editing, setEditing] = useState<Fact | null>(null);
  const [val, setVal] = useState("");
  const [valErr, setValErr] = useState<string>();

  const canManage = session?.role === "Admin";
  const categories = useMemo(() => Array.from(new Set(facts.map((f) => f.category))).sort(), [facts]);
  const counts = useMemo(() => facts.reduce<Record<string, number>>((a, f) => ({ ...a, [f.status]: (a[f.status] ?? 0) + 1 }), { all: facts.length }), [facts]);
  const rows = useMemo(() => {
    const n = q.trim().toLowerCase();
    return facts.filter((f) => (tab === "all" || f.status === tab) && (cat === "all" || f.category === cat) &&
      (!n || [f.name, f.value, f.file, f.id].some((v) => v.toLowerCase().includes(n))));
  }, [facts, tab, q, cat]);

  const fact = facts.find((f) => f.id === selected) ?? null;
  const today = () => new Date().toISOString().slice(0, 10);

  function log(what: string) { setActivity((p) => [{ id: uid("AC"), when: new Date().toISOString(), who: session?.name ?? "You", what }, ...p]); }

  function setStatus(f: Fact, status: FactStatus) {
    setFacts((p) => p.map((x) => (x.id === f.id ? { ...x, status, updated: today() } : x)));
    log(`${status === "approved" ? "approved" : status === "rejected" ? "rejected" : "expired"} fact ${f.id} (${f.name})`);
    if (status === "expired") {
      setStamps((p) => p.map((s) => s.status === "valid" && s.factIds.includes(f.id) ? { ...s, status: "stale", staleReason: `${f.name} (${f.id}) was expired and is no longer an approved fact.` } : s));
    }
    toast(`${f.name}: ${status}`);
  }

  function saveEdit() {
    if (!editing) return;
    if (!val.trim()) { setValErr("Enter a value"); return; }
    const old = editing;
    setFacts((p) => p.map((x) => x.id === old.id ? { ...x, value: val.trim(), updated: today(), history: [{ version: x.version, value: val.trim(), date: today(), note: `Edited manually from ${x.value}` }, ...x.history] } : x));
    if (old.value !== val.trim()) {
      setStamps((p) => p.map((s) => s.status === "valid" && s.factIds.includes(old.id) ? { ...s, status: "stale", staleReason: `${old.name} (${old.id}) changed from ${old.value} to ${val.trim()}.` } : s));
    }
    log(`edited fact ${old.id} (${old.name}) from ${old.value} to ${val.trim()}`);
    toast("Fact updated. Dependent verifications were marked stale.");
    setEditing(null);
  }

  function togglePick(id: string) { setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 2 ? [p[1], id] : [...p, id])); }
  const compared = picked.map((id) => facts.find((f) => f.id === id)).filter((f): f is Fact => !!f);

  if (!ready) return <Spinner />;

  return (
    <>
      <PageHeader title="Product Facts" crumbs={[{ label: "Product Facts" }]} sample
        description="Only approved facts can support a factual finding. Candidates need a decision before they are used."
        actions={<Button variant="secondary" disabled={picked.length !== 2} onClick={() => setComparing(true)}><GitCompare className="h-4 w-4" />Compare selected ({picked.length}/2)</Button>} />
      <Card>
        <div className="px-4 pt-1">
          <Tabs<Tab> label="Fact status" value={tab} onChange={setTab} tabs={[
            { value: "all", label: "All", count: counts.all }, { value: "candidate", label: "Candidate", count: counts.candidate ?? 0 },
            { value: "approved", label: "Approved", count: counts.approved ?? 0 }, { value: "expired", label: "Expired", count: counts.expired ?? 0 }, { value: "rejected", label: "Rejected", count: counts.rejected ?? 0 },
          ]} />
        </div>
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
          <label className="relative min-w-[220px] flex-1 sm:max-w-sm"><span className="sr-only">Search facts</span>
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-ink-400" aria-hidden="true" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, value, file or ID" className="h-9 w-full rounded-md border border-line-strong pl-8 pr-3 text-sm placeholder:text-ink-400" /></label>
          <FilterSelect label="Category" value={cat} onChange={setCat} options={[{ value: "all", label: "All categories" }, ...categories.map((c) => ({ value: c, label: c }))]} />
        </div>
        {rows.length === 0 ? <EmptyState icon={<Database className="h-5 w-5" />} title="No facts match" description="Change the tab, category or search term." /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead className="border-b border-line bg-surface-muted"><tr>
                <th scope="col" className="th w-10"><span className="sr-only">Select to compare</span></th>
                {["Fact", "Value", "Source", "Version", "Updated", "Status"].map((h) => <th key={h} scope="col" className="th">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-line">
                {rows.map((f) => (
                  <tr key={f.id} className="hover:bg-surface-muted">
                    <td className="td"><input type="checkbox" aria-label={`Select ${f.name} to compare`} checked={picked.includes(f.id)} onChange={() => togglePick(f.id)} className="h-4 w-4 rounded border-line-strong" /></td>
                    <td className="td"><button type="button" onClick={() => setSelected(f.id)} className="text-left font-medium text-brand-700 hover:underline">{f.name}</button><p className="font-mono text-xs text-ink-500">{f.id} · {f.category}</p></td>
                    <td className="td font-medium tabular-nums">{f.value} <span className="font-normal text-ink-500">{f.unit}</span></td>
                    <td className="td font-mono text-xs">{f.file}:{f.line}</td><td className="td">{f.version}</td><td className="td whitespace-nowrap">{formatDate(f.updated)}</td>
                    <td className="td"><FactBadge status={f.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={!!fact} onClose={() => setSelected(null)} title={fact?.name ?? "Fact"} wide
        footer={fact && (<>
          {canManage && fact.status !== "approved" && <Button onClick={() => setStatus(fact, "approved")}><Check className="h-4 w-4" />Approve</Button>}
          {canManage && fact.status === "candidate" && <Button variant="danger" onClick={() => setStatus(fact, "rejected")}><X className="h-4 w-4" />Reject</Button>}
          {canManage && fact.status === "approved" && <Button variant="secondary" onClick={() => setStatus(fact, "expired")}>Expire</Button>}
          {canManage && fact.status !== "expired" && <Button variant="secondary" onClick={() => { setEditing(fact); setVal(fact.value); setValErr(undefined); }}><Pencil className="h-4 w-4" />Edit value</Button>}
          {!canManage && <p className="mr-auto text-xs text-ink-500">Only admins can change facts.</p>}
        </>)}>
        {fact && (
          <div className="space-y-5">
            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              {[["Fact ID", fact.id], ["Value", `${fact.value} ${fact.unit}`.trim()], ["Category", fact.category], ["Source file", fact.file], ["Line", String(fact.line)], ["Product version", fact.version]].map(([k, v]) => (
                <div key={k}><dt className="text-xs text-ink-500">{k}</dt><dd className="break-all font-medium text-ink-900">{v}</dd></div>))}
              <div><dt className="text-xs text-ink-500">Status</dt><dd><FactBadge status={fact.status} /></dd></div>
              <div><dt className="text-xs text-ink-500">Last updated</dt><dd className="font-medium">{formatDate(fact.updated)}</dd></div>
            </dl>
            <div><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-500">Source preview</p>
              <pre className="overflow-x-auto rounded-md border border-line bg-ink-950 p-3 font-mono text-xs leading-6 text-ink-400">
                {fact.snippet.map((ln, i) => { const n = fact.snippetStart + i; return <div key={n} className={cn("flex gap-3", n === fact.line && "bg-brand-800/60 text-white")}><span className="w-8 select-none text-right text-ink-500">{n}</span><span>{ln}</span></div>; })}
              </pre></div>
            <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Version history</p>
              {fact.history.length === 0 ? <p className="text-sm text-ink-500">No earlier versions recorded.</p> : (
                <ol className="space-y-2">{fact.history.map((h, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-md border border-line p-2.5 text-sm"><Badge>{h.version}</Badge><span className="font-medium tabular-nums">{h.value}</span><span className="flex-1 text-ink-600">{h.note}</span><time className="shrink-0 text-xs text-ink-500">{formatDate(h.date)}</time></li>))}</ol>)}
            </div>
          </div>)}
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit fact value"
        footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={saveEdit}>Save change</Button></>}>
        <Input label={`Value for ${editing?.name ?? ""}`} value={val} onChange={(e) => setVal(e.target.value)} error={valErr} hint="A changed value is added to version history and marks verifications that rely on this fact as stale." />
      </Modal>

      <Modal open={comparing} onClose={() => setComparing(false)} title="Compare facts" wide footer={<Button variant="secondary" onClick={() => setComparing(false)}>Close</Button>}>
        <div className="grid gap-4 sm:grid-cols-2">
          {compared.map((f) => (
            <div key={f.id} className="rounded-lg border border-line p-4 text-sm">
              <p className="font-semibold text-ink-950">{f.name}</p><p className="font-mono text-xs text-ink-500">{f.id}</p>
              <dl className="mt-3 space-y-2">
                {[["Value", `${f.value} ${f.unit}`.trim()], ["Source", `${f.file}:${f.line}`], ["Version", f.version], ["Status", f.status], ["Category", f.category]].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3"><dt className="text-ink-500">{k}</dt><dd className="break-all text-right font-medium">{v}</dd></div>))}
              </dl>
            </div>))}
        </div>
      </Modal>
    </>
  );
}
