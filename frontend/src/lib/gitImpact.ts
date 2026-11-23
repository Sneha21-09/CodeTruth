import type { Fact } from "../data/types";

export type ChangedFile = {
  file: string;
  lines: number[];
};

export type ChangedFact = {
  factId: string;
  factName: string;
  file: string;
  line: number;
  reason: string;
};

export function findChangedFacts(
  facts: Fact[],
  changedFiles: ChangedFile[],
): ChangedFact[] {
  const changedFacts: ChangedFact[] = [];

  for (const fact of facts) {
    const changedFile = changedFiles.find(
      (file) =>
        file.file === fact.file ||
        file.file === "src/data/facts.ts" ||
        file.file === "frontend/src/data/facts.ts",
    );

    if (!changedFile) {
      continue;
    }

    const lineChanged = changedFile.lines.some(
      (line) => Math.abs(line - fact.line) <= 2,
    );

    if (!lineChanged) {
      continue;
    }

    changedFacts.push({
      factId: fact.id,
      factName: fact.name,
      file: fact.file,
      line: fact.line,
      reason:
        `Source fact "${fact.name}" changed in ` +
        `${changedFile.file} near line ${fact.line}.`,
    });
  }

  return changedFacts;
}

export function parseGitDiff(
  diff: string,
): ChangedFile[] {
  const changedFiles: ChangedFile[] = [];

  let currentFile: string | null = null;
  let newLine = 0;
  let lineCount = 0;

  for (const rawLine of diff.split("\n")) {
    if (rawLine.startsWith("+++ b/")) {
      currentFile = rawLine.slice(6);
      continue;
    }

    if (rawLine.startsWith("@@")) {
      const match = rawLine.match(/\+(\d+)(?:,(\d+))?/);

      if (!match) {
        continue;
      }

      newLine = Number(match[1]);
      lineCount = Number(match[2] ?? 1);
      continue;
    }

    if (
      currentFile &&
      lineCount > 0 &&
      rawLine.startsWith("+") &&
      !rawLine.startsWith("+++")
    ) {
      const existing = changedFiles.find(
        (file) => file.file === currentFile,
      );

      if (existing) {
        existing.lines.push(newLine);
      } else {
        changedFiles.push({
          file: currentFile,
          lines: [newLine],
        });
      }

      newLine += 1;
      lineCount -= 1;
      continue;
    }

    if (
      currentFile &&
      lineCount > 0 &&
      !rawLine.startsWith("-")
    ) {
      newLine += 1;
      lineCount -= 1;
    }
  }

  return changedFiles;
}
