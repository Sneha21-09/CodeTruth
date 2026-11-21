import Link from "next/link";
import { Logo } from "@/components/Logo";

const cols = [
  { title: "Product", links: [["Platform", "/#product"], ["Features", "/#features"], ["How It Works", "/#how-it-works"], ["Pricing", "/#pricing"]] },
  { title: "Trust", links: [["Security", "/#security"], ["Why CodeTruth", "/#differentiators"], ["FAQ", "/#faq"]] },
  { title: "Account", links: [["Sign In", "/sign-in"], ["Get Started", "/sign-up"], ["Contact", "/contact"]] },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface-muted">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-ink-600">Style checkers read words. CodeTruth reads the product.</p>
        </div>
        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-500">{c.title}</h2>
            <ul className="mt-3 space-y-2">
              {c.links.map(([label, href]) => (
                <li key={label}><Link href={href} className="text-sm text-ink-700 hover:text-brand-700 hover:underline">{label}</Link></li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <p className="container-page py-4 text-xs text-ink-500">© 2026 CodeTruth. All rights reserved.</p>
      </div>
    </footer>
  );
}
