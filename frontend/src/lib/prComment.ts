import { formatImpactReport, type FactImpact } from "./impact";

export function buildPrComment(impacts: FactImpact[]): string {
  const report = formatImpactReport(impacts);

  return [
    "## 🔍 CodeTruth Impact Report",
    "",
    "```text",
    report,
    "```",
    "",
    "> This report was generated automatically by CodeTruth.",
  ].join("\n");
}
