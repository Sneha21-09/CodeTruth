import { seedFacts } from "../data/facts";
import { seedSubmissions } from "../data/submissions";
import {
  findFactImpacts,
  formatImpactReport,
} from "./impact";
import { findChangedFacts, parseGitDiff } from "./gitImpact";
const sampleDiff = `
diff --git a/config/billing.json b/config/billing.json
--- a/config/billing.json
+++ b/config/billing.json
@@ -42,3 +42,3 @@
     "pro": {
-      "seats": 25,
+      "seats": 30,
       "price_usd_month": 49
`;

const parsedChangedFiles = parseGitDiff(sampleDiff);

console.log("\n=== Parsed Git Diff ===\n");

console.log(parsedChangedFiles);

const gitDetectedFacts = findChangedFacts(
  seedFacts,
  parsedChangedFiles,
);

console.log("\n=== Facts Detected From Git Diff ===\n");

for (const change of gitDetectedFacts) {
  console.log(
    `${change.factId} — ${change.factName}`,
  );
  console.log(
    `${change.file}:${change.line}`,
  );
}
const changedFiles = [
  {
    file: "config/billing.json",
    lines: [42, 43, 44],
  },
];

const detectedChanges = findChangedFacts(
  seedFacts,
  changedFiles,
);

console.log("\n=== Changed Facts ===\n");

for (const change of detectedChanges) {
  console.log(
    `${change.factId} — ${change.factName}`,
  );

  console.log(
    `${change.file}:${change.line}`,
  );

  console.log(change.reason);
}
const changedFacts = seedFacts.map((fact) =>
  fact.id === "F-1006"
    ? {
        ...fact,
        value: "30",
      }
    : fact,
);

const impacts = findFactImpacts(
  seedFacts,
  changedFacts,
  seedSubmissions,
);
console.log(formatImpactReport(impacts));
console.log("\n=== CodeTruth Fact Impact Test ===\n");

if (impacts.length === 0) {
  console.log("❌ No impacts detected");
  process.exit(1);
}

for (const impact of impacts) {
  console.log(`Fact: ${impact.factId} — ${impact.factName}`);
  console.log(`${impact.oldValue} → ${impact.newValue}`);

  for (const submission of impact.affectedSubmissions) {
    console.log(
      `Affected submission: ${submission.submissionId} — ${submission.title}`,
    );

    console.log(`Claims: ${submission.claims.join(", ")}`);
  }

  console.log("");
}

const found = impacts.some(
  (impact) =>
    impact.factId === "F-1006" &&
    impact.affectedSubmissions.some(
      (submission) => submission.submissionId === "S-2035",
    ),
);

if (!found) {
  console.log("❌ Expected S-2035 to be affected");
  process.exit(1);
}

console.log("✅ Impact detection test passed");
