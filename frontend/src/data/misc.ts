import type { Activity, Asset, Brand, Source, SourceChange, Stamp, TeamUser } from "./types";

export const seedBrand: Brand = {
  tone: "Confident",
  toneNotes: "Plain, specific and evidence-led. Prefer concrete numbers over adjectives. Avoid hype and unsupported superlatives.",
  preferred: [
    { id: "T1", avoid: "customers", use: "teams" },
    { id: "T2", avoid: "utilize", use: "use" },
    { id: "T3", avoid: "priority support", use: "Priority Support" },
  ],
  banned: [
    { id: "B1", term: "revolutionary", reason: "Unsupported superlative" },
    { id: "B2", term: "best-in-class", reason: "Comparative claim needs evidence" },
    { id: "B3", term: "guaranteed", reason: "Legal review required for guarantees" },
  ],
  colours: [
    { id: "C1", name: "Northwind Blue", hex: "#1F5BD0", role: "Primary" },
    { id: "C2", name: "Deep Navy", hex: "#101C33", role: "Text" },
    { id: "C3", name: "Signal Green", hex: "#15803D", role: "Success" },
    { id: "C4", name: "Soft Grey", hex: "#F6F8FB", role: "Background" },
  ],
  guidelines: [
    { id: "G1", title: "Lead with the outcome", body: "Open with what the reader can do, then support it with a specific product fact." },
    { id: "G2", title: "Numbers need a source", body: "Every number in public copy must trace to an approved product fact." },
    { id: "G3", title: "Announce only released features", body: "Mention unreleased capabilities only as roadmap items with no dates." },
  ],
  a11y: [
    { id: "A1", rule: "Text contrast ratio of at least 4.5:1 (WCAG AA)", enabled: true },
    { id: "A2", rule: "All meaningful images have alt text", enabled: true },
    { id: "A3", rule: "Do not convey meaning by colour alone", enabled: true },
    { id: "A4", rule: "Link text describes its destination", enabled: false },
  ],
};

export const seedAssets: Asset[] = [
  { id: "AS1", name: "northwind-logo-primary.svg", kind: "Logo", fileType: "SVG", sizeKb: 8, dims: "320 × 80", added: "2026-09-01", alt: "Northwind logo in blue", hue: "#1F5BD0" },
  { id: "AS2", name: "northwind-logo-mono.svg", kind: "Logo", fileType: "SVG", sizeKb: 6, dims: "320 × 80", added: "2026-09-01", alt: "Northwind logo in single-colour navy", hue: "#101C33" },
  { id: "AS3", name: "team-collaboration.jpg", kind: "Brand image", fileType: "JPG", sizeKb: 412, dims: "1600 × 900", added: "2026-09-18", alt: "", hue: "#3B7BE8" },
  { id: "AS4", name: "icon-upload.svg", kind: "Icon", fileType: "SVG", sizeKb: 2, dims: "48 × 48", added: "2026-09-22", alt: "Upload arrow icon", hue: "#15803D" },
  { id: "AS5", name: "launch-banner-q4.png", kind: "Marketing visual", fileType: "PNG", sizeKb: 688, dims: "1200 × 628", added: "2026-10-30", alt: "", hue: "#B45309" },
  { id: "AS6", name: "icon-shield.svg", kind: "Icon", fileType: "SVG", sizeKb: 2, dims: "48 × 48", added: "2026-10-02", alt: "Shield icon representing security", hue: "#4B5B7A" },
];

export const seedSources: Source[] = [
  {
    id: "SRC1", name: "northwind-platform", kind: "repository", location: "github.com/northwind-example/platform", branch: "main",
    status: "connected", lastSync: "2026-11-10T09:42:00", ref: "a41c9e2",
    files: [
      { path: "package.json", type: "Package manifest", changed: "2026-11-10", state: "synced" },
      { path: "config/formats.yaml", type: "YAML configuration", changed: "2026-11-10", state: "modified" },
      { path: "config/limits.json", type: "JSON configuration", changed: "2026-06-02", state: "synced" },
      { path: "config/billing.json", type: "JSON configuration", changed: "2026-09-14", state: "synced" },
      { path: "config/feature-flags.json", type: "Feature flags", changed: "2026-11-10", state: "modified" },
      { path: "openapi/public-api.yaml", type: "OpenAPI specification", changed: "2026-10-28", state: "synced" },
      { path: "docs/CHANGELOG.md", type: "Changelog", changed: "2026-11-10", state: "new" },
    ],
  },
  {
    id: "SRC2", name: "Manual upload: pricing exports", kind: "upload", location: "Uploaded files", branch: "n/a",
    status: "sync-needed", lastSync: "2026-10-04T14:10:00", ref: "upload-0412",
    files: [{ path: "pricing-export.json", type: "JSON configuration", changed: "2026-10-04", state: "synced" }],
  },
];

export const seedSourceChanges: SourceChange[] = [
  { id: "CH1", date: "2026-11-10", source: "northwind-platform", file: "config/formats.yaml", summary: "Supported formats changed from 13 to 12 (XML import removed)", ref: "a41c9e2" },
  { id: "CH2", date: "2026-11-10", source: "northwind-platform", file: "config/feature-flags.json", summary: "bulk_export_v2 target moved from 4.8.0 to 4.9.0", ref: "a41c9e2" },
  { id: "CH3", date: "2026-10-28", source: "northwind-platform", file: "openapi/public-api.yaml", summary: "Rate limit description updated; value unchanged", ref: "7be03d1" },
  { id: "CH4", date: "2026-09-14", source: "northwind-platform", file: "config/billing.json", summary: "Trial credits changed from 50 to 20", ref: "c92f6a0" },
];

export const seedStamps: Stamp[] = [
  { id: "VS-310", submissionId: "S-2039", title: "Security page refresh", version: "4.8.2", date: "2026-11-03", status: "valid", factIds: ["F-1008", "F-1007"], reviewer: "Dana Okafor" },
  { id: "VS-309", submissionId: "S-2038", title: "Developer newsletter: API limits", version: "4.8.1", date: "2026-10-29", status: "valid", factIds: ["F-1004"], reviewer: "Dana Okafor" },
  { id: "VS-301", submissionId: "S-2022", title: "Import guide announcement", version: "4.6.0", date: "2026-09-02", status: "stale", factIds: ["F-1001"], reviewer: "Dana Okafor",
    staleReason: "Supported file formats (F-1001) changed from 13 to 12 in version 4.8.2." },
  { id: "VS-298", submissionId: "S-2019", title: "Free trial landing section", version: "4.6.0", date: "2026-08-24", status: "stale", factIds: ["F-1003", "F-1014"], reviewer: "Marcus Webb",
    staleReason: "Free trial credits (F-1003) changed from 50 to 20 in version 4.7.0." },
];

export const seedTeam: TeamUser[] = [
  { id: "U1", name: "Dana Okafor", email: "dana@northwind.example", role: "Admin", active: true },
  { id: "U2", name: "Priya Nair", email: "priya@northwind.example", role: "Creator", active: true },
  { id: "U3", name: "Marcus Webb", email: "marcus@northwind.example", role: "Creator", active: true },
  { id: "U4", name: "Aisha Khan", email: "aisha@northwind.example", role: "Reviewer", active: true },
];

export const seedActivity: Activity[] = [
  { id: "AC1", when: "2026-11-15T16:20:00", who: "Aisha Khan", what: "saved draft “Onboarding email draft”" },
  { id: "AC2", when: "2026-11-14T11:05:00", who: "Priya Nair", what: "submitted “Spring launch announcement” for review" },
  { id: "AC3", when: "2026-11-13T15:40:00", who: "Dana Okafor", what: "requested changes on “Bulk export teaser post”" },
  { id: "AC4", when: "2026-11-10T09:42:00", who: "System", what: "synchronised northwind-platform at a41c9e2" },
  { id: "AC5", when: "2026-11-10T09:43:00", who: "System", what: "marked 2 verifications stale after fact changes" },
  { id: "AC6", when: "2026-11-03T10:12:00", who: "Dana Okafor", what: "approved “Security page refresh”" },
];

export const trendData = [
  { month: "Jun", submitted: 14, mismatches: 5, approved: 9 },
  { month: "Jul", submitted: 18, mismatches: 7, approved: 12 },
  { month: "Aug", submitted: 22, mismatches: 9, approved: 15 },
  { month: "Sep", submitted: 25, mismatches: 8, approved: 19 },
  { month: "Oct", submitted: 31, mismatches: 10, approved: 24 },
  { month: "Nov", submitted: 19, mismatches: 6, approved: 11 },
];

export const ruleViolations = [
  { rule: "Unsupported superlatives", count: 18 },
  { rule: "Banned terminology", count: 13 },
  { rule: "Preferred terms", count: 11 },
  { rule: "Absolute claims", count: 9 },
  { rule: "Alt text missing", count: 6 },
];

export const accuracyData = [
  { month: "Jun", precision: 88, recall: 80, falsePositive: 9 },
  { month: "Jul", precision: 90, recall: 82, falsePositive: 8 },
  { month: "Aug", precision: 91, recall: 85, falsePositive: 6 },
  { month: "Sep", precision: 93, recall: 86, falsePositive: 5 },
  { month: "Oct", precision: 94, recall: 88, falsePositive: 4 },
  { month: "Nov", precision: 94, recall: 89, falsePositive: 4 },
];
export const overrideData = [
  { month: "Jun", overrides: 3 }, { month: "Jul", overrides: 4 }, { month: "Aug", overrides: 3 },
  { month: "Sep", overrides: 2 }, { month: "Oct", overrides: 2 }, { month: "Nov", overrides: 1 },
];
export const factChangeData = [
  { month: "Jun", modified: 4, added: 6, removed: 1 }, { month: "Jul", modified: 3, added: 5, removed: 0 },
  { month: "Aug", modified: 5, added: 4, removed: 2 }, { month: "Sep", modified: 6, added: 3, removed: 1 },
  { month: "Oct", modified: 2, added: 7, removed: 0 }, { month: "Nov", modified: 3, added: 2, removed: 1 },
];
