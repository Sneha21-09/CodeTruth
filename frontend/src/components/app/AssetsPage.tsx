"use client";
import { ImageOff, Pencil, Search, Trash2, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FilterSelect, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, Spinner } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import type { Asset } from "@/data/types";
import { useAssets } from "@/lib/data";
import { useSession } from "@/lib/session";
import { formatDate, uid } from "@/lib/utils";

const KINDS: Asset["kind"][] = ["Logo", "Brand image", "Icon", "Marketing visual"];
const ALLOWED = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_PERSIST = 350 * 1024; // larger previews stay in memory only, to protect localStorage quota

export function AssetsPage() {
  const { toast } = useToast();
  const [assets, setAssets, ready] = useAssets();
  const [session] = useSession();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("all");
  const [sel, setSel] = useState<Asset | null>(null);
  const [alt, setAlt] = useState("");
  const [pending, setPending] = useState<{ file: File; url: string; kind: Asset["kind"]; alt: string } | null>(null);
  const [memPreview, setMemPreview] = useState<Record<string, string>>({});
  const input = useRef<HTMLInputElement>(null);
  const admin = session?.role === "Admin";

  const rows = useMemo(() => { const n = q.trim().toLowerCase(); return assets.filter((a) => (kind === "all" || a.kind === kind) && (!n || a.name.toLowerCase().includes(n) || a.alt.toLowerCase().includes(n))); }, [assets, q, kind]);
  if (!ready) return <Spinner />;

  function pick(file?: File) {
    if (!file) return;
    if (!ALLOWED.includes(file.type)) { toast("Unsupported file type. Use PNG, JPG, SVG or WebP.", "error"); return; }
    if (file.size > MAX_BYTES) { toast("File is larger than 5 MB.", "error"); return; }
    setPending({ file, url: URL.createObjectURL(file), kind: "Brand image", alt: "" });
  }

  function confirmUpload() {
    if (!pending) return;
    const { file, url, kind: k, alt: a } = pending;
    const reader = new FileReader();
    reader.onload = () => {
      const data = String(reader.result);
      const id = uid("AS");
      const persist = data.length <= MAX_PERSIST;
      const img = new Image();
      img.onload = () => {
        setAssets((p) => [{ id, name: file.name, kind: k, fileType: file.type.split("/")[1].replace("svg+xml", "svg").toUpperCase(), sizeKb: Math.max(1, Math.round(file.size / 1024)), dims: `${img.naturalWidth} × ${img.naturalHeight}`, added: new Date().toISOString().slice(0, 10), alt: a.trim(), hue: "#1F5BD0", preview: persist ? data : undefined }, ...p]);
        if (!persist) setMemPreview((m) => ({ ...m, [id]: data }));
        toast(persist ? "Asset uploaded" : "Asset uploaded. Preview is kept for this session only (file is large).", "success");
      };
      img.onerror = () => toast("That file could not be read as an image.", "error");
      img.src = data; URL.revokeObjectURL(url); setPending(null);
    };
    reader.readAsDataURL(file);
  }

  const Thumb = ({ a, className }: { a: Asset; className?: string }) => {
    const src = a.preview ?? memPreview[a.id];
    return src ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={src} alt={a.alt} className={className} /> : (
      <div className={`${className} flex items-center justify-center text-xs font-semibold text-white`} style={{ background: a.hue }} role="img" aria-label={a.alt || `${a.name} placeholder preview`}>{a.fileType}</div>);
  };

  return (
    <>
      <PageHeader title="Asset Library" crumbs={[{ label: "Asset Library" }]} sample description="Approved logos, images and icons. Images without alt text are flagged."
        actions={<><input ref={input} type="file" accept={ALLOWED.join(",")} className="sr-only" aria-label="Choose an asset file" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
          <Button disabled={!admin} onClick={() => input.current?.click()}><Upload className="h-4 w-4" />Upload asset</Button></>} />
      <Card>
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
          <label className="relative min-w-[220px] flex-1 sm:max-w-sm"><span className="sr-only">Search assets</span><Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-ink-400" aria-hidden="true" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or alt text" className="h-9 w-full rounded-md border border-line-strong pl-8 pr-3 text-sm placeholder:text-ink-400" /></label>
          <FilterSelect label="Asset type" value={kind} onChange={setKind} options={[{ value: "all", label: "All types" }, ...KINDS.map((k) => ({ value: k, label: k }))]} />
          {!admin && <span className="text-xs text-ink-500">Only admins can upload or edit assets.</span>}
        </div>
        {rows.length === 0 ? <EmptyState icon={<ImageOff className="h-5 w-5" />} title="No assets found" description="Upload an asset or change the filters." /> : (
          <ul className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((a) => (
              <li key={a.id} className="overflow-hidden rounded-lg border border-line">
                <Thumb a={a} className="h-36 w-full object-contain bg-surface-muted" />
                <div className="p-3">
                  <p className="truncate text-sm font-semibold text-ink-950" title={a.name}>{a.name}</p>
                  <p className="mt-0.5 text-xs text-ink-500">{a.kind} · {a.fileType} · {a.sizeKb} KB · {a.dims}</p>
                  <p className="mt-0.5 text-xs text-ink-500">Added {formatDate(a.added)}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    {a.alt ? <Badge tone="ok">Alt text set</Badge> : <Badge tone="warn">Alt text missing</Badge>}
                    <div className="flex">
                      <button type="button" disabled={!admin} aria-label={`Edit alt text for ${a.name}`} onClick={() => { setSel(a); setAlt(a.alt); }} className="rounded p-1.5 text-ink-500 hover:bg-surface-sunken disabled:opacity-40"><Pencil className="h-4 w-4" /></button>
                      <button type="button" disabled={!admin} aria-label={`Delete ${a.name}`} onClick={() => { setAssets((p) => p.filter((x) => x.id !== a.id)); toast("Asset deleted"); }} className="rounded p-1.5 text-ink-500 hover:bg-surface-sunken disabled:opacity-40"><Trash2 className="h-4 w-4" /></button>
                    </div></div></div></li>))}
          </ul>)}
      </Card>

      <Modal open={!!sel} onClose={() => setSel(null)} title="Edit alt text" footer={<><Button variant="secondary" onClick={() => setSel(null)}>Cancel</Button>
        <Button onClick={() => { if (sel) setAssets((p) => p.map((x) => (x.id === sel.id ? { ...x, alt } : x))); setSel(null); toast("Alt text saved"); }}>Save</Button></>}>
        {sel && <div className="space-y-3"><p className="text-sm text-ink-600">{sel.name}</p><Textarea label="Alt text" rows={3} value={alt} onChange={(e) => setAlt(e.target.value)} hint="Describe what the image shows. Leave empty only for purely decorative images." /></div>}
      </Modal>

      <Modal open={!!pending} onClose={() => { if (pending) URL.revokeObjectURL(pending.url); setPending(null); }} title="Upload asset"
        footer={<><Button variant="secondary" onClick={() => { if (pending) URL.revokeObjectURL(pending.url); setPending(null); }}>Cancel</Button><Button onClick={confirmUpload}>Add to library</Button></>}>
        {pending && <div className="space-y-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pending.url} alt="Selected file preview" className="max-h-48 w-full rounded-md border border-line object-contain bg-surface-muted" />
          <p className="text-sm text-ink-600">{pending.file.name} · {Math.round(pending.file.size / 1024)} KB</p>
          <Select label="Asset type" value={pending.kind} onChange={(e) => setPending({ ...pending, kind: e.target.value as Asset["kind"] })}>{KINDS.map((k) => <option key={k}>{k}</option>)}</Select>
          <Textarea label="Alt text" rows={2} value={pending.alt} onChange={(e) => setPending({ ...pending, alt: e.target.value })} />
        </div>}
      </Modal>
    </>
  );
}
