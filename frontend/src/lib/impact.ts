import type { Fact, Submission } from "../data/types";

export type FactImpact = {
  factId: string;
  factName: string;
  oldValue: string;
  newValue: string;
  affectedSubmissions: {
    submissionId: string;
    title: string;
    status: Submission["status"];
    findingIds: string[];
    claims: string[];
    severity: string[];
    reason: string;
  }[];
};

export function findFactImpacts(
  oldFacts: Fact[],
  newFacts: Fact[],
  submissions: Submission[],
): FactImpact[] {
  const impacts: FactImpact[] = [];

  for (const newFact of newFacts) {
    const oldFact = oldFacts.find((fact) => fact.id === newFact.id);

    if (!oldFact || oldFact.value === newFact.value) {
      continue;
    }

    const affectedSubmissions = submissions
      .map((submission) => {
        const affectedFindings = submission.findings.filter(
          (finding) => finding.factId === newFact.id,
        );

        if (affectedFindings.length === 0) {
          return null;
        }

        return {
          submissionId: submission.id,
          title: submission.title,
          status: submission.status,
          findingIds: affectedFindings.map((finding) => finding.id),
          claims: affectedFindings.map((finding) => finding.claim),
          severity: affectedFindings.map((finding) => finding.severity),
          reason:
            `Fact "${newFact.name}" changed from ` +
            `"${oldFact.value}${oldFact.unit ? ` ${oldFact.unit}` : ""}" ` +
            `to "${newFact.value}${newFact.unit ? ` ${newFact.unit}` : ""}". ` +
            `This submission references the changed fact and should be re-verified.`,
        };
      })
      .filter(
        (
          submission,
        ): submission is NonNullable<typeof submission> =>
          submission !== null,
      );

    if (affectedSubmissions.length > 0) {
      impacts.push({
        factId: newFact.id,
        factName: newFact.name,
        oldValue: `${oldFact.value}${oldFact.unit ? ` ${oldFact.unit}` : ""}`,
        newValue: `${newFact.value}${newFact.unit ? ` ${newFact.unit}` : ""}`,
        affectedSubmissions,
      });
    }
  }

  return impacts;
}
export function formatImpactReport(impacts: FactImpact[]): string {
  if (impacts.length === 0) {
    return [
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "CODETRUTH IMPACT REPORT",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "✓ No affected submissions detected.",
    ].join("\n");
  }

  const lines: string[] = [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "CODETRUTH IMPACT REPORT",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    `⚠️ ${impacts.length} fact change${
      impacts.length === 1 ? "" : "s"
    } detected`,
    "",
  ];

  for (const impact of impacts) {
    lines.push(
      `${impact.factId} — ${impact.factName}`,
      `${impact.oldValue} → ${impact.newValue}`,
      "",
      `Affected content: ${impact.affectedSubmissions.length}`,
      "",
    );

    for (const submission of impact.affectedSubmissions) {
      lines.push(
        `${submission.submissionId} — ${submission.title}`,
        `Status: ${submission.status}`,
        `Claim: "${submission.claims.join('", "')}"`,
        "",
        `Reason: ${submission.reason}`,
        "",
        "Action: Re-verify this submission.",
        "",
      );
    }
  }

  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  return lines.join("\n");
}
