"use client";
import { Check, CheckCircle2, Copy, FileCode2, Pencil, PlayCircle, RotateCcw, Send, ShieldAlert, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { SeverityBadge, SubmissionBadge } from "@/components/app/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, Spinner } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import type { Finding, Submission } from "@/data/types";
import { applySuggestions, mergeDecisions, runChecks } from "@/lib/checker";
import { useActivity, useBrand, useFacts, useStamps, useSubmissions } from "@/lib/data";
import { useSession } from "@/lib/session";
import { cn, formatDate, uid } from "@/lib/utils";

type Seg = { text: string; kind: "plain" | "flag" | "changed"; severity?: Finding["severity"]; verified?: boolean };

function segments(text: string, findings: Finding[], mode: "original" | "corrected"): Seg[] {
  const hits = findings
    .map((f) => ({ f, i: text.indexOf(f.claim) })).filter((h) => h.i >= 0 && h.f.claim.length > 0)
    .sort((a, b) => a.i - b.i);
  const out: Seg[] = [];
  let cursor = 0;
  for (const { f, i } of hits) {
    if (i < cursor) continue;
    if (i > cursor) out.push({ text: text.slice(cursor, i), kind: "plain" });
    const verified = f.category === "Verified claim";
    const rep = f.decision === "edited" ? f.editedText : f.decision === "accepted" ? f.suggestion : undefined;
    if (mode === "corrected" && rep && rep !== "same") out.push({ text: rep, kind: "changed" });
    else out.push({ text: f.claim, kind: mode === "original" && !verified ? "flag" : "plain", severity: f.severity, verified });
    cursor = i + f.claim.length;
  }
  if (cursor < text.length) out.push({ text: text.slice(cursor), kind: "plain" });
  return out;
}

function Marked({ segs, tone }: { segs: Seg[]; tone: "original" | "corrected" }) {
  return (
    <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink-800">
      {segs.map((s, i) => s.kind === "plain" ? <span key={i}>{s.text}</span> : (
        <mark key={i} className={cn("rounded px-0.5",
          tone === "corrected" ? "bg-green-100 text-ok-700" : s.severity === "critical" ? "bg-red-100 text-bad-700" : s.severity === "major" ? "bg-amber-100 text-warn-700" : "bg-surface-sunken text-ink-700")}>{s.text}</mark>
      ))}
    </p>
  );
}

export function ReviewDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [subs, setSubs, ready] = useSubmissions();
  const [facts] = useFacts();
  const [brand] = useBrand();
  const [, setStamps] = useStamps();
  const [, setActivity] = useActivity();
  const [session] = useSession();
  const [sourceFor, setSourceFor] = useState<Finding | null>(null);
  const [editing, setEditing] = useState<Finding | null>(null);
  const [editText, setEditText] = useState("");
  const [decision, setDecision] = useState<"changes" | "rejected" | null>(null);
  const [note, setNote] = useState("");

  const sub = subs.find((s) => s.id === id);
  const corrected = useMemo(() => (sub ? applySuggestions(sub.text, sub.findings) : ""), [sub]);
  if (!ready) return <Spinner />;
  if (!sub) return <EmptyState title="Submission not found" description="It may have been removed in another tab." action={<Link href="/app/reviews" className="text-sm font-medium text-brand-700 hover:underline">Back to reviews</Link>} />;

  const who = session?.name ?? "You";
  const isReviewer = session?.role === "Admin" || session?.role === "Reviewer";
  const actionable = sub.findings.filter((f) => f.category !== "Verified claim");
  const openCritical = actionable.filter((f) => f.severity === "critical" && f.decision === "open");
  const editable = sub.status === "draft" || sub.status === "changes" || sub.status === "pending";

  function save(patch: Partial<Submission>, what: string) {
    const now = new Date().toISOString();
    setSubs((p) => p.map((s) => s.id === sub!.id ? { ...s, ...patch, updated: now.slice(0, 10), history: [{ when: now, who, what }, ...(s.history ?? [])] } : s));
    setActivity((p) => [{ id: uid("AC"), when: now, who, what: `${what.toLowerCase()} on “${sub!.title}”` }, ...p]);
  }
  function setFinding(fid: string, patch: Partial<Finding>, what: string) {
    save({ findings: sub!.findings.map((f) => (f.id === fid ? { ...f, ...patch } : f)) }, what);
  }

  function runCheck() {
    const fresh = mergeDecisions(sub!.findings, runChecks(sub!.text, facts, brand));
    save({ findings: fresh }, `Ran local rule check (${fresh.filter((f) => f.category !== "Verified claim").length} finding(s))`);
    toast(fresh.length ? `Rule check complete: ${fresh.length} result(s)` : "Rule check complete: nothing matched approved facts or brand rules", "info");
  }

  function approve() {
    const versionFact = facts.find((f) => f.category === "Version" && f.status === "approved");
    const factIds = Array.from(new Set(sub!.findings.map((f) => f.factId).filter((x): x is string => !!x)));
    const nextId = `VS-${Math.floor(Date.now() / 1000) % 100000}`;
    setStamps((p) => [{ id: nextId, submissionId: sub!.id, title: sub!.title, version: versionFact?.value ?? "unknown", date: new Date().toISOString().slice(0, 10), status: "valid", factIds, reviewer: who }, ...p]);
    save({ status: "approved" }, `Approved and issued stamp ${nextId}`);
    toast(`Approved. Verification stamp ${nextId} created.`);
  }

  function confirmDecision() {
    if (!decision) return;
    if (note.trim().length < 5) return;
    save({ status: decision, reviewerNote: note.trim() }, decision === "changes" ? "Requested changes" : "Rejected submission");
    toast(decision === "changes" ? "Changes requested" : "Submission rejected");
    setDecision(null); setNote("");
  }

  async function copy() {
    try { await navigator.clipboard.writeText(corrected); toast("Corrected text copied"); } catch { toast("Copy is not available in this browser", "error"); }
  }

  return (
    <>
      <PageHeader title={sub.title} crumbs={[{ label: "Content Reviews", href: "/app/reviews" }, { label: sub.id }]} sample
        description={`${sub.channel} · by ${sub.author} · updated ${formatDate(sub.updated)}`}
        actions={<>
          {editable && <Button variant="secondary" onClick={runCheck}><PlayCircle className="h-4 w-4" />Run local rule check</Button>}
          {(sub.status === "draft" || sub.status === "changes") && <Button onClick={() => save({ status: "pending" }, "Submitted for review")}><Send className="h-4 w-4" />Submit for review</Button>}
        </>} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SubmissionBadge status={sub.status} />
        <Badge>{actionable.filter((f) => f.decision === "open").length} open</Badge>
        <Badge tone="ok">{actionable.filter((f) => f.decision === "accepted" || f.decision === "edited").length} resolved</Badge>
        <span className="text-xs text-ink-500">Rule check runs in your browser against approved facts. AI matching needs the backend.</span>
      </div>
      {sub.reviewerNote && (sub.status === "changes" || sub.status === "rejected") && (
        <div role="note" className="mb-4 rounded-lg border border-line bg-white p-4 text-sm"><p className="font-semibold text-ink-950">Reviewer note</p><p className="mt-1 text-ink-700">{sub.reviewerNote}</p></div>
      )}

      <Card>
        <CardHeader title="Original and corrected copy" description="Highlights show flagged claims on the left and applied corrections on the right."
          action={<Button size="sm" variant="secondary" onClick={copy}><Copy className="h-3.5 w-3.5" />Copy corrected</Button>} />
        <div className="grid divide-y divide-line md:grid-cols-2 md:divide-x md:divide-y-0">
          <section aria-label="Original text" className="p-5"><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Original</p><Marked tone="original" segs={segments(sub.text, sub.findings, "original")} /></section>
          <section aria-label="Corrected text" className="bg-surface-muted p-5"><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Corrected</p><Marked tone="corrected" segs={segments(sub.text, sub.findings, "corrected")} /></section>
        </div>
      </Card>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-ink-950">Findings <span className="text-ink-500">({sub.findings.length})</span></h2>
      {sub.findings.length === 0 ? (
        <Card><EmptyState icon={<ShieldAlert className="h-5 w-5" />} title="No claims checked yet" description="Run the local rule check to compare this copy with approved facts and brand rules."
          action={editable ? <Button onClick={runCheck}>Run local rule check</Button> : undefined} /></Card>
      ) : (
        <ul className="space-y-3">
          {sub.findings.map((f) => {
            const verified = f.category === "Verified claim";
            return (
              <li key={f.id}>
                <Card className={cn("p-4", !verified && f.decision === "open" && f.severity === "critical" && "border-red-200")}>
                  <div className="flex flex-wrap items-center gap-2">
                    {verified ? <CheckCircle2 className="h-4 w-4 text-ok-600" aria-hidden="true" /> : null}
                    <h3 className="text-[15px] font-semibold text-ink-950">{f.category}</h3>
                    {!verified && <SeverityBadge severity={f.severity} />}
                    <Badge tone={f.method === "AI" ? "brand" : "neutral"}>{f.method === "AI" ? "AI-assisted" : "Rule"}</Badge>
                    {f.decision !== "open" && <Badge tone={f.decision === "rejected" ? "bad" : "ok"}>{f.decision === "rejected" ? "Suggestion rejected" : f.decision === "edited" ? "Edited" : verified ? "Verified" : "Accepted"}</Badge>}
                  </div>
                  <p className="mt-2 text-sm text-ink-800">“{f.claim}”</p>
                  <p className="mt-1 text-sm text-ink-600">{f.explanation}</p>
                  <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                    <div><dt className="text-xs text-ink-500">Claimed / expected</dt><dd className="font-medium text-ink-900">{f.expected}</dd></div>
                    <div><dt className="text-xs text-ink-500">Product value</dt><dd className="font-medium text-ink-900">{f.actual}</dd></div>
                    <div><dt className="text-xs text-ink-500">Fact ID</dt><dd className="font-mono text-ink-900">{f.factId ?? "n/a (brand rule)"}</dd></div>
                    <div><dt className="text-xs text-ink-500">Source</dt>
                      <dd>{f.factId ? <button type="button" onClick={() => setSourceFor(f)} className="inline-flex items-center gap-1 font-mono text-[13px] text-brand-700 hover:underline"><FileCode2 className="h-3.5 w-3.5" />{f.file}:{f.line}</button> : <span className="font-mono text-[13px]">{f.file}</span>}</dd></div>
                  </dl>
                  {!verified && (
                    <div className="mt-3 rounded-md bg-surface-muted p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Suggested wording</p>
                      <p className="mt-1 text-sm"><span className="rounded bg-red-50 px-1 text-bad-700 line-through">{f.claim}</span>{" "}<span className="rounded bg-green-50 px-1 text-ok-700">{f.decision === "edited" ? f.editedText : f.suggestion || "(remove)"}</span></p>
                    </div>
                  )}
                  {!verified && editable && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" variant={f.decision === "accepted" ? "primary" : "secondary"} onClick={() => setFinding(f.id, { decision: "accepted" }, `Accepted suggestion for “${f.claim}”`)}><Check className="h-3.5 w-3.5" />Accept</Button>
                      <Button size="sm" variant="secondary" onClick={() => { setEditing(f); setEditText(f.editedText ?? f.suggestion); }}><Pencil className="h-3.5 w-3.5" />Edit</Button>
                      <Button size="sm" variant="secondary" onClick={() => setFinding(f.id, { decision: "rejected" }, `Rejected suggestion for “${f.claim}”`)}><X className="h-3.5 w-3.5" />Reject</Button>
                      {f.decision !== "open" && <Button size="sm" variant="ghost" onClick={() => setFinding(f.id, { decision: "open", editedText: undefined }, `Reopened finding “${f.claim}”`)}><RotateCcw className="h-3.5 w-3.5" />Reset</Button>}
                    </div>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {sub.status === "pending" && (
        <Card className="mt-6">
          <CardHeader title="Reviewer decision" description={isReviewer ? "Approval issues a verification stamp bound to the current product version." : "Only reviewers and admins can approve content."} />
          <div className="flex flex-wrap items-center gap-2 p-5">
            <Button disabled={!isReviewer || openCritical.length > 0} onClick={approve}><Check className="h-4 w-4" />Approve</Button>
            <Button variant="secondary" disabled={!isReviewer} onClick={() => setDecision("changes")}>Request changes</Button>
            <Button variant="danger" disabled={!isReviewer} onClick={() => setDecision("rejected")}>Reject</Button>
            {openCritical.length > 0 && <p className="text-sm text-bad-600">Resolve {openCritical.length} open critical finding{openCritical.length > 1 ? "s" : ""} before approving.</p>}
          </div>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader title="History" />
        {(sub.history?.length ?? 0) === 0 ? <p className="px-5 py-4 text-sm text-ink-500">No recorded actions yet.</p> : (
          <ol className="divide-y divide-line">
            {sub.history!.map((h, i) => (
              <li key={i} className="flex items-start justify-between gap-4 px-5 py-3 text-sm"><p><span className="font-medium">{h.who}</span> {h.what.charAt(0).toLowerCase() + h.what.slice(1)}</p><time dateTime={h.when} className="shrink-0 text-xs text-ink-500">{formatDate(h.when, true)}</time></li>
            ))}
          </ol>
        )}
      </Card>

      <Modal open={!!sourceFor} onClose={() => setSourceFor(null)} title="Source evidence" wide footer={<Button variant="secondary" onClick={() => setSourceFor(null)}>Close</Button>}>
        {sourceFor && (() => {
          const fact = facts.find((x) => x.id === sourceFor.factId);
          if (!fact) return <p className="text-sm text-ink-600">The fact {sourceFor.factId} is no longer in the registry.</p>;
          return (
            <div>
              <p className="text-sm text-ink-700"><span className="font-medium">{fact.name}</span> = {fact.value} {fact.unit} · version {fact.version} · <span className="font-mono">{fact.id}</span></p>
              <p className="mt-2 font-mono text-xs text-ink-500">{fact.file}</p>
              <pre className="mt-1 overflow-x-auto rounded-md border border-line bg-ink-950 p-3 font-mono text-xs leading-6 text-ink-400">
                {fact.snippet.map((ln, i) => { const n = fact.snippetStart + i; const hit = n === fact.line;
                  return <div key={n} className={cn("flex gap-3", hit && "bg-brand-800/60 text-white")}><span className="w-8 select-none text-right text-ink-500">{n}</span><span>{ln}</span></div>; })}
              </pre>
            </div>
          );
        })()}
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit suggested wording"
        footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
          <Button onClick={() => { if (editing) setFinding(editing.id, { decision: "edited", editedText: editText }, `Edited suggestion for “${editing.claim}”`); setEditing(null); toast("Edited wording saved"); }}>Save wording</Button></>}>
        <Textarea label="Replacement for the flagged text" value={editText} onChange={(e) => setEditText(e.target.value)} hint="Replaces only the highlighted claim and keeps the rest of your copy." />
      </Modal>

      <Modal open={!!decision} onClose={() => setDecision(null)} title={decision === "changes" ? "Request changes" : "Reject submission"}
        footer={<><Button variant="secondary" onClick={() => setDecision(null)}>Cancel</Button><Button variant={decision === "rejected" ? "danger" : "primary"} disabled={note.trim().length < 5} onClick={confirmDecision}>Confirm</Button></>}>
        <Textarea label="Note to the author" value={note} onChange={(e) => setNote(e.target.value)} hint="Required. Explain what needs to change." />
      </Modal>
    </>
  );
}
