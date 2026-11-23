#!/usr/bin/env node
/** Real PR diff for versioned JSON product configurations, Node.js 20+.
 * Run from any cwd with --base SHA --head SHA [--repo path] [--output file].
 * No external network, AI, GitHub API or secrets are used in this detection step.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const defaultRepo = resolve(scriptDir, '../../');
function argument(args, key, fallback) {
  const index = args.indexOf(`--${key}`);
  return index < 0 ? fallback : args[index + 1];
}
function git(repo, ...args) {
  return execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }).trimEnd();
}
function flatten(obj, prefix = '', out = {}) {
  if (obj !== null && typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      flatten(value, Array.isArray(obj) ? `${prefix}[${key}]` : prefix ? `${prefix}.${key}` : key, out);
    }
  } else if (prefix) out[prefix] = obj;
  return out;
}
function fileAt(repo, revision, path) {
  try { return JSON.parse(git(repo, 'show', `${revision}:${path}`)); }
  catch (error) {
    if (error?.status === 128) return {};
    throw new Error(`Cannot parse ${revision}:${path} as JSON: ${error.message}`);
  }
}
function formatValue(value) { return value === undefined ? '(missing)' : JSON.stringify(value); }
function escaped(text) { return String(text).replaceAll('`', '\\`').replaceAll('|', '\\|').replaceAll('\n', ' '); }
export function detectImpact({repo = defaultRepo, base, head, trackedPaths = ['product-config/plans.json'], dependencies = {}}) {
  if (!/^[0-9a-f]{7,40}$/i.test(base || '') || !/^[0-9a-f]{7,40}$/i.test(head || '')) throw new Error('Base and head must be Git commit hashes');
  const changedPaths = new Set(git(repo, 'diff', '--name-only', base, head, '--', ...trackedPaths).split('\n').filter(Boolean));
  const changes = [];
  for (const path of trackedPaths) {
    if (!changedPaths.has(path)) continue;
    const oldFacts = flatten(fileAt(repo, base, path));
    const newFacts = flatten(fileAt(repo, head, path));
    for (const key of [...new Set([...Object.keys(oldFacts), ...Object.keys(newFacts)])].sort()) {
      if (JSON.stringify(oldFacts[key]) === JSON.stringify(newFacts[key])) continue;
      const factId = `${path}:${key}`;
      const affected = Array.isArray(dependencies[factId]) ? dependencies[factId] : [];
      changes.push({path, key, factId, oldValue:oldFacts[key], newValue:newFacts[key], affected});
    }
  }
  return changes;
}
export function formatReport(changes) {
  const lines = ['## CodeTruth Impact Report — Git commit comparison', '', '> Compares actual tracked JSON configuration changes between the PR base and head commits. Dependencies below are from a committed demo map, **not a live approval database**.', ''];
  if (!changes.length) lines.push('No changes detected in the configured JSON product facts.', '');
  else {
    lines.push('| Source file and fact key | Old value | New value | Affected content (recorded) |', '|---|---|---|---|');
    for (const c of changes) lines.push(`| \`${escaped(c.path)}\` / \`${escaped(c.key)}\` | \`${escaped(formatValue(c.oldValue))}\` | \`${escaped(formatValue(c.newValue))}\` | ${c.affected.length ? c.affected.map(x => `\`${escaped(x)}\``).join(', ') : 'None mapped'} |`);
    lines.push('', 'Affected content shown above is only what appears in the repository dependency map. **No mapping does not prove no impact**.', '');
  }
  lines.push('Scope: structured JSON only. Source is identified by filename and JSON key; exact line references require a parser with locations. No real content re-review is performed by this demo checker.');
  return lines.join('\n') + '\n';
}
export function run(argv = process.argv.slice(2)) {
  const repo = resolve(argument(argv, 'repo', defaultRepo));
  const base = argument(argv, 'base'); const head = argument(argv, 'head');
  const output = resolve(argument(argv, 'output', resolve(repo, 'codetruth-report.txt')));
  const mapPath = resolve(repo, 'product-config/demo-dependencies.json');
  const dependencies = existsSync(mapPath) ? JSON.parse(readFileSync(mapPath, 'utf8')) : {};
  const changes = detectImpact({repo, base, head, dependencies});
  const report = formatReport(changes);
  writeFileSync(output, report, 'utf8');
  process.stdout.write(`Detected ${changes.length} changed JSON fact(s); report saved to ${output}\n`);
  return changes;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run();
