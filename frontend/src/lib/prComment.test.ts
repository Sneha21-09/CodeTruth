import { buildPrComment } from "./prComment";
import { findFactImpacts } from "./impact";
import { seedFacts } from "../data/facts";
import { seedSubmissions } from "../data/submissions";

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

const comment = buildPrComment(impacts);

console.log("\n=== GitHub PR Comment ===\n");
console.log(comment);

if (!comment.includes("CodeTruth Impact Report")) {
  throw new Error("PR comment generation failed");
}

if (!comment.includes("F-1006")) {
  throw new Error("Changed fact missing from PR comment");
}

if (!comment.includes("S-2035")) {
  throw new Error("Affected submission missing from PR comment");
}

console.log("\n✅ PR comment test passed");
