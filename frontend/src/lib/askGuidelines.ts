import type { Brand, Fact } from "@/data/types";

export type Evidence = { id: string; label: string; text: string; source: string; url: string };
export type Answer = { status: "answered" | "not_covered"; text: string; citations: Evidence[] };
const stop = new Set(["what","which","where","when","how","why","does","do","is","are","the","a","an","of","in","to","for","about","our","we","can","and","tell","me","please","allowed","guideline","guidelines","rule","rules","brand","product","should","replace","terms","term","limit","limits","much","many"]);
const tokens = (s: string) => new Set((s.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter(w => w.length > 1 && !stop.has(w)));
const notCovered: Answer = { status: "not_covered", text: "Not covered by approved guidelines or facts.", citations: [] };
export function evidenceFrom(brand: Brand, facts: Fact[]): Evidence[] {
  const out: Evidence[] = [];
  brand.guidelines.forEach(g => out.push({id:g.id,label:g.title,text:g.body,source:`Brand Guidelines / ${g.title} (${g.id})`,url:"/app/brand"}));
  brand.preferred.forEach(t => out.push({id:t.id,label:`Preferred term: ${t.avoid}`,text:`Use “${t.use}” instead of “${t.avoid}”.`,source:`Brand Guidelines / Preferred terms (${t.id})`,url:"/app/brand"}));
  brand.banned.forEach(b => out.push({id:b.id,label:`Banned: ${b.term}`,text:`Avoid “${b.term}”. Reason: ${b.reason}.`,source:`Brand Guidelines / Banned words (${b.id})`,url:"/app/brand"}));
  brand.a11y.filter(r=>r.enabled).forEach(r=>out.push({id:r.id,label:`Accessibility ${r.id}`,text:r.rule,source:`Brand Guidelines / Accessibility (${r.id})`,url:"/app/brand"}));
  out.push({id:"TONE",label:"Tone of voice",text:`Tone: ${brand.tone}. ${brand.toneNotes}`,source:"Brand Guidelines / Tone",url:"/app/brand"});
  facts.filter(f=>f.status === "approved").forEach(f=>out.push({id:f.id,label:f.name,text:`${f.name}: ${f.value}${f.unit ? ` ${f.unit}` : ""}.`,source:`${f.file}:${f.line} · ${f.id} · version ${f.version}`,url:"/app/facts"}));
  return out;
}
/** Deliberately cautious, extractive matching. It never generates unsupported claims. */
export function askGuidelines(question: string, brand: Brand, facts: Fact[]): Answer {
  const q = question.trim();
  if (!q || q.length > 500) return notCovered;
  const qt = tokens(q);
  if (!qt.size) return notCovered;
  const scored = evidenceFrom(brand, facts).map(e=>{
    const et = tokens(`${e.label} ${e.text}`);
    const overlap = [...qt].filter(t=>et.has(t)).length;
    const score = overlap / qt.size;
    return {e,score,overlap};
  }).filter(x=>x.overlap >= (qt.size === 1 ? 1 : 2) && x.score >= 0.65)
    .sort((a,b)=>b.score-a.score || b.overlap-a.overlap);
  if (!scored.length) return notCovered;
  const top = scored[0];
  // If multiple different sources are equally strong, refuse to guess which is relevant.
  if (scored.length > 1 && scored[1].score === top.score && scored[1].overlap === top.overlap && scored[1].e.text !== top.e.text) return notCovered;
  return {status:"answered",text:top.e.text,citations:[top.e]};
}
