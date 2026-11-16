"use client";
import { AlertTriangle, ArrowUpRight, Clock, FileCheck2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, StatTile } from "@/components/app/PageHeader";
import { Badge, SampleDataTag } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { FilterSelect } from "@/components/ui/Field";
import { ruleViolations, trendData } from "@/data/misc";
import { useActivity, useFacts, useSourceChanges, useStamps, useSubmissions } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export function Overview() {
  const [subs] = useSubmissions();
  const [facts] = useFacts();
  const [stamps] = useStamps();
  const [activity] = useActivity();
  const [changes] = useSourceChanges();
  const [range, setRange] = useState("6");

  const stats = useMemo(() => {
    const open = subs.flatMap((s) => (s.status === "draft" || s.status === "approved" ? [] : s.findings)).filter((f) => f.decision === "open" || f.decision === "rejected");
    return {
      total: subs.length,
      pending: subs.filter((s) => s.status === "pending").length,
      approved: subs.filter((s) => s.status === "approved").length,
      critical: open.filter((f) => f.severity === "critical").length,
      outdated: subs.flatMap((s) => s.findings).filter((f) => f.category === "Outdated claim" && f.decision === "open").length,
      stale: stamps.filter((s) => s.status === "stale").length,
      candidates: facts.filter((f) => f.status === "candidate").length,
      approvedFacts: facts.filter((f) => f.status === "approved").length,
    };
  }, [subs, facts, stamps]);

  const trend = trendData.slice(-Number(range));

  return (
    <>
      <PageHeader title="Overview" crumbs={[{ label: "Overview" }]}
        description="Counts below are calculated from the records in this browser. Charts marked sample data are illustrative."
        actions={<FilterSelect label="Date range" value={range} onChange={setRange} options={[{ value: "3", label: "Last 3 months" }, { value: "6", label: "Last 6 months" }]} />} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Total submissions" value={stats.total} href="/app/reviews" />
        <StatTile label="Pending reviews" value={stats.pending} href="/app/reviews?status=pending" tone={stats.pending ? "warn" : undefined} />
        <StatTile label="Approved content" value={stats.approved} href="/app/reviews?status=approved" tone="ok" />
        <StatTile label="Critical mismatches" value={stats.critical} hint={`${stats.outdated} outdated claim${stats.outdated === 1 ? "" : "s"}`} href="/app/reviews?status=pending" tone={stats.critical ? "bad" : undefined} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Approved facts" value={stats.approvedFacts} href="/app/facts" />
        <StatTile label="Candidate facts to review" value={stats.candidates} href="/app/facts?status=candidate" tone={stats.candidates ? "warn" : undefined} />
        <StatTile label="Stale verifications" value={stats.stale} href="/app/history" tone={stats.stale ? "bad" : undefined} />
        <div className="rounded-lg border border-line bg-white p-4 shadow-card">
          <p className="flex items-center gap-2 text-[13px] font-medium text-ink-500">Verification accuracy <SampleDataTag /></p>
          <p className="mt-1.5 text-3xl font-semibold tabular-nums tracking-tight text-ink-950">94.2%</p>
          <p className="mt-1 text-xs text-ink-500">Needs a labelled evaluation set to be real.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Verification trends" description="Submissions, mismatches and approvals per month" action={<SampleDataTag />} />
          <div className="h-72 p-4" role="img" aria-label="Line chart of monthly submissions, mismatches and approvals">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="#e3e8ef" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="#69778f" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#69778f" />
                <Tooltip />
                <Legend iconType="plainline" wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="submitted" name="Submitted" stroke="#1f5bd0" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="approved" name="Approved" stroke="#15803d" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="mismatches" name="Mismatches" stroke="#c0262d" strokeWidth={2} strokeDasharray="5 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Frequently violated rules" action={<SampleDataTag />} />
          <div className="h-72 p-4" role="img" aria-label="Bar chart of the most frequently violated brand rules">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ruleViolations} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#e3e8ef" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} stroke="#69778f" />
                <YAxis type="category" dataKey="rule" width={130} tickLine={false} axisLine={false} fontSize={12} stroke="#334262" />
                <Tooltip cursor={{ fill: "#f6f8fb" }} />
                <Bar dataKey="count" name="Violations" fill="#2f6fe4" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Recent activity" />
          <ul className="divide-y divide-line">
            {activity.slice(0, 6).map((a) => (
              <li key={a.id} className="flex items-start gap-3 px-5 py-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
                <p className="flex-1 text-sm text-ink-800"><span className="font-medium">{a.who}</span> {a.what}</p>
                <time dateTime={a.when} className="shrink-0 text-xs text-ink-500">{formatDate(a.when, true)}</time>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Recent product fact changes" action={<Link href="/app/sources" className="inline-flex items-center gap-1 text-[13px] font-medium text-brand-700 hover:underline">All changes <ArrowUpRight className="h-3.5 w-3.5" /></Link>} />
          <ul className="divide-y divide-line">
            {changes.slice(0, 4).map((c) => (
              <li key={c.id} className="px-5 py-3">
                <p className="text-sm text-ink-800">{c.summary}</p>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-500">
                  <span className="font-mono">{c.file}</span><Badge>{c.ref}</Badge><span>{formatDate(c.date)}</span>
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {stats.stale > 0 && (
        <Link href="/app/history" className="mt-4 flex items-center gap-3 rounded-lg border border-amber-200 bg-warn-50 p-4 text-sm text-warn-700">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span><strong>{stats.stale} verification{stats.stale === 1 ? " is" : "s are"} stale</strong> because product facts changed. Review affected content.</span>
          <FileCheck2 className="ml-auto h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </>
  );
}
