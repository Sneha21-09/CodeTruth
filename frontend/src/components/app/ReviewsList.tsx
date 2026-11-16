"use client";
import { ArrowDown, ArrowUp, FileText, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { SubmissionBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FilterSelect, Input, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, Spinner } from "@/components/ui/States";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import type { Submission, SubmissionStatus } from "@/data/types";
import { useActivity, useSubmissions } from "@/lib/data";
import { useSession } from "@/lib/session";
import { formatDate, uid } from "@/lib/utils";

type Tab = "all" | SubmissionStatus;
type SortKey = "title" | "channel" | "status" | "updated";
const CHANNELS = ["Website", "Social", "Email", "Advertisement", "Announcement"];

export function ReviewsList() {
  const params = useSearchParams();
  const { toast } = useToast();
  const [subs, setSubs, ready] = useSubmissions();
  const [, setActivity] = useActivity();
  const [session] = useSession();
  const initial = params.get("status") as Tab | null;
  const [tab, setTab] = useState<Tab>(initial ?? "all");
  const [q, setQ] = useState("");
  const [channel, setChannel] = useState("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "updated", dir: -1 });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", channel: "Website", text: "" });
  const [errors, setErrors] = useState<{ title?: string; text?: string }>({});

  useEffect(() => { if (initial) setTab(initial); }, [initial]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: subs.length };
    subs.forEach((s) => { c[s.status] = (c[s.status] ?? 0) + 1; });
    return c;
  }, [subs]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const filtered = subs.filter((s) =>
      (tab === "all" || s.status === tab) && (channel === "all" || s.channel === channel) &&
      (!needle || [s.title, s.author, s.text, s.id].some((v) => v.toLowerCase().includes(needle))));
    return [...filtered].sort((a, b) => (a[sort.key] > b[sort.key] ? 1 : a[sort.key] < b[sort.key] ? -1 : 0) * sort.dir);
  }, [subs, tab, q, channel, sort]);

  function toggleSort(key: SortKey) { setSort((s) => (s.key === key ? { key, dir: (s.dir * -1) as 1 | -1 } : { key, dir: 1 })); }

  function create(asDraft: boolean, e?: FormEvent) {
    e?.preventDefault();
    const next: typeof errors = {};
    if (form.title.trim().length < 3) next.title = "Give the submission a title (3+ characters)";
    if (form.text.trim().length < 10) next.text = "Add at least 10 characters of content";
    setErrors(next);
    if (Object.keys(next).length) return;
    const today = new Date().toISOString().slice(0, 10);
    const who = session?.name ?? "You";
    const sub: Submission = {
      id: `S-${2000 + subs.length + 100}`, title: form.title.trim(), channel: form.channel, author: who,
      status: asDraft ? "draft" : "pending", created: today, updated: today, text: form.text.trim(), findings: [],
      history: [{ when: new Date().toISOString(), who, what: asDraft ? "Saved draft" : "Submitted for review" }],
    };
    setSubs((p) => [sub, ...p]);
    setActivity((p) => [{ id: uid("AC"), when: new Date().toISOString(), who, what: `${asDraft ? "saved draft" : "submitted"} “${sub.title}”` }, ...p]);
    toast(asDraft ? "Draft saved" : "Submitted for review");
    setOpen(false); setForm({ title: "", channel: "Website", text: "" });
  }

  const SortHead = ({ k, children }: { k: SortKey; children: string }) => (
    <th scope="col" className="th" aria-sort={sort.key === k ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
      <button type="button" onClick={() => toggleSort(k)} className="inline-flex items-center gap-1 uppercase hover:text-ink-900">
        {children}{sort.key === k && (sort.dir === 1 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
      </button>
    </th>
  );

  if (!ready) return <Spinner />;

  return (
    <>
      <PageHeader title="Content Reviews" crumbs={[{ label: "Content Reviews" }]} sample
        description="Submit content, then open it to run the local rule check against approved product facts."
        actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />New submission</Button>} />
      <Card>
        <div className="px-4 pt-1">
          <Tabs<Tab> label="Submission status" value={tab} onChange={setTab} tabs={[
            { value: "all", label: "All", count: counts.all }, { value: "draft", label: "Drafts", count: counts.draft ?? 0 },
            { value: "pending", label: "Pending", count: counts.pending ?? 0 }, { value: "changes", label: "Changes requested", count: counts.changes ?? 0 },
            { value: "approved", label: "Approved", count: counts.approved ?? 0 }, { value: "rejected", label: "Rejected", count: counts.rejected ?? 0 },
          ]} />
        </div>
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
          <label className="relative min-w-[220px] flex-1 sm:max-w-sm">
            <span className="sr-only">Search submissions</span>
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-ink-400" aria-hidden="true" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, author or content"
              className="h-9 w-full rounded-md border border-line-strong pl-8 pr-3 text-sm placeholder:text-ink-400" />
          </label>
          <FilterSelect label="Channel" value={channel} onChange={setChannel} options={[{ value: "all", label: "All channels" }, ...CHANNELS.map((c) => ({ value: c, label: c }))]} />
        </div>
        {rows.length === 0 ? (
          <EmptyState icon={<FileText className="h-5 w-5" />} title="No submissions match" description="Try another status tab or clear the search and channel filters."
            action={<Button variant="secondary" size="sm" onClick={() => { setQ(""); setChannel("all"); setTab("all"); }}>Clear filters</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="border-b border-line bg-surface-muted"><tr>
                <SortHead k="title">Title</SortHead><SortHead k="channel">Channel</SortHead><th scope="col" className="th">Author</th>
                <SortHead k="status">Status</SortHead><th scope="col" className="th">Open findings</th><SortHead k="updated">Updated</SortHead>
              </tr></thead>
              <tbody className="divide-y divide-line">
                {rows.map((s) => {
                  const openCount = s.findings.filter((f) => f.decision === "open" && f.category !== "Verified claim").length;
                  return (
                    <tr key={s.id} className="hover:bg-surface-muted">
                      <td className="td"><Link href={`/app/reviews/${s.id}`} className="font-medium text-brand-700 hover:underline">{s.title}</Link><p className="font-mono text-xs text-ink-500">{s.id}</p></td>
                      <td className="td">{s.channel}</td><td className="td">{s.author}</td>
                      <td className="td"><SubmissionBadge status={s.status} /></td>
                      <td className="td tabular-nums">{openCount}</td><td className="td whitespace-nowrap">{formatDate(s.updated)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="New submission" wide
        footer={<><Button variant="secondary" onClick={() => create(true)}>Save draft</Button><Button onClick={() => create(false)}>Submit for review</Button></>}>
        <form onSubmit={(e) => create(false, e)} noValidate className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} error={errors.title} />
          <Select label="Channel" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>{CHANNELS.map((c) => <option key={c}>{c}</option>)}</Select>
          <Textarea label="Content" rows={7} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} error={errors.text} hint="Paste marketing copy. Image and file upload arrive with the backend." />
        </form>
      </Modal>
    </>
  );
}
