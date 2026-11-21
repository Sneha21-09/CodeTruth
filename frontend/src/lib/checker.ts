import type { Brand, Fact, Finding } from "@/data/types";

/**
 * Local deterministic rule check. Runs entirely in the browser against APPROVED facts and the brand rules.
 * No AI is involved. Principle: no source, no flag. Every factual finding carries a fact ID.
 */

const WORD_NUMBERS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  fifteen: 15, twenty: 20, thirty: 30, forty: 40, fifty: 50, hundred: 100,
};
const NUM = `(\\d[\\d,]*(?:\\.\\d+)?|${Object.keys(WORD_NUMBERS).join("|")})`;

const UNIT_PATTERNS: Record<string, string> = {
  formats: "formats?", MB: "(?:mb|megabytes?)", credits: "credits?", seats: "seats?", days: "days?",
  "requests/min": "requests?\\s*(?:per\\s*minute|/\\s*min|a\\s*minute)",
};
// Units distinctive enough to match without a topic keyword. "days" is ambiguous (trial vs retention).
const DISTINCTIVE = new Set(["formats", "MB", "credits", "seats", "requests/min"]);
const GENERIC = new Set(["supported", "maximum", "default", "free", "product", "plan", "size", "hosting", "uptime", "commitment", "length", "upload", "data"]);

export function toNumber(raw: string): number | null {
  const w = WORD_NUMBERS[raw.toLowerCase()];
  if (w !== undefined) return w;
  const n = Number(raw.replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function keywords(fact: Fact): string[] {
  return fact.name.toLowerCase().split(/\W+/).filter((w) => w.length > 3 && !GENERIC.has(w));
}

function escapeRe(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
let seq = 0;
const fid = () => `FD-L${Date.now().toString(36)}${seq++}`;

export function applySuggestions(text: string, findings: Finding[]): string {
  let out = text;
  for (const f of findings) {
    const rep = f.decision === "edited" ? f.editedText : f.decision === "accepted" ? f.suggestion : undefined;
    if (rep && rep !== "same" && out.includes(f.claim)) out = out.replace(f.claim, rep);
  }
  return out;
}

export function runChecks(text: string, facts: Fact[], brand: Brand): Finding[] {
  const findings: Finding[] = [];
  const approved = facts.filter((f) => f.status === "approved");

  // 1. Number + unit claims against approved numeric facts
  for (const fact of approved) {
    const numeric = Number(fact.value);
    const unitRe = UNIT_PATTERNS[fact.unit];
    if (!unitRe || !Number.isFinite(numeric)) continue;
    const kws = keywords(fact);
    for (const sentence of text.split(/(?<=[.!?])\s+/)) {
      const lower = sentence.toLowerCase();
      if (!DISTINCTIVE.has(fact.unit) && !kws.some((k) => lower.includes(k))) continue;
      const re = new RegExp(`\\b${NUM}\\b\\s*(?:[a-z-]+\\s+){0,2}?${unitRe}`, "gi");
      let m: RegExpExecArray | null;
      while ((m = re.exec(sentence))) {
        const claimed = toNumber(m[1]);
        if (claimed === null) continue;
        if (claimed === numeric) {
          findings.push({ id: fid(), claim: m[0], category: "Verified claim", severity: "minor",
            explanation: "Claim matches the approved product fact.", expected: `${claimed} ${fact.unit}`, actual: `${fact.value} ${fact.unit}`,
            factId: fact.id, file: fact.file, line: fact.line, method: "Rule", suggestion: "same", decision: "accepted" });
        } else {
          const replaced = m[0].replace(m[1], String(fact.value));
          findings.push({ id: fid(), claim: m[0], category: "Factual mismatch", severity: Math.abs(claimed - numeric) / numeric >= 0.2 ? "critical" : "major",
            explanation: `The content states ${claimed} but the approved fact "${fact.name}" is ${fact.value} ${fact.unit}.`,
            expected: `${claimed} ${fact.unit}`, actual: `${fact.value} ${fact.unit}`, factId: fact.id, file: fact.file, line: fact.line,
            method: "Rule", suggestion: replaced, decision: "open" });
        }
      }
    }
  }

  // 2. Premature announcements: disabled feature flags named in the copy
  for (const fact of approved.filter((f) => f.category === "Feature flag" && f.value === "disabled")) {
    const phrase = fact.name.toLowerCase().replace(/\bv\d+\b/g, "").trim();
    const re = new RegExp(`${escapeRe(phrase).replace(/\s+/g, "\\s+")}(?:\\s+v\\d+)?[^.!?]*`, "i");
    const m = re.exec(text);
    if (m) {
      const claim = m[0].replace(/[,;]\s.*$/, "").trim();
      findings.push({ id: fid(), claim, category: "Premature announcement", severity: "critical",
        explanation: `The ${fact.name} flag is disabled in the product configuration, so the feature is not available to customers.`,
        expected: "Available now", actual: "Disabled", factId: fact.id, file: fact.file, line: fact.line, method: "Rule",
        suggestion: `${fact.name} is coming in an upcoming release`, decision: "open" });
    }
  }

  // 3. Absolute claims: only when an approved limit contradicts them
  for (const fact of approved) {
    const unitRe = UNIT_PATTERNS[fact.unit];
    if (!unitRe || !DISTINCTIVE.has(fact.unit)) continue;
    const m = new RegExp(`\\bunlimited\\s+(?:[a-z-]+\\s+)?${unitRe}`, "i").exec(text);
    if (m) {
      findings.push({ id: fid(), claim: m[0], category: "Absolute claim", severity: "major",
        explanation: `"Unlimited" conflicts with the approved limit for ${fact.name}.`, expected: "Unlimited", actual: `${fact.value} ${fact.unit}`,
        factId: fact.id, file: fact.file, line: fact.line, method: "Rule", suggestion: `${fact.value} ${fact.unit}`, decision: "open" });
    }
  }

  // 4. Banned and preferred terminology (brand rules, no fact needed)
  brand.banned.forEach((b, i) => {
    const m = new RegExp(`\\b${escapeRe(b.term)}\\b`, "i").exec(text);
    if (m) findings.push({ id: fid(), claim: m[0], category: "Banned terminology", severity: "major", explanation: `"${b.term}" is banned: ${b.reason}.`,
      expected: "Term not used", actual: m[0], factId: null, file: `Brand rule BAN-${i + 1}`, line: null, method: "Rule", suggestion: "", decision: "open" });
  });
  brand.preferred.forEach((p, i) => {
    const m = new RegExp(`\\b${escapeRe(p.avoid)}\\b`, "i").exec(text);
    if (m) findings.push({ id: fid(), claim: m[0], category: "Preferred terminology", severity: "minor", explanation: `Brand guidelines prefer "${p.use}" over "${p.avoid}".`,
      expected: p.use, actual: m[0], factId: null, file: `Brand rule PREF-${i + 1}`, line: null, method: "Rule", suggestion: p.use, decision: "open" });
  });

  return findings;
}

/** Keep earlier human decisions when a claim is re-checked. */
export function mergeDecisions(prev: Finding[], next: Finding[]): Finding[] {
  return next.map((n) => {
    const old = prev.find((p) => p.claim === n.claim && p.category === n.category);
    return old && n.decision === "open" ? { ...n, decision: old.decision, editedText: old.editedText } : n;
  });
}
