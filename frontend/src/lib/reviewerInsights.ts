export type ReviewVote = { id: string; submissionId: string; findingId: string; ruleId: string; ruleName: string; verdict: "upheld" | "overridden"; reason: string; who: string; when: string };
export type RuleInsight = {ruleId: string; ruleName: string; total: number; overridden: number; rate: number; examples: ReviewVote[]};
/** A finding receives one current reviewer verdict, even if the button is clicked twice. */
export function calculateRuleInsights(votes: ReviewVote[]): RuleInsight[] {
  const latest = new Map<string, ReviewVote>();
  for (const v of votes) {
    if (!v.ruleId || !v.findingId || !v.submissionId || !["upheld", "overridden"].includes(v.verdict)) continue;
    const key = JSON.stringify([v.submissionId, v.findingId]);
    const previous = latest.get(key);
    // When two records have the same timestamp, the later input wins.
    if (!previous || previous.when <= v.when) latest.set(key, v);
  }
  const groups = new Map<string, ReviewVote[]>();
  for (const v of latest.values()) {
    const existing = groups.get(v.ruleId) ?? [];
    existing.push(v);
    groups.set(v.ruleId, existing);
  }
  return [...groups.entries()].map(([ruleId,items]) => {
    const overridden = items.filter(v=>v.verdict === "overridden");
    return {ruleId, ruleName:items[0].ruleName, total:items.length, overridden:overridden.length, rate:overridden.length/items.length, examples:overridden};
  }).sort((a,b)=>b.rate-a.rate || b.total-a.total || a.ruleId.localeCompare(b.ruleId));
}
