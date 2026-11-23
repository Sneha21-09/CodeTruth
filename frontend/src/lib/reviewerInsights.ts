export type ReviewVote = { id: string; submissionId: string; findingId: string; ruleId: string; ruleName: string; verdict: "upheld" | "overridden"; reason: string; who: string; when: string };
export type RuleInsight = {ruleId: string; ruleName: string; total: number; overridden: number; rate: number; examples: ReviewVote[]};
export function calculateRuleInsights(votes: ReviewVote[]): RuleInsight[] {
  const latest = new Map<string, ReviewVote>();
  for (const v of votes) {
    if (!v.ruleId || !v.findingId || !["upheld","overridden"].includes(v.verdict)) continue;
    const key = `${v.submissionId}:${v.findingId}`;
    if (!latest.has(key) || latest.get(key)!.when < v.when) latest.set(key, v);
  }
  const groups = new Map<string, ReviewVote[]>();
  for (const v of latest.values()) groups.set(v.ruleId,[...(groups.get(v.ruleId) ?? []),v]);
  return [...groups.entries()].map(([ruleId,items]) => {
    const overridden = items.filter(v=>v.verdict === "overridden");
    return {ruleId, ruleName:items[0].ruleName, total:items.length, overridden:overridden.length,rate:overridden.length/items.length,examples:overridden};
  }).sort((a,b)=>b.rate-a.rate || b.total-a.total);
}
