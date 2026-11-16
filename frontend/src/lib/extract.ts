import type { Fact, SourceFile } from "@/data/types";

/**
 * Basic line-based extraction for uploaded JSON / YAML. It finds scalar numbers, booleans and
 * { "enabled": bool } flags and records the exact line number. This is a preview extractor:
 * it does not resolve nested structure, anchors or OpenAPI references.
 */
const UNIT_BY_SUFFIX: [RegExp, string][] = [
  [/_mb$|megabytes?$/i, "MB"], [/_days?$/i, "days"], [/credits?$/i, "credits"], [/seats?$/i, "seats"],
  [/per_minute$|requests_per_min/i, "requests/min"], [/formats?$/i, "formats"], [/_pct$|percent$/i, "%"],
];
const SCALAR = /^\s*"?([A-Za-z][\w.-]*)"?\s*:\s*(-?\d+(?:\.\d+)?|true|false)\s*,?\s*(?:#.*)?$/;
const FLAG = /"?([A-Za-z][\w.-]*)"?\s*:\s*\{\s*"?enabled"?\s*:\s*(true|false)/;

const human = (k: string) => k.replace(/[_.-]+/g, " ").replace(/\b\w/, (c) => c.toUpperCase());

export function sourceFileType(name: string): string {
  const n = name.toLowerCase();
  if (n === "package.json") return "Package manifest";
  if (/feature[-_]?flags/.test(n)) return "Feature flags";
  if (/openapi|swagger/.test(n)) return "OpenAPI specification";
  if (/changelog/.test(n)) return "Changelog";
  if (n.endsWith(".json")) return "JSON configuration";
  if (/\.ya?ml$/.test(n)) return "YAML configuration";
  return "Document";
}

export function extractFacts(fileName: string, text: string, version: string, _existingCount = 0): Omit<Fact, "id">[] {
  const lines = text.split(/\r?\n/);
  const out: Omit<Fact, "id">[] = [];
  const today = new Date().toISOString().slice(0, 10);
  lines.forEach((ln, i) => {
    let name: string | null = null, value = "", unit = "", category = "Default";
    const flag = FLAG.exec(ln);
    if (flag) { name = human(flag[1]); value = flag[2] === "true" ? "enabled" : "disabled"; category = "Feature flag"; }
    else {
      const m = SCALAR.exec(ln);
      if (!m) return;
      const key = m[1];
      if (m[2] === "true" || m[2] === "false") { name = human(key); value = m[2] === "true" ? "enabled" : "disabled"; category = "Feature flag"; }
      else { name = human(key); value = m[2]; unit = UNIT_BY_SUFFIX.find(([re]) => re.test(key))?.[1] ?? ""; category = unit ? "Limit" : "Default"; }
    }
    if (!name) return;
    const from = Math.max(0, i - 2), to = Math.min(lines.length, i + 3);
    out.push({ name, value, unit, category, file: fileName, line: i + 1, version, updated: today, status: "candidate",
      snippetStart: from + 1, snippet: lines.slice(from, to), history: [] });
  });
  return out.slice(0, 60);
}

export function fileEntry(name: string): SourceFile {
  return { path: name, type: sourceFileType(name), changed: new Date().toISOString().slice(0, 10), state: "new" };
}
