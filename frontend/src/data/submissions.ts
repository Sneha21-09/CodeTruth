import type { Submission } from "./types";

export const seedSubmissions: Submission[] = [
  {
    id: "S-2041", title: "Spring launch announcement", channel: "Website", author: "Priya Nair", status: "pending",
    created: "2026-11-12", updated: "2026-11-14",
    text: "Northwind now supports 15 file formats, so every team can bring their work in without conversion. Upload files up to 500 MB and start with 50 free credits. Our fastest-ever platform is guaranteed to cut review time.",
    findings: [
      { id: "FD-1", claim: "supports 15 file formats", category: "Factual mismatch", severity: "critical",
        explanation: "The claim states 15 formats but the approved product fact lists 12 supported import formats.",
        expected: "15 formats", actual: "12 formats", factId: "F-1001", file: "config/formats.yaml", line: 14, method: "Rule",
        suggestion: "supports 12 file formats", decision: "open" },
      { id: "FD-2", claim: "files up to 500 MB", category: "Factual mismatch", severity: "critical",
        explanation: "Maximum upload size in the product configuration is 250 MB.",
        expected: "500 MB", actual: "250 MB", factId: "F-1002", file: "config/limits.json", line: 8, method: "Rule",
        suggestion: "files up to 250 MB", decision: "open" },
      { id: "FD-3", claim: "50 free credits", category: "Outdated claim", severity: "major",
        explanation: "The trial credit allowance was reduced from 50 to 20 credits in version 4.7.0.",
        expected: "50 credits", actual: "20 credits", factId: "F-1003", file: "config/billing.json", line: 21, method: "Rule",
        suggestion: "20 free credits", decision: "open" },
      { id: "FD-4", claim: "fastest-ever platform is guaranteed", category: "Absolute claim", severity: "major",
        explanation: "Superlative and guarantee wording is restricted by brand rule BR-07 and no approved fact supports a speed ranking.",
        expected: "No unsupported superlatives", actual: "Absolute wording found", factId: null, file: "Brand rule BR-07", line: null, method: "Rule",
        suggestion: "platform is designed", decision: "open" },
    ],
  },
  {
    id: "S-2040", title: "Bulk export teaser post", channel: "Social", author: "Marcus Webb", status: "changes",
    created: "2026-11-11", updated: "2026-11-13", reviewerNote: "Feature is not released yet. Please hold until 4.9.0.",
    text: "Bulk Export v2 is here! Export your whole workspace in one click, starting today.",
    findings: [
      { id: "FD-5", claim: "Bulk Export v2 is here", category: "Premature announcement", severity: "critical",
        explanation: "The bulk_export_v2 flag is disabled and targeted for version 4.9.0, so it is not available to customers.",
        expected: "Available now", actual: "Disabled, target 4.9.0", factId: "F-1010", file: "config/feature-flags.json", line: 9, method: "Rule",
        suggestion: "Bulk Export v2 is coming in an upcoming release", decision: "open" },
    ],
  },
  {
    id: "S-2039", title: "Security page refresh", channel: "Website", author: "Priya Nair", status: "approved",
    created: "2026-10-30", updated: "2026-11-03",
    text: "Northwind supports SAML single sign-on and keeps workspace data for 90 days by default.",
    findings: [
      { id: "FD-6", claim: "SAML single sign-on", category: "Verified claim", severity: "minor",
        explanation: "Claim matches the approved feature flag.", expected: "enabled", actual: "enabled", factId: "F-1008",
        file: "config/feature-flags.json", line: 6, method: "Rule", suggestion: "same", decision: "accepted" },
    ],
  },
  {
    id: "S-2038", title: "Developer newsletter: API limits", channel: "Email", author: "Aisha Khan", status: "approved",
    created: "2026-10-26", updated: "2026-10-29",
    text: "The public API allows 600 requests per minute by default.",
    findings: [
      { id: "FD-7", claim: "600 requests per minute", category: "Verified claim", severity: "minor",
        explanation: "Claim matches the approved fact.", expected: "600 requests/min", actual: "600 requests/min", factId: "F-1004",
        file: "openapi/public-api.yaml", line: 312, method: "Rule", suggestion: "same", decision: "accepted" },
    ],
  },
  {
    id: "S-2037", title: "Enterprise plan ad copy", channel: "Advertisement", author: "Marcus Webb", status: "rejected",
    created: "2026-10-20", updated: "2026-10-22", reviewerNote: "Contains unsupported guarantees. Rewrite required.",
    text: "100% uptime, always. Unlimited seats for every team.",
    findings: [
      { id: "FD-8", claim: "100% uptime", category: "Absolute claim", severity: "critical",
        explanation: "Candidate fact F-1013 lists a 99.9% uptime commitment. 100% cannot be supported.",
        expected: "100%", actual: "99.9%", factId: "F-1013", file: "docs/CHANGELOG.md", line: 57, method: "Rule",
        suggestion: "99.9% uptime commitment", decision: "rejected" },
    ],
  },
  {
    id: "S-2036", title: "Onboarding email draft", channel: "Email", author: "Aisha Khan", status: "draft",
    created: "2026-11-15", updated: "2026-11-15",
    text: "Welcome! Your 14 day trial includes 20 credits and no credit card is required.", findings: [],
  },
  {
    id: "S-2035", title: "Pricing page: team seats", channel: "Website", author: "Priya Nair", status: "pending",
    created: "2026-11-09", updated: "2026-11-12",
    text: "The Pro plan includes 30 seats and priority support.",
    findings: [
      { id: "FD-9", claim: "30 seats", category: "Factual mismatch", severity: "major",
        explanation: "The Pro plan configuration allows 25 seats.", expected: "30 seats", actual: "25 seats", factId: "F-1006",
        file: "config/billing.json", line: 44, method: "Rule", suggestion: "25 seats", decision: "open" },
      { id: "FD-10", claim: "priority support", category: "Tone and style", severity: "minor",
        explanation: "Preferred terminology guidance suggests naming the support tier explicitly.", expected: "Named support tier", actual: "Generic phrase", factId: null,
        file: "Brand rule BR-03", line: null, method: "AI", suggestion: "Priority Support", decision: "open" },
    ],
  },
];
