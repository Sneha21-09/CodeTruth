import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ContactForm } from "@/components/site/ContactForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SITE_URL } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk to CodeTruth about verifying your product claims, plans and onboarding.",
  alternates: { canonical: "/contact" },
};

const crumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
  { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
  { "@type": "ListItem", position: 2, name: "Contact", item: `${SITE_URL}/contact` },
] };

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="container-page max-w-2xl py-14">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink-950">Contact CodeTruth</h1>
        <p className="mt-3 text-[15px] text-ink-600">Tell us about your product and the content you publish. We will help you plan a rollout and pricing.</p>
        <div className="mt-8"><ContactForm /></div>
      </main>
      <SiteFooter />
    </>
  );
}
