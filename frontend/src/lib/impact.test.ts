import { execSync } from "child_process";
import { seedFacts } from "../data/facts";
import { seedSubmissions } from "../data/submissions";
import {
  findFactImpacts,
  formatImpactReport,
} from "./impact";
import {
  findChangedFacts,
  parseGitDiff,
} from "./gitImpact";

function getBaseFacts() {
  const baseFactsSource = execSync(
    "git show origin/main:frontend/src/data/facts.ts",
    { encoding: "utf-8" },
  );

  const match = baseFactsSource.match(
    /id: "F-1006", name: "Seats on Pro plan", value: "([^"]+)"/,
  );

  if (!match) {
    throw new Error("Could not find F-1006 in origin/main");
  }

  return seedFacts.map((fact) =>
    fact.id === "F-1006"
      ? {
          ...fact,
          value: match[1],
        }
      : fact,
  );
}

console.log("\n=== Parsed Git Diff ===\n");

const diff = execSync(
  "git diff origin/main...HEAD -- frontend/src/data/facts.ts config/billing.json",
  { encoding: "utf-8" },
);

const changedFiles = parseGitDiff(diff);

console.log(changedFiles);

console.log("\n=== Facts Detected From Git Diff ===\n");

const changedFacts = findChangedFacts(
  seedFacts,
  changedFiles,
);

for (const fact of changedFacts) {
  console.log(
    `${fact.factId} — ${fact.factName}`,
  );
  console.log(
    `${fact.file}:${fact.line}`,
  );
}

if (changedFacts.length === 0) {
  throw new Error("No changed facts detected");
}

console.log("\n=== Changed Facts ===\n");

for (const fact of changedFacts) {
  console.log(
    `${fact.factId} — ${fact.factName}`,
  );
  console.log(
    `${fact.file}:${fact.line}`,
  );
  console.log(fact.reason);
}

const baseFacts = getBaseFacts();

console.log("\n=== Base → Current Fact Values ===\n");

const currentF1006 = seedFacts.find(
  (fact) => fact.id === "F-1006",
);

const baseF1006 = baseFacts.find(
  (fact) => fact.id === "F-1006",
);

if (!baseF1006 || !currentF1006) {
  throw new Error("F-1006 was not found");
}

console.log(
  `F-1006 — ${baseF1006.value} → ${currentF1006.value}`,
);

const impacts = findFactImpacts(
  baseFacts,
  seedFacts,
  seedSubmissions,
);

console.log("\n");

console.log(formatImpactReport(impacts));

if (impacts.length === 0) {
  throw new Error("No impacts detected");
}

const impact = impacts.find(
  (item) => item.factId === "F-1006",
);

if (!impact) {
  throw new Error(
    "Expected F-1006 impact was not detected",
  );
}

const affectedSubmission =
  impact.affectedSubmissions.find(
    (submission) => submission.submissionId === "S-2035",
  );

if (!affectedSubmission) {
  throw new Error(
    "Expected S-2035 affected submission was not detected",
  );
}

console.log("\n=== CodeTruth Fact Impact Test ===\n");

console.log(
  `Fact: ${impact.factId} — ${impact.factName}`,
);

console.log(
  `${impact.oldValue} → ${impact.newValue}`,
);

console.log(
  `Affected submission: ${affectedSubmission.submissionId} — ${affectedSubmission.title}`,
);

console.log(
  `Claims: ${affectedSubmission.claims.join(", ")}`,
);

console.log("\n✅ Impact detection test passed");
