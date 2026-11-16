"use client";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, Spinner } from "@/components/ui/States";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import type { Guideline } from "@/data/types";
import { contrast, isHex } from "@/lib/contrast";
import { useBrand } from "@/lib/data";
import { useSession } from "@/lib/session";
import { uid } from "@/lib/utils";

type Tab = "tone" | "terms" | "banned" | "guidelines" | "colours" | "a11y";
const TONES = ["Confident", "Friendly", "Formal", "Technical", "Playful"];
const SAMPLE: Record<string, string> = {
  Confident: "Import up to 250 MB per file. Your team can start in minutes.",
  Friendly: "Got a big file? Bring it along, we handle up to 250 MB.",
  Formal: "The platform accepts files of up to 250 MB in size.",
  Technical: "Upload limit: 250 MB per file. Larger files are rejected with HTTP 413.",
  Playful: "Big files welcome! Up to 250 MB, no squeezing required.",
};

export function BrandPage() {
  const { toast } = useToast();
  const [brand, setBrand, ready] = useBrand();
  const [session] = useSession();
  const [tab, setTab] = useState<Tab>("tone");
  const [pair, setPair] = useState({ a: "", b: "" });
  const [pairErr, setPairErr] = useState<string>();
  const [colour, setColour] = useState({ name: "", hex: "#", role: "" });
  const [colourErr, setColourErr] = useState<string>();
  const [rule, setRule] = useState("");
  const [gl, setGl] = useState<Guideline | null>(null);
  const [glErr, setGlErr] = useState<string>();
  const [toneNotes, setToneNotes] = useState<string | null>(null);

  const admin = session?.role === "Admin";
  if (!ready) return <Spinner />;
  const ro = !admin;

  function addTerm() {
    const a = pair.a.trim(), b = pair.b.trim();
    if (!a || !b) { setPairErr("Fill in both fields"); return; }
    if (brand.preferred.some((t) => t.avoid.toLowerCase() === a.toLowerCase())) { setPairErr("That term already has a rule"); return; }
    setBrand((p) => ({ ...p, preferred: [...p.preferred, { id: uid("T"), avoid: a, use: b }] })); setPair({ a: "", b: "" }); setPairErr(undefined); toast("Preferred term added");
  }
  function addBanned() {
    const a = pair.a.trim(), b = pair.b.trim();
    if (!a || !b) { setPairErr("Enter the term and a reason"); return; }
    if (brand.banned.some((t) => t.term.toLowerCase() === a.toLowerCase())) { setPairErr("That term is already banned"); return; }
    setBrand((p) => ({ ...p, banned: [...p.banned, { id: uid("B"), term: a, reason: b }] })); setPair({ a: "", b: "" }); setPairErr(undefined); toast("Banned term added");
  }
  function addColour() {
    if (colour.name.trim().length < 2) { setColourErr("Name the colour"); return; }
    if (!isHex(colour.hex)) { setColourErr("Use a full hex value like #1F5BD0"); return; }
    setBrand((p) => ({ ...p, colours: [...p.colours, { id: uid("C"), name: colour.name.trim(), hex: colour.hex.toUpperCase(), role: colour.role.trim() || "Accent" }] }));
    setColour({ name: "", hex: "#", role: "" }); setColourErr(undefined); toast("Colour added");
  }
  function saveGuideline() {
    if (!gl) return;
    if (gl.title.trim().length < 3 || gl.body.trim().length < 5) { setGlErr("Add a title and a short description"); return; }
    setBrand((p) => ({ ...p, guidelines: p.guidelines.some((g) => g.id === gl.id) ? p.guidelines.map((g) => (g.id === gl.id ? gl : g)) : [...p.guidelines, gl] }));
    setGl(null); setGlErr(undefined); toast("Guideline saved");
  }

  const AddRow = ({ a, b, onAdd, ph }: { a: string; b: string; onAdd: () => void; ph: [string, string] }) => (
    <div className="border-b border-line p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Input label={a} value={pair.a} onChange={(e) => setPair({ ...pair, a: e.target.value })} placeholder={ph[0]} disabled={ro} />
        <Input label={b} value={pair.b} onChange={(e) => setPair({ ...pair, b: e.target.value })} placeholder={ph[1]} disabled={ro} />
        <Button onClick={onAdd} disabled={ro}><Plus className="h-4 w-4" />Add</Button>
      </div>
      {pairErr && <p role="alert" className="mt-2 text-xs font-medium text-bad-600">{pairErr}</p>}
    </div>
  );

  return (
    <>
      <PageHeader title="Brand Guidelines" crumbs={[{ label: "Brand Guidelines" }]} sample
        description={ro ? "Read-only: only admins can edit brand rules." : "Rules here are applied by the local rule check on every submission."} />
      <Card>
        <div className="px-4 pt-1">
          <Tabs<Tab> label="Brand sections" value={tab} onChange={(t) => { setTab(t); setPair({ a: "", b: "" }); setPairErr(undefined); }} tabs={[
            { value: "tone", label: "Tone" }, { value: "terms", label: "Preferred terms", count: brand.preferred.length }, { value: "banned", label: "Banned words", count: brand.banned.length },
            { value: "guidelines", label: "Writing guidelines", count: brand.guidelines.length }, { value: "colours", label: "Colours", count: brand.colours.length }, { value: "a11y", label: "Accessibility", count: brand.a11y.length },
          ]} />
        </div>

        {tab === "tone" && (
          <div className="grid gap-6 p-5 md:grid-cols-2">
            <div className="space-y-4">
              <Select label="Tone of voice" value={brand.tone} disabled={ro} onChange={(e) => { setBrand((p) => ({ ...p, tone: e.target.value })); toast("Tone updated"); }}>{TONES.map((t) => <option key={t}>{t}</option>)}</Select>
              <Textarea label="Tone notes" rows={5} disabled={ro} value={toneNotes ?? brand.toneNotes} onChange={(e) => setToneNotes(e.target.value)} />
              <Button disabled={ro || toneNotes === null} onClick={() => { setBrand((p) => ({ ...p, toneNotes: toneNotes ?? p.toneNotes })); setToneNotes(null); toast("Tone notes saved"); }}>Save notes</Button>
            </div>
            <div className="rounded-lg border border-line bg-surface-muted p-5"><p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Preview: {brand.tone}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-900">{SAMPLE[brand.tone]}</p><p className="mt-3 text-xs text-ink-500">Fixed example sentence, not generated.</p></div>
          </div>
        )}

        {tab === "terms" && (<>
          <AddRow a="Avoid" b="Use instead" onAdd={addTerm} ph={["e.g. customers", "e.g. teams"]} />
          {brand.preferred.length === 0 ? <EmptyState title="No preferred terms yet" description="Add a term to avoid and the wording to use instead." /> : (
            <ul className="divide-y divide-line">{brand.preferred.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-5 py-3 text-sm"><span className="rounded bg-red-50 px-1.5 text-bad-700 line-through">{t.avoid}</span><span aria-hidden="true">→</span><span className="rounded bg-green-50 px-1.5 text-ok-700">{t.use}</span>
                <button type="button" disabled={ro} aria-label={`Delete rule for ${t.avoid}`} className="ml-auto rounded p-1.5 text-ink-500 hover:bg-surface-sunken disabled:opacity-40" onClick={() => { setBrand((p) => ({ ...p, preferred: p.preferred.filter((x) => x.id !== t.id) })); toast("Preferred term removed"); }}><Trash2 className="h-4 w-4" /></button></li>))}</ul>)}
        </>)}

        {tab === "banned" && (<>
          <AddRow a="Banned term" b="Reason" onAdd={addBanned} ph={["e.g. revolutionary", "e.g. Unsupported superlative"]} />
          {brand.banned.length === 0 ? <EmptyState title="No banned words" /> : (
            <ul className="divide-y divide-line">{brand.banned.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-5 py-3 text-sm"><Badge tone="bad">{t.term}</Badge><span className="text-ink-600">{t.reason}</span>
                <button type="button" disabled={ro} aria-label={`Delete banned term ${t.term}`} className="ml-auto rounded p-1.5 text-ink-500 hover:bg-surface-sunken disabled:opacity-40" onClick={() => { setBrand((p) => ({ ...p, banned: p.banned.filter((x) => x.id !== t.id) })); toast("Banned term removed"); }}><Trash2 className="h-4 w-4" /></button></li>))}</ul>)}
        </>)}

        {tab === "guidelines" && (<>
          <div className="flex justify-end border-b border-line p-4"><Button disabled={ro} onClick={() => { setGl({ id: uid("G"), title: "", body: "" }); setGlErr(undefined); }}><Plus className="h-4 w-4" />Add guideline</Button></div>
          {brand.guidelines.length === 0 ? <EmptyState title="No writing guidelines" /> : (
            <ul className="divide-y divide-line">{brand.guidelines.map((g) => (
              <li key={g.id} className="flex items-start gap-3 px-5 py-4"><div className="flex-1"><p className="text-sm font-semibold text-ink-950">{g.title}</p><p className="mt-0.5 text-sm text-ink-600">{g.body}</p></div>
                <button type="button" disabled={ro} aria-label={`Edit ${g.title}`} className="rounded p-1.5 text-ink-500 hover:bg-surface-sunken disabled:opacity-40" onClick={() => { setGl(g); setGlErr(undefined); }}><Pencil className="h-4 w-4" /></button>
                <button type="button" disabled={ro} aria-label={`Delete ${g.title}`} className="rounded p-1.5 text-ink-500 hover:bg-surface-sunken disabled:opacity-40" onClick={() => { setBrand((p) => ({ ...p, guidelines: p.guidelines.filter((x) => x.id !== g.id) })); toast("Guideline removed"); }}><Trash2 className="h-4 w-4" /></button></li>))}</ul>)}
        </>)}

        {tab === "colours" && (<>
          <div className="border-b border-line p-4"><div className="grid gap-3 sm:grid-cols-[1fr_140px_1fr_auto] sm:items-end">
            <Input label="Name" value={colour.name} disabled={ro} onChange={(e) => setColour({ ...colour, name: e.target.value })} />
            <Input label="Hex" value={colour.hex} disabled={ro} maxLength={7} onChange={(e) => setColour({ ...colour, hex: e.target.value })} />
            <Input label="Role" value={colour.role} disabled={ro} onChange={(e) => setColour({ ...colour, role: e.target.value })} placeholder="e.g. Primary" />
            <Button disabled={ro} onClick={addColour}><Plus className="h-4 w-4" />Add</Button></div>
            {colourErr && <p role="alert" className="mt-2 text-xs font-medium text-bad-600">{colourErr}</p>}</div>
          <ul className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">{brand.colours.map((c) => {
            const onWhite = contrast(c.hex, "#FFFFFF"); const pass = onWhite >= 4.5;
            return (<li key={c.id} className="overflow-hidden rounded-lg border border-line">
              <div className="h-16" style={{ background: c.hex }} role="img" aria-label={`${c.name} swatch ${c.hex}`} />
              <div className="p-3 text-sm"><div className="flex items-start justify-between"><p className="font-semibold text-ink-950">{c.name}</p>
                <button type="button" disabled={ro} aria-label={`Delete colour ${c.name}`} onClick={() => { setBrand((p) => ({ ...p, colours: p.colours.filter((x) => x.id !== c.id) })); toast("Colour removed"); }} className="rounded p-1 text-ink-500 hover:bg-surface-sunken disabled:opacity-40"><Trash2 className="h-3.5 w-3.5" /></button></div>
                <p className="font-mono text-xs text-ink-500">{c.hex} · {c.role}</p>
                <p className="mt-2"><Badge tone={pass ? "ok" : "warn"}>{onWhite.toFixed(2)}:1 on white {pass ? "AA pass" : "below AA for text"}</Badge></p></div></li>);
          })}</ul>
        </>)}

        {tab === "a11y" && (<>
          <div className="border-b border-line p-4"><div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <Input label="New accessibility rule" value={rule} disabled={ro} onChange={(e) => setRule(e.target.value)} />
            <Button disabled={ro} onClick={() => { if (rule.trim().length < 5) return; setBrand((p) => ({ ...p, a11y: [...p.a11y, { id: uid("A"), rule: rule.trim(), enabled: true }] })); setRule(""); toast("Rule added"); }}><Plus className="h-4 w-4" />Add</Button></div></div>
          <ul className="divide-y divide-line">{brand.a11y.map((r) => (
            <li key={r.id} className="flex items-center gap-3 px-5 py-3 text-sm">
              <label className="flex flex-1 items-center gap-3"><input type="checkbox" disabled={ro} checked={r.enabled} onChange={() => setBrand((p) => ({ ...p, a11y: p.a11y.map((x) => (x.id === r.id ? { ...x, enabled: !x.enabled } : x)) }))} className="h-4 w-4 rounded border-line-strong" /><span className={r.enabled ? "text-ink-900" : "text-ink-500"}>{r.rule}</span></label>
              <button type="button" disabled={ro} aria-label={`Delete rule: ${r.rule}`} onClick={() => { setBrand((p) => ({ ...p, a11y: p.a11y.filter((x) => x.id !== r.id) })); toast("Rule removed"); }} className="rounded p-1.5 text-ink-500 hover:bg-surface-sunken disabled:opacity-40"><Trash2 className="h-4 w-4" /></button></li>))}</ul>
        </>)}
      </Card>

      <Modal open={!!gl} onClose={() => setGl(null)} title={gl && brand.guidelines.some((g) => g.id === gl.id) ? "Edit guideline" : "Add guideline"}
        footer={<><Button variant="secondary" onClick={() => setGl(null)}>Cancel</Button><Button onClick={saveGuideline}>Save</Button></>}>
        {gl && <div className="space-y-4"><Input label="Title" value={gl.title} onChange={(e) => setGl({ ...gl, title: e.target.value })} /><Textarea label="Guidance" value={gl.body} onChange={(e) => setGl({ ...gl, body: e.target.value })} error={glErr} /></div>}
      </Modal>
    </>
  );
}
