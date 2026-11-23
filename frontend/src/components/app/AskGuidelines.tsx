"use client";
import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/States";
import { useBrand, useFacts } from "@/lib/data";
import { askGuidelines, type Answer } from "@/lib/askGuidelines";
export function AskGuidelines() {
  const [brand,,brandReady] = useBrand(); const [facts,,factsReady] = useFacts();
  const [question,setQuestion] = useState(""); const [answer,setAnswer] = useState<Answer|null>(null);
  if (!brandReady || !factsReady) return <Spinner />;
  return <>
    <PageHeader title="Ask the Guidelines" crumbs={[{label:"Ask the Guidelines"}]} description="Answers are taken directly from the approved guideline library and approved product facts. No source means no answer." />
    <Card><CardHeader title="Ask a question" description="Try: What is the supported file formats limit? or What terms should replace customers?" />
      <form className="space-y-4 p-5" onSubmit={e=>{e.preventDefault();setAnswer(askGuidelines(question,brand,facts));}}>
        <Textarea label="Your question" value={question} maxLength={500} rows={3} onChange={e=>{setQuestion(e.target.value);setAnswer(null);}} placeholder="Ask about approved product facts or brand rules" />
        <Button type="submit" disabled={!question.trim()}>Find an approved answer</Button>
      </form>
    </Card>
    {answer && <Card className="mt-4" aria-live="polite"><CardHeader title={answer.status === "answered" ? "Source-backed answer" : "Not covered"} />
      <div className="space-y-4 p-5"><p className="whitespace-pre-wrap text-sm text-ink-900">{answer.text}</p>
        {answer.citations.map(c=><div key={c.id} className="rounded-md border border-line bg-surface-muted p-3 text-sm">
          <p className="font-semibold">Citation: {c.source}</p><p className="mt-1 text-ink-700">Exact approved text: “{c.text}”</p>
          <Link href={c.url} className="mt-2 inline-block font-medium text-brand-700 underline">View source in CodeTruth</Link>
        </div>)}
      </div></Card>}
    <p className="mt-4 text-xs text-ink-500">Deterministic cited lookup, not generative AI. Unclear questions may return “Not covered” to avoid invented answers. Data in this preview is stored in your browser.</p>
  </>;
}
