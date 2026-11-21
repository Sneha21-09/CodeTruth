import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="container-page flex min-h-[55vh] flex-col items-center justify-center py-20 text-center">
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-950">This page could not be found</h1>
        <p className="mt-3 max-w-md text-[15px] text-ink-600">The address may be mistyped or the page may have moved.</p>
        <div className="mt-6 flex gap-3">
          <ButtonLink href="/">Back to home</ButtonLink>
          <ButtonLink href="/sign-in" variant="secondary">Sign in</ButtonLink>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
