"use client";
import { FileUp, GitBranch, Plug, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { Badge, type Tone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, Spinner } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import type { Source } from "@/data/types";
import { useActivity, useFacts, useSourceChanges, useSources, useStamps } from "@/lib/data";
import { extractFacts, fileEntry } from "@/lib/extract";
import { useSession } from "@/lib/session";
import { formatDate, uid } from "@/lib/utils";

const STATUS: Record<Source["status"], [string, Tone]> = { connected: ["Connected (sample)", "ok"], "sync-needed": ["Sync needed", "warn"], "not-connected": ["Configuration only", "neutral"] };
const FILE_TONE: Record<string, Tone> = { synced: "neutral", modified: "warn", new: "brand" };
const REPO_RE = /^(https?:\/\/)?(github\.com|gitlab\.com|bitbucket\.org)\/[\w.-]+\/[\w.-]+\/?$/i;
const MAX_BYTES = 1024 * 1024;

export function SourcesPage() {
  const { toast } = useToast();
  const [sources, setSources, ready] = useSources();
  const [facts, setFacts] = useFacts();
  const [changes, setChanges] = useSourceChanges();
  const [, setStamps] = useStamps();
  const [, setActivity] = useActivity();
  const [session] = useSession();
  const [selId, setSelId] = useState<string | null>(null);
  const [connect, setConnect] = useState(false);
  const [repo, setRepo] = useState({ provider: "GitHub", url: "", branch: "main" });
  const [repoErr, setRepoErr] = useState<{ url?: string; branch?: string }>({});
  const input = useRef<HTMLInputElement>(null);
  const admin = session?.role === "Admin";

  if (!ready) return <Spinner />;
  const sel = sources.find((s) => s.id === selId) ?? sources[0];

  async function onFiles(list: FileList | null) {
    if (!list?.length) return;
    const upload = sources.find((s) => s.kind === "upload");
    const files = Array.from(list);
    let nextFacts = [...facts];
    let created = 0, changed = 0;
    const newChanges = [] as typeof changes;
    const touched = [] as ReturnType<typeof fileEntry>[];
    const versionFact = facts.find((f) => f.category === "Version" && f.status === "approved");
    for (const file of files) {
      if (!/\.(json|ya?ml|md)$/i.test(file.name)) { toast(`${file.name}: unsupported type (use JSON, YAML or Markdown)`, "error"); continue; }
      if (file.size > MAX_BYTES) { toast(`${file.name}: larger than 1 MB`, "error"); continue; }
      const text = await file.text();
      touched.push(fileEntry(file.name));
      if (/\.md$/i.test(file.name)) continue;
      for (const f of extractFacts(file.name, text, versionFact?.value ?? "uploaded", nextFacts.length)) {
        const existing = nextFacts.find((x) => x.file === f.file && x.name === f.name && x.status !== "expired" && x.status !== "rejected");
        if (!existing) { nextFacts.push({ ...f, id: `F-${1100 + nextFacts.length}` }); created++; continue; }
        if (existing.value !== f.value) {
          changed++;
          newChanges.push({ id: uid("CH"), date: new Date().toISOString().slice(0, 10), source: "Manual upload", file: file.name, summary: `${existing.name} changed from ${existing.value} to ${f.value}`, ref: "upload" });
          const wasApproved = existing.status === "approved";
          nextFacts = nextFacts.map((x) => x.id === existing.id ? { ...x, value: f.value, line: f.line, updated: f.updated, snippet: f.snippet, snippetStart: f.snippetStart, status: wasApproved ? "candidate" : x.status,
            history: [{ version: x.version, value: f.value, date: f.updated, note: `Changed by upload (was ${x.value})${wasApproved ? "; re-approval required" : ""}` }, ...x.history] } : x);
          if (wasApproved) setStamps((p) => p.map((s) => s.status === "valid" && s.factIds.includes(existing.id) ? { ...s, status: "stale", staleReason: `${existing.name} (${existing.id}) changed from ${existing.value} to ${f.value} in ${file.name}.` } : s));
        }
      }
    }
    if (!touched.length) return;
    setFacts(nextFacts);
    if (newChanges.length) setChanges((p) => [...newChanges, ...p]);
    const now = new Date().toISOString();
    if (upload) setSources((p) => p.map((s) => s.id === upload.id ? { ...s, status: "connected", lastSync: now, ref: `upload-${Date.now().toString(36).slice(-4)}`, files: [...touched, ...s.files.filter((x) => !touched.some((t) => t.path === x.path))] } : s));
    else setSources((p) => [...p, { id: uid("SRC"), name: "Manual upload", kind: "upload", location: "Uploaded files", branch: "n/a", status: "connected", lastSync: now, ref: "upload-1", files: touched }]);
    setActivity((p) => [{ id: uid("AC"), when: now, who: session?.name ?? "You", what: `uploaded ${touched.length} source file(s): ${created} new candidate fact(s), ${changed} changed` }, ...p]);
    toast(`${created} candidate fact(s) extracted, ${changed} changed value(s) detected`);
  }

  function saveRepo() {
    const e: typeof repoErr = {};
    if (!REPO_RE.test(repo.url.trim())) e.url = "Use a URL like github.com/owner/repository";
    if (!/^[\w./-]{1,60}$/.test(repo.branch)) e.branch = "Enter a valid branch name";
    setRepoErr(e);
    if (Object.keys(e).length) return;
    const loc = repo.url.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    setSources((p) => [...p, { id: uid("SRC"), name: loc.split("/").pop() ?? loc, kind: "repository", location: loc, branch: repo.branch, status: "not-connected", lastSync: null, ref: "none", files: [] }]);
    setConnect(false); setRepo({ provider: "GitHub", url: "", branch: "main" });
    toast("Repository configuration saved. No connection was made.", "info");
  }

  return (
    <>
      <PageHeader title="Repository Sources" crumbs={[{ label: "Repository Sources" }]} sample
        description="Upload JSON or YAML to extract candidate facts now. Live repository sync arrives with the backend."
        actions={<><input ref={input} type="file" multiple accept=".json,.yaml,.yml,.md" className="sr-only" aria-label="Choose product files" onChange={(e) => { void onFiles(e.target.files); e.target.value = ""; }} />
          <Button variant="secondary" onClick={() => setConnect(true)} disabled={!admin}><Plug className="h-4 w-4" />Connect repository</Button>
          <Button onClick={() => input.current?.click()} disabled={!admin}><Upload className="h-4 w-4" />Upload product files</Button></>} />

      {sources.length === 0 ? <Card><EmptyState icon={<GitBranch className="h-5 w-5" />} title="No sources yet" description="Upload structured product files to extract facts." /></Card> : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {sources.map((s) => (
            <li key={s.id}><Card className={`p-5 ${sel?.id === s.id ? "border-brand-200" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0"><p className="flex items-center gap-2 font-semibold text-ink-950">{s.kind === "repository" ? <GitBranch className="h-4 w-4" aria-hidden="true" /> : <FileUp className="h-4 w-4" aria-hidden="true" />}<span className="truncate">{s.name}</span></p>
                  <p className="mt-0.5 break-all font-mono text-xs text-ink-500">{s.location}</p></div>
                <Badge tone={STATUS[s.status][1]}>{STATUS[s.status][0]}</Badge>
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div><dt className="text-xs text-ink-500">Branch</dt><dd className="font-medium">{s.branch}</dd></div>
                <div><dt className="text-xs text-ink-500">Last sync</dt><dd className="font-medium">{s.lastSync ? formatDate(s.lastSync, true) : "Never"}</dd></div>
                <div><dt className="text-xs text-ink-500">Version ref</dt><dd className="font-mono font-medium">{s.ref}</dd></div>
              </dl>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button size="sm" variant="secondary" onClick={() => setSelId(s.id)}>View files ({s.files.length})</Button>
                {s.kind === "upload" ? <Button size="sm" variant="secondary" disabled={!admin} onClick={() => input.current?.click()}>Re-upload to sync</Button>
                  : <Button size="sm" variant="secondary" disabled title="Needs the backend">Sync now</Button>}
                <button type="button" disabled={!admin} aria-label={`Remove source ${s.name}`} className="ml-auto rounded p-1.5 text-ink-500 hover:bg-surface-sunken disabled:opacity-40" onClick={() => { setSources((p) => p.filter((x) => x.id !== s.id)); toast("Source removed. Existing facts were kept."); }}><Trash2 className="h-4 w-4" /></button>
              </div>
              {s.kind === "repository" && <p className="mt-3 text-xs text-ink-500">Live sync and read-only token setup require the backend.</p>}
            </Card></li>))}
        </ul>)}

      {sel && (
        <Card className="mt-6">
          <CardHeader title={`Structured files in ${sel.name}`} description="JSON, YAML, OpenAPI, package manifests, feature flags and changelogs" />
          {sel.files.length === 0 ? <EmptyState title="No files listed" description="Upload product files to populate this list." /> : (
            <div className="overflow-x-auto"><table className="w-full min-w-[560px]">
              <thead className="border-b border-line bg-surface-muted"><tr>{["File", "Type", "Last changed", "State"].map((h) => <th key={h} scope="col" className="th">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-line">{sel.files.map((f) => (
                <tr key={f.path}><td className="td font-mono text-xs">{f.path}</td><td className="td">{f.type}</td><td className="td">{formatDate(f.changed)}</td><td className="td"><Badge tone={FILE_TONE[f.state]}>{f.state}</Badge></td></tr>))}</tbody>
            </table></div>)}
        </Card>)}

      <Card className="mt-6">
        <CardHeader title="Change history" description="Differences detected between synchronisations" />
        {changes.length === 0 ? <EmptyState title="No changes recorded" /> : (
          <ul className="divide-y divide-line">{changes.map((c) => (
            <li key={c.id} className="flex flex-wrap items-start gap-x-4 gap-y-1 px-5 py-3"><p className="min-w-0 flex-1 text-sm text-ink-800">{c.summary}</p>
              <p className="flex items-center gap-2 text-xs text-ink-500"><span className="font-mono">{c.file}</span><Badge>{c.ref}</Badge><time>{formatDate(c.date)}</time></p></li>))}</ul>)}
      </Card>

      <Modal open={connect} onClose={() => setConnect(false)} title="Connect repository"
        footer={<><Button variant="secondary" onClick={() => setConnect(false)}>Cancel</Button><Button onClick={saveRepo}>Save configuration</Button></>}>
        <div className="space-y-4">
          <p className="rounded-md border border-line bg-surface-muted p-3 text-xs text-ink-600">This saves the connection settings only. No request is made to the provider and no access token is collected until the backend exists.</p>
          <Select label="Provider" value={repo.provider} onChange={(e) => setRepo({ ...repo, provider: e.target.value })}><option>GitHub</option><option>GitLab</option><option>Bitbucket</option></Select>
          <Input label="Repository URL" value={repo.url} onChange={(e) => setRepo({ ...repo, url: e.target.value })} placeholder="github.com/owner/repository" error={repoErr.url} />
          <Input label="Branch" value={repo.branch} onChange={(e) => setRepo({ ...repo, branch: e.target.value })} error={repoErr.branch} />
        </div>
      </Modal>
    </>
  );
}
