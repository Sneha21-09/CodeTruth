"use client";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { ButtonLink } from "@/components/ui/Button";

const links = [
  { href: "/#product", label: "Product" },
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#security", label: "Security" },
  { href: "/#pricing", label: "Pricing" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo />
        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="rounded-md px-3 py-2 text-sm font-medium text-ink-700 hover:bg-surface-sunken hover:text-ink-950">{l.label}</a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <ButtonLink href="/sign-in" variant="ghost" size="sm">Sign In</ButtonLink>
          <ButtonLink href="/sign-up" size="sm">Get Started</ButtonLink>
        </div>
        <button type="button" className="rounded-md p-2 text-ink-800 hover:bg-surface-sunken lg:hidden" aria-expanded={open}
          aria-controls="mobile-nav" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="animate-fadeIn border-t border-line bg-white px-5 pb-4 pt-2 lg:hidden">
          <ul className="flex flex-col">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setOpen(false)} className="block rounded-md px-2 py-3 text-[15px] font-medium text-ink-800 hover:bg-surface-sunken">{l.label}</a>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <ButtonLink href="/sign-in" variant="secondary" className="flex-1">Sign In</ButtonLink>
            <ButtonLink href="/sign-up" className="flex-1">Get Started</ButtonLink>
          </div>
        </nav>
      )}
    </header>
  );
}
