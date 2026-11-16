export type FactStatus = "candidate" | "approved" | "expired" | "rejected";
export type FactHistory = { version: string; value: string; date: string; note: string };
export type Fact = {
  id: string; name: string; value: string; unit: string; category: string;
  file: string; line: number; version: string; updated: string; status: FactStatus;
  snippetStart: number; snippet: string[]; history: FactHistory[];
};

export type Severity = "critical" | "major" | "minor";
export type Decision = "open" | "accepted" | "edited" | "rejected";
export type Finding = {
  id: string; claim: string; category: string; severity: Severity; explanation: string;
  expected: string; actual: string; factId: string | null; file: string; line: number | null;
  method: "Rule" | "AI"; suggestion: string; /* replacement text for the claim span; "same" = verified, no change */ decision: Decision; editedText?: string;
};

export type SubmissionStatus = "draft" | "pending" | "changes" | "approved" | "rejected";
export type Submission = {
  id: string; title: string; channel: string; author: string; status: SubmissionStatus;
  created: string; updated: string; text: string; findings: Finding[]; reviewerNote?: string;
  history?: { when: string; who: string; what: string }[];
};

export type Term = { id: string; avoid: string; use: string };
export type Banned = { id: string; term: string; reason: string };
export type Colour = { id: string; name: string; hex: string; role: string };
export type Guideline = { id: string; title: string; body: string };
export type A11yRule = { id: string; rule: string; enabled: boolean };
export type Brand = {
  tone: string; toneNotes: string; preferred: Term[]; banned: Banned[];
  colours: Colour[]; guidelines: Guideline[]; a11y: A11yRule[];
};

export type Asset = { preview?: string; id: string; name: string; kind: "Logo" | "Brand image" | "Icon" | "Marketing visual"; fileType: string; sizeKb: number; dims: string; added: string; alt: string; hue: string };

export type SourceFile = { path: string; type: string; changed: string; state: "synced" | "modified" | "new" };
export type Source = {
  id: string; name: string; kind: "repository" | "upload"; location: string; branch: string;
  status: "connected" | "sync-needed" | "not-connected"; lastSync: string | null; ref: string; files: SourceFile[];
};
export type SourceChange = { id: string; date: string; source: string; file: string; summary: string; ref: string };

export type Stamp = {
  id: string; submissionId: string; title: string; version: string; date: string;
  status: "valid" | "stale"; factIds: string[]; staleReason?: string; reviewer: string;
};

export type TeamUser = { id: string; name: string; email: string; role: "Admin" | "Creator" | "Reviewer"; active: boolean };
export type Activity = { id: string; when: string; who: string; what: string };
