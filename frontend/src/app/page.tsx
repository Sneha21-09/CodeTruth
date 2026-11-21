import type { Metadata } from "next";
import {
  BadgeCheck, FileSearch, GitCompareArrows, Layers, ListChecks, Lock, Megaphone, ScrollText, ShieldCheck, Sparkles, Stamp, TriangleAlert,
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ProductPreview } from "@/components/site/ProductPreview";
import { ButtonLink } from "@/components/ui/Button";
import { SITE_URL } from "@/lib/utils";

export const metadata: Metadata = {
  title: { absolute: "CodeTruth | Verify product claims against your actual product" },
  description:
    "CodeTruth verifies marketing content against facts extracted from your product configuration. Catch incorrect claims, premature announcements and outdated numbers before they are published.",
  alternates: { canonical: "/" },
};

const steps = [
  ["Connect product information", "Link a repository read-only or upload structured files such as JSON, YAML and OpenAPI."],
  ["Extract and approve facts", "CodeTruth proposes facts with their source file and line. Your team approves what counts as true."],
  ["Submit marketing content", "Paste copy, upload a document or add an image containing marketing text."],
  ["Identify incorrect claims", "Each claim is matched to an approved fact. No approved source means no factual flag."],
  ["Review suggested corrections", "See the original and corrected wording side by side, then accept, edit or reject."],
  ["Approve verified content", "A reviewer approves and a stamp records the exact product version checked."],
] as const;

const features = [
  { icon: Layers, title: "Product Fact Intelligence", body: "Limits, formats, plan values, versions and feature flags are extracted from structured product files with their exact source location." },
  { icon: FileSearch, title: "Evidence-Backed Verification", body: "Every factual finding cites an approved fact ID, the source file, the line number and the product version it was checked against." },
  { icon: Sparkles, title: "AI-Assisted Claim Matching", body: "AI helps interpret ambiguous wording. Deterministic rules decide what is factually correct, so a model never invents a product fact." },
  { icon: ScrollText, title: "Brand Guideline Enforcement", body: "Preferred terms, banned words, tone guidance, brand colours and accessibility rules are checked alongside factual claims." },
  { icon: GitCompareArrows, title: "Change Impact Detection", body: "When a product file changes, CodeTruth shows which facts moved and which published content depends on them." },
  { icon: Stamp, title: "Verification Stamps", body: "Approved content receives a record of the version and facts it was verified against, and is flagged when those facts change." },
] as const;

const differentiators = [
  { icon: Megaphone, title: "Premature announcement detection", body: "Copy that announces a feature whose flag is still disabled is stopped before launch." },
  { icon: TriangleAlert, title: "Absolute claim protection", body: "Words like “unlimited”, “always” and “guaranteed” are flagged when the product facts or brand rules do not support them." },
  { icon: GitCompareArrows, title: "Source conflict detection", body: "If two product files disagree, CodeTruth shows the conflict instead of quietly choosing one value." },
  { icon: BadgeCheck, title: "Fact-bound verification", body: "Findings link to a specific approved fact, so reviewers can inspect the evidence themselves." },
  { icon: ListChecks, title: "Content change tracking", body: "Previously verified content is re-opened for review when a fact it relied on changes." },
] as const;

const faqs = [
  ["What is CodeTruth?", "CodeTruth is a platform that checks marketing content against facts taken from your own product configuration and documentation, and shows the source for each finding."],
  ["How is it different from a grammar or style checker?", "Style checkers evaluate wording, tone and grammar. CodeTruth also checks whether the claim is true by comparing it to approved product facts."],
  ["Does AI decide whether a claim is correct?", "No. Deterministic rules compare claims to approved facts. AI is used to help interpret ambiguous wording, review tone and suggest rewrites."],
  ["What does CodeTruth read from my product?", "Structured files such as JSON and YAML configuration, OpenAPI specifications, package manifests, feature flags and changelogs. It does not analyse arbitrary source code."],
  ["What happens when a product value changes?", "CodeTruth compares the new facts with the previous ones, lists what changed and flags verified content that depended on the changed facts for re-review."],
] as const;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": `${SITE_URL}/#org`, name: "CodeTruth", url: SITE_URL, logo: `${SITE_URL}/icon.svg` },
    { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: "CodeTruth", publisher: { "@id": `${SITE_URL}/#org` } },
    {
      "@type": "SoftwareApplication", name: "CodeTruth", applicationCategory: "BusinessApplication", operatingSystem: "Web",
      description: "Brand-governance platform that verifies marketing content against facts extracted from a company's product configuration.",
      url: SITE_URL, publisher: { "@id": `${SITE_URL}/#org` },
    },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL }] },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

        <section id="product" className="border-b border-line bg-gradient-to-b from-surface-muted to-white">
          <div className="container-page py-16 sm:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <p className="eyebrow">Brand governance for product claims</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink-950 sm:text-5xl">Your Brand Deserves More Than a Spell Check.</h1>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink-600">
                Verify every product claim against what your product actually does. Catch inaccurate messaging, outdated information, and brand inconsistencies before they reach your audience.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <ButtonLink href="/sign-up" size="lg">Start Verifying</ButtonLink>
                <ButtonLink href="#features" variant="secondary" size="lg">Explore Platform</ButtonLink>
              </div>
            </div>
            <div className="mx-auto mt-14 max-w-4xl"><ProductPreview /></div>
          </div>
        </section>

        <section className="py-16 sm:py-20" aria-labelledby="problem-h">
          <div className="container-page grid gap-10 md:grid-cols-2 md:items-start">
            <div>
              <p className="eyebrow">The problem</p>
              <h2 id="problem-h" className="mt-2 text-3xl font-semibold tracking-tight text-ink-950">Style checkers cannot tell when a claim is wrong.</h2>
            </div>
            <div className="space-y-4 text-[15px] leading-relaxed text-ink-600">
              <p>Traditional brand tools review grammar, tone and consistency. A sentence like “supports 15 file formats” reads perfectly, so it passes, even when the product supports 12.</p>
              <p>Product details change every release. Limits move, plans are reshaped and features slip. Marketing copy written last quarter quietly becomes inaccurate, and nobody is alerted.</p>
              <p>Incorrect claims reach customers, create support load and weaken trust in everything else you publish.</p>
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-surface-muted py-16 sm:py-20" aria-labelledby="solution-h">
          <div className="container-page">
            <div className="max-w-2xl">
              <p className="eyebrow">The solution</p>
              <h2 id="solution-h" className="mt-2 text-3xl font-semibold tracking-tight text-ink-950">CodeTruth connects product facts to marketing content.</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-600">
                Facts are extracted from the files your product already runs on, approved by your team and then used as the single source of truth when content is reviewed.
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[["Product files", "JSON, YAML, OpenAPI, manifests, feature flags, changelogs"], ["Approved facts", "Value, unit, source file, line and version"], ["Verified content", "Findings with evidence and suggested corrections"]].map(([t, d], i) => (
                <div key={t} className="rounded-lg border border-line bg-white p-5 shadow-card">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">{i + 1}</span>
                  <h3 className="mt-3 text-[15px] font-semibold text-ink-950">{t}</h3>
                  <p className="mt-1 text-sm text-ink-600">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-16 sm:py-20" aria-labelledby="how-h">
          <div className="container-page">
            <p className="eyebrow">How it works</p>
            <h2 id="how-h" className="mt-2 text-3xl font-semibold tracking-tight text-ink-950">From product files to approved content in six steps.</h2>
            <ol className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
              {steps.map(([t, d], i) => (
                <li key={t} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-900 text-sm font-semibold text-white">{i + 1}</span>
                  <div>
                    <h3 className="text-[15px] font-semibold text-ink-950">{t}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-600">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="features" className="border-y border-line bg-surface-muted py-16 sm:py-20" aria-labelledby="features-h">
          <div className="container-page">
            <p className="eyebrow">Features</p>
            <h2 id="features-h" className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-ink-950">Everything a review team needs to publish with confidence.</h2>
            <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, body }) => (
                <article key={title} className="bg-white p-6">
                  <Icon className="h-5 w-5 text-brand-600" aria-hidden="true" />
                  <h3 className="mt-3 text-[15px] font-semibold text-ink-950">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="differentiators" className="py-16 sm:py-20" aria-labelledby="diff-h">
          <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.6fr]">
            <div>
              <p className="eyebrow">Why CodeTruth</p>
              <h2 id="diff-h" className="mt-2 text-3xl font-semibold tracking-tight text-ink-950">Built around evidence, not guesses.</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-600">Our core rule is simple: no source, no flag. If a finding cannot point to an approved fact or a brand rule, it is not raised.</p>
            </div>
            <ul className="divide-y divide-line rounded-lg border border-line bg-white shadow-card">
              {differentiators.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-4 p-5">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
                  <div><h3 className="text-[15px] font-semibold text-ink-950">{title}</h3><p className="mt-1 text-sm text-ink-600">{body}</p></div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="security" className="border-y border-line bg-ink-950 py-16 text-white sm:py-20" aria-labelledby="sec-h">
          <div className="container-page">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-200">Security</p>
            <h2 id="sec-h" className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight">Designed to read your product, never change it.</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [Lock, "Read-only access", "Repository connections are designed to be read-only. CodeTruth never writes to your product source."],
                [ShieldCheck, "Role-based permissions", "Admins, creators and reviewers have distinct permissions. Only reviewers can approve."],
                [ScrollText, "Audit trail", "Approvals, fact decisions and changes are recorded with who did what and when."],
                [FileSearch, "Redaction before AI", "Sensitive values are intended to be redacted before any text is sent to an AI provider."],
              ].map(([I, t, d]) => {
                const Icon = I as typeof Lock;
                return (
                  <div key={t as string}>
                    <Icon className="h-5 w-5 text-brand-200" aria-hidden="true" />
                    <h3 className="mt-3 text-[15px] font-semibold">{t as string}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-400">{d as string}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="pricing" className="py-16 sm:py-20" aria-labelledby="pricing-h">
          <div className="container-page">
            <p className="eyebrow">Pricing</p>
            <h2 id="pricing-h" className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-ink-950">Plans sized to how many teams publish content.</h2>
            <p className="mt-3 max-w-2xl text-[15px] text-ink-600">Pricing is set per workspace during onboarding. Contact us for a quote.</p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                ["Starter", "For a single product and a small content team.", ["1 product workspace", "Manual file upload", "Fact registry and review workflow"]],
                ["Team", "For teams with a shared review process.", ["Multiple workspaces", "Repository connection (read-only)", "Verification stamps and change impact"]],
                ["Enterprise", "For organisations with governance requirements.", ["Custom roles and audit exports", "Single sign-on", "Onboarding and support"]],
              ].map(([name, blurb, items]) => (
                <div key={name as string} className="flex flex-col rounded-lg border border-line bg-white p-6 shadow-card">
                  <h3 className="text-base font-semibold text-ink-950">{name as string}</h3>
                  <p className="mt-1 text-sm text-ink-600">{blurb as string}</p>
                  <ul className="mt-4 flex-1 space-y-2 text-sm text-ink-800">
                    {(items as string[]).map((i) => <li key={i} className="flex gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-ok-600" aria-hidden="true" />{i}</li>)}
                  </ul>
                  <ButtonLink href="/contact" variant="secondary" className="mt-6">Contact us</ButtonLink>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="border-t border-line bg-surface-muted py-16 sm:py-20" aria-labelledby="faq-h">
          <div className="container-page max-w-3xl">
            <p className="eyebrow">FAQ</p>
            <h2 id="faq-h" className="mt-2 text-3xl font-semibold tracking-tight text-ink-950">Common questions</h2>
            <div className="mt-8 divide-y divide-line rounded-lg border border-line bg-white">
              {faqs.map(([q, a]) => (
                <details key={q} className="group p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-ink-950">
                    {q}<span aria-hidden="true" className="text-ink-400 transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-brand-700 py-16 text-white" aria-labelledby="cta-h">
          <div className="container-page flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 id="cta-h" className="text-3xl font-semibold tracking-tight">Make Every Brand Claim Accountable.</h2>
              <p className="mt-2 max-w-xl text-brand-100">Connect your product facts and review the next piece of content against them.</p>
            </div>
            <div className="flex gap-3">
              <ButtonLink href="/sign-up" size="lg" className="bg-white !text-brand-800 hover:bg-brand-50">Start Verifying</ButtonLink>
              <ButtonLink href="/contact" size="lg" className="border border-white/40 bg-transparent text-white hover:bg-white/10">Contact us</ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
