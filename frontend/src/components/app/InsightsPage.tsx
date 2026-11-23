"use client";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/app/PageHeader";
import { SampleDataTag } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { FilterSelect } from "@/components/ui/Field";
import { Tabs } from "@/components/ui/Tabs";
import { accuracyData, factChangeData, overrideData, ruleViolations, trendData } from "@/data/misc";
import { useReviewVotes, useSubmissions } from "@/lib/data";
import { calculateRuleInsights } from "@/lib/reviewerInsights";
import Link from "next/link";

type Tab = "accuracy" | "workflow" | "changes";
const axis = { tickLine: false, axisLine: false, fontSize: 12, stroke: "#69778f" } as const;

function Tile({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (<div className="rounded-lg border border-line bg-white p-4 shadow-card"><p className="flex items-center gap-2 text-[13px] font-medium text-ink-500">{label}<SampleDataTag /></p>
    <p className="mt-1.5 text-3xl font-semibold tabular-nums tracking-tight text-ink-950">{value}</p><p className="mt-1 text-xs text-ink-500">{hint}</p></div>);
}

export function InsightsPage() {
  const [tab, setTab] = useState<Tab>("accuracy");
  const [range, setRange] = useState("6");
  const [subs] = useSubmissions();
  const [votes] = useReviewVotes();
  const clarity = useMemo(()=>calculateRuleInsights(votes),[votes]);
  const n = Number(range);
  const last = accuracyData.slice(-n);
  const avg = (k: "precision" | "recall" | "falsePositive") => (last.reduce((a, r) => a + r[k], 0) / last.length).toFixed(1);

  // Real, derived from this browser's records: findings whose suggestion a person rejected
  const live = useMemo(() => {
    const all = subs.flatMap((s) => s.findings).filter((f) => f.category !== "Verified claim");
    return { total: all.length, rejected: all.filter((f) => f.decision === "rejected").length, accepted: all.filter((f) => f.decision === "accepted" || f.decision === "edited").length };
  }, [subs]);

  return (
    <>
      <PageHeader title="Insights" crumbs={[{ label: "Insights" }]} sample
        description="Charts use illustrative sample data until a labelled evaluation set is available. The panel at the top is calculated from your records."
        actions={<FilterSelect label="Date range" value={range} onChange={setRange} options={[{ value: "3", label: "Last 3 months" }, { value: "6", label: "Last 6 months" }]} />} />

      <Card className="mb-4">
        <CardHeader title="Calculated from this workspace" description="Live counts from findings in this browser" />
        <dl className="grid grid-cols-3 divide-x divide-line">
          {[["Non-verified findings", live.total], ["Suggestions accepted or edited", live.accepted], ["Suggestions rejected (not overrides)", live.rejected]].map(([k, v]) => (
            <div key={k as string} className="p-4"><dt className="text-xs text-ink-500">{k}</dt><dd className="mt-1 text-2xl font-semibold tabular-nums text-ink-950">{v}</dd></div>))}
        </dl>
      </Card>

      <Card className="mb-4">
        <CardHeader title="Guideline clarity — real reviewer decisions" description="Override rate = reviewer overrides / (rule upheld + rule overridden). Browser-local recorded decisions; no demo statistics in this table." />
        {clarity.length === 0 ? <p className="p-5 text-sm text-ink-600">No reviewer decisions yet. Open a content review as a Reviewer or Admin and choose “Rule valid” or “Override rule” on a finding.</p> :
          <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-surface-muted"><tr><th className="p-3">Rule</th><th className="p-3">Reviewed</th><th className="p-3">Overrides</th><th className="p-3">Override rate</th><th className="p-3">Examples / clarification</th></tr></thead><tbody>
            {clarity.map(r=><tr key={r.ruleId} className="border-t border-line align-top"><td className="p-3 font-medium">{r.ruleName}</td><td className="p-3">{r.total}</td><td className="p-3">{r.overridden}</td><td className="p-3">{Math.round(r.rate*100)}% {r.total < 3 && <span className="block text-xs text-ink-500">Low sample</span>}</td><td className="p-3">{r.examples.length ? <><p className="mb-2 text-xs">Suggested next step: review this rule's wording with the brand owner; these reviewer explanations may indicate ambiguity.</p>{r.examples.map(e=><div key={e.id} className="mb-2"><Link className="text-brand-700 underline" href={`/app/reviews/${encodeURIComponent(e.submissionId)}`}>Finding {e.findingId}</Link><span className="text-xs text-ink-500"> — {e.reason}</span></div>)}</> : <span className="text-ink-500">No overrides</span>}</td></tr>)}
          </tbody></table></div>}
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Tile label="Claim matching precision" value={`${avg("precision")}%`} hint="Share of flags that were correct" />
        <Tile label="Recall" value={`${avg("recall")}%`} hint="Share of real issues that were caught" />
        <Tile label="False-positive rate" value={`${avg("falsePositive")}%`} hint="Flags a reviewer rejected" />
      </div>

      <Card className="mt-4">
        <div className="px-4 pt-1"><Tabs<Tab> label="Insight views" value={tab} onChange={setTab} tabs={[{ value: "accuracy", label: "Accuracy" }, { value: "workflow", label: "Workflow" }, { value: "changes", label: "Product changes" }]} /></div>
        <div className="p-4">
          {tab === "accuracy" && (<div className="h-80" role="img" aria-label="Line chart of precision, recall and false positive rate by month"><ResponsiveContainer width="100%" height="100%">
            <LineChart data={last} margin={{ left: -16, right: 12, top: 8 }}><CartesianGrid stroke="#e3e8ef" vertical={false} /><XAxis dataKey="month" {...axis} /><YAxis unit="%" {...axis} /><Tooltip /><Legend iconType="plainline" wrapperStyle={{ fontSize: 12 }} />
              <Line dataKey="precision" name="Precision" stroke="#1f5bd0" strokeWidth={2} dot={false} /><Line dataKey="recall" name="Recall" stroke="#15803d" strokeWidth={2} dot={false} /><Line dataKey="falsePositive" name="False-positive rate" stroke="#c0262d" strokeWidth={2} strokeDasharray="5 3" dot={false} /></LineChart></ResponsiveContainer></div>)}
          {tab === "workflow" && (<div className="grid gap-6 lg:grid-cols-2">
            <div><p className="mb-2 text-sm font-semibold text-ink-950">Content approval trends</p><div className="h-64" role="img" aria-label="Stacked bar chart of submitted and approved content by month"><ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData.slice(-n)} margin={{ left: -16, right: 8 }}><CartesianGrid stroke="#e3e8ef" vertical={false} /><XAxis dataKey="month" {...axis} /><YAxis {...axis} /><Tooltip cursor={{ fill: "#f6f8fb" }} /><Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="approved" name="Approved" fill="#15803d" radius={[3, 3, 0, 0]} /><Bar dataKey="submitted" name="Submitted" fill="#2f6fe4" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
            <div><p className="mb-2 text-sm font-semibold text-ink-950">Historical overrides (illustrative)</p><div className="h-64" role="img" aria-label="Bar chart of reviewer overrides by month"><ResponsiveContainer width="100%" height="100%">
              <BarChart data={overrideData.slice(-n)} margin={{ left: -16, right: 8 }}><CartesianGrid stroke="#e3e8ef" vertical={false} /><XAxis dataKey="month" {...axis} /><YAxis allowDecimals={false} {...axis} /><Tooltip cursor={{ fill: "#f6f8fb" }} />
                <Bar dataKey="overrides" name="Overrides" fill="#b45309" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
            <div className="lg:col-span-2"><p className="mb-2 text-sm font-semibold text-ink-950">Frequently violated rules</p><div className="h-56" role="img" aria-label="Horizontal bar chart of frequently violated rules"><ResponsiveContainer width="100%" height="100%">
              <BarChart data={ruleViolations} layout="vertical" margin={{ left: 0, right: 12 }}><CartesianGrid stroke="#e3e8ef" horizontal={false} /><XAxis type="number" {...axis} /><YAxis type="category" dataKey="rule" width={150} {...axis} stroke="#334262" /><Tooltip cursor={{ fill: "#f6f8fb" }} />
                <Bar dataKey="count" name="Violations" fill="#2f6fe4" radius={[0, 3, 3, 0]} /></BarChart></ResponsiveContainer></div></div></div>)}
          {tab === "changes" && (<div className="h-80" role="img" aria-label="Stacked bar chart of modified, added and removed product facts by month"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={factChangeData.slice(-n)} margin={{ left: -16, right: 12 }}><CartesianGrid stroke="#e3e8ef" vertical={false} /><XAxis dataKey="month" {...axis} /><YAxis allowDecimals={false} {...axis} /><Tooltip cursor={{ fill: "#f6f8fb" }} /><Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="modified" stackId="a" name="Modified" fill="#b45309" /><Bar dataKey="added" stackId="a" name="Added" fill="#2f6fe4" /><Bar dataKey="removed" stackId="a" name="Removed" fill="#c0262d" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></div>)}
        </div>
      </Card>

      <Card className="mt-4"><CardHeader title="Evaluation dataset" description="Precision and recall become real once claims are labelled" />
        <p className="p-5 text-sm text-ink-600">No labelled evaluation cases exist yet. When the backend is connected you will be able to label claims as correct or incorrect and these metrics will replace the sample values above.</p></Card>
    </>
  );
}
