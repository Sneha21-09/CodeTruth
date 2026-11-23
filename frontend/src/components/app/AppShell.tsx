"use client";
import {
  BarChart3, Database, FileCheck2, GitBranch, History, MessageCircleQuestion, Images, LayoutDashboard, LogOut, Menu, Palette, RotateCcw, Settings, X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { Spinner } from "@/components/ui/States";
import { resetAllSampleData, useSubmissions } from "@/lib/data";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/app", label: "Overview", icon: LayoutDashboard },
  { href: "/app/reviews", label: "Content Reviews", icon: FileCheck2 },
  { href: "/app/facts", label: "Product Facts", icon: Database },
  { href: "/app/brand", label: "Brand Guidelines", icon: Palette },
  { href: "/app/ask", label: "Ask the Guidelines", icon: MessageCircleQuestion },
  { href: "/app/assets", label: "Asset Library", icon: Images },
  { href: "/app/sources", label: "Repository Sources", icon: GitBranch },
  { href: "/app/history", label: "Verification History", icon: History },
  { href: "/app/insights", label: "Insights", icon: BarChart3 },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession, ready] = useSession();
  const [subs] = useSubmissions();
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => { if (ready && !session) router.replace("/sign-in"); }, [ready, session, router]);
  useEffect(() => { setDrawer(false); setMenu(false); }, [pathname]);

  if (!ready || !session) return <div className="min-h-screen"><Spinner label="Loading workspace" /></div>;

  const pending = subs.filter((s) => s.status === "pending").length;
  const initials = session.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  const sidebar = (
    <nav aria-label="Application" className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5"><Logo href="/app" /></div>
      <ul className="flex-1 space-y-0.5 px-3 py-2">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === "/app" ? pathname === "/app" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link href={href} aria-current={active ? "page" : undefined}
                className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-brand-50 text-brand-700" : "text-ink-700 hover:bg-surface-sunken hover:text-ink-950")}>
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="flex-1">{label}</span>
                {href === "/app/reviews" && pending > 0 && <span className="rounded-full bg-brand-600 px-1.5 text-[11px] font-semibold text-white">{pending}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="border-t border-line px-5 py-3 text-xs text-ink-500">Preview build · sample data</p>
    </nav>
  );

  return (
    <div className="min-h-screen bg-surface-muted lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-white lg:block">{sidebar}</aside>
      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/40" onClick={() => setDrawer(false)} aria-hidden="true" />
          <aside className="relative h-full w-72 max-w-[85vw] animate-fadeIn bg-white shadow-pop">
            <button type="button" onClick={() => setDrawer(false)} aria-label="Close navigation" className="absolute right-3 top-4 rounded p-1.5 text-ink-600 hover:bg-surface-sunken"><X className="h-4 w-4" /></button>
            {sidebar}
          </aside>
        </div>
      )}
      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-white px-4 sm:px-6">
        <button type="button" className="rounded-md p-2 text-ink-800 hover:bg-surface-sunken lg:hidden" aria-label="Open navigation" onClick={() => setDrawer(true)}><Menu className="h-5 w-5" /></button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink-950">{session.workspace}</p>
          <p className="text-xs text-ink-500">{session.role}</p>
        </div>
        <div className="relative">
          <button type="button" onClick={() => setMenu((v) => !v)} aria-haspopup="menu" aria-expanded={menu} aria-label="Account menu"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">{initials}</button>
          {menu && (
            <div role="menu" className="absolute right-0 top-11 z-30 w-60 animate-fadeIn rounded-lg border border-line bg-white p-1 shadow-pop">
              <div className="border-b border-line px-3 py-2"><p className="truncate text-sm font-medium text-ink-950">{session.name}</p><p className="truncate text-xs text-ink-500">{session.email}</p></div>
              <Link role="menuitem" href="/app/settings" className="flex items-center gap-2 rounded px-3 py-2 text-sm text-ink-800 hover:bg-surface-sunken"><Settings className="h-4 w-4" />Profile &amp; settings</Link>
              <button role="menuitem" type="button" onClick={() => { resetAllSampleData(); window.location.href = "/app"; }}
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-ink-800 hover:bg-surface-sunken"><RotateCcw className="h-4 w-4" />Reset sample data</button>
              <button role="menuitem" type="button" onClick={() => { setSession(null); router.push("/sign-in"); }}
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-ink-800 hover:bg-surface-sunken"><LogOut className="h-4 w-4" />Sign out</button>
            </div>
          )}
        </div>
      </header>
      <main id="main" className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
