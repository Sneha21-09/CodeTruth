"use client";
import { Plus } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/States";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import type { TeamUser } from "@/data/types";
import { useTeam } from "@/lib/data";
import { EMAIL_RE, passwordError, useSession } from "@/lib/session";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { uid } from "@/lib/utils";

type Tab = "profile" | "workspace" | "users" | "notifications" | "security" | "integrations";
const NOTIFY = [["review_requested", "A submission needs my review"], ["changes_requested", "Changes were requested on my content"], ["fact_changed", "A product fact I depend on changed"], ["stale", "A verification becomes stale"]] as const;
const INTEGRATIONS = [["github", "GitHub"], ["gitlab", "GitLab"], ["slack", "Slack notifications"]] as const;

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return <label className="flex items-center justify-between gap-4 py-3 text-sm"><span className="text-ink-900">{label}</span>
    <input type="checkbox" role="switch" checked={checked} onChange={onChange} className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-line-strong transition-colors checked:bg-brand-600 relative before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-transform checked:before:translate-x-4" /></label>;
}

export function SettingsPage() {
  const { toast } = useToast();
  const [session, setSession, ready] = useSession();
  const [team, setTeam] = useTeam();
  const [prefs, setPrefs] = useLocalStorage<Record<string, boolean>>("ct.v1.prefs", { review_requested: true, changes_requested: true, fact_changed: true, stale: false, github: false, gitlab: false, slack: false });
  const [tab, setTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<{ name: string; email: string } | null>(null);
  const [wsName, setWsName] = useState<string | null>(null);
  const [errs, setErrs] = useState<Record<string, string | undefined>>({});
  const [invite, setInvite] = useState({ name: "", email: "", role: "Creator" as TeamUser["role"] });
  const [pw, setPw] = useState({ cur: "", next: "", confirm: "" });

  if (!ready || !session) return <Spinner />;
  const admin = session.role === "Admin";
  const p = profile ?? { name: session.name, email: session.email };

  function saveProfile() {
    const e: typeof errs = {};
    if (p.name.trim().length < 2) e.name = "Enter your name";
    if (!EMAIL_RE.test(p.email)) e.email = "Enter a valid email";
    setErrs(e); if (Object.keys(e).length) return;
    setSession({ ...session!, name: p.name.trim(), email: p.email }); setProfile(null); toast("Profile saved");
  }
  function addUser() {
    const e: typeof errs = {};
    if (invite.name.trim().length < 2) e.iname = "Enter a name";
    if (!EMAIL_RE.test(invite.email)) e.iemail = "Enter a valid email";
    else if (team.some((u) => u.email.toLowerCase() === invite.email.toLowerCase())) e.iemail = "That email is already on the team";
    setErrs(e); if (Object.keys(e).length) return;
    setTeam((t) => [...t, { id: uid("U"), name: invite.name.trim(), email: invite.email, role: invite.role, active: true }]);
    setInvite({ name: "", email: "", role: "Creator" }); toast("User added to this preview workspace. No invitation email was sent.", "info");
  }
  function changePassword() {
    const e: typeof errs = {};
    if (!pw.cur) e.cur = "Enter your current password";
    e.next = passwordError(pw.next);
    if (pw.confirm !== pw.next) e.confirm = "Passwords do not match";
    Object.keys(e).forEach((k) => e[k] === undefined && delete e[k]);
    setErrs(e); if (Object.keys(e).length) return;
    setPw({ cur: "", next: "", confirm: "" }); toast("Validated. Password changes are applied once the backend is connected.", "info");
  }
  const flip = (k: string) => setPrefs((x) => ({ ...x, [k]: !x[k] }));

  return (
    <>
      <PageHeader title="Settings" crumbs={[{ label: "Settings" }]} description="Preferences are stored in this browser." />
      <Card>
        <div className="px-4 pt-1"><Tabs<Tab> label="Settings sections" value={tab} onChange={(t) => { setTab(t); setErrs({}); }} tabs={[
          { value: "profile", label: "Profile" }, { value: "workspace", label: "Workspace" }, { value: "users", label: "Users", count: team.length },
          { value: "notifications", label: "Notifications" }, { value: "security", label: "Security" }, { value: "integrations", label: "Integrations" }]} /></div>
        <div className="p-5">
          {tab === "profile" && (<div className="max-w-md space-y-4">
            <Input label="Full name" value={p.name} onChange={(e) => setProfile({ ...p, name: e.target.value })} error={errs.name} />
            <Input label="Email" type="email" value={p.email} onChange={(e) => setProfile({ ...p, email: e.target.value })} error={errs.email} />
            <Select label="Preview role" value={session.role} onChange={(e) => { setSession({ ...session, role: e.target.value as TeamUser["role"] }); toast(`Now previewing as ${e.target.value}`, "info"); }}
              hint="Switch roles to see how permissions change. Admins manage facts and brand, reviewers approve content, creators submit it.">
              <option>Admin</option><option>Creator</option><option>Reviewer</option></Select>
            <Button onClick={saveProfile} disabled={!profile}>Save profile</Button></div>)}

          {tab === "workspace" && (<div className="max-w-md space-y-4">
            <Input label="Workspace name" value={wsName ?? session.workspace} disabled={!admin} onChange={(e) => setWsName(e.target.value)} error={errs.ws} />
            <Button disabled={!admin || wsName === null} onClick={() => { if ((wsName ?? "").trim().length < 2) { setErrs({ ws: "Enter a name" }); return; } setSession({ ...session, workspace: wsName!.trim() }); setWsName(null); setErrs({}); toast("Workspace renamed"); }}>Save workspace</Button>
            {!admin && <p className="text-xs text-ink-500">Only admins can change workspace settings.</p>}</div>)}

          {tab === "users" && (<div>
            <div className="mb-5 grid gap-3 rounded-lg border border-line bg-surface-muted p-4 sm:grid-cols-[1fr_1fr_140px_auto] sm:items-end">
              <Input label="Name" value={invite.name} disabled={!admin} onChange={(e) => setInvite({ ...invite, name: e.target.value })} error={errs.iname} />
              <Input label="Email" value={invite.email} disabled={!admin} onChange={(e) => setInvite({ ...invite, email: e.target.value })} error={errs.iemail} />
              <Select label="Role" value={invite.role} disabled={!admin} onChange={(e) => setInvite({ ...invite, role: e.target.value as TeamUser["role"] })}><option>Creator</option><option>Reviewer</option><option>Admin</option></Select>
              <Button disabled={!admin} onClick={addUser}><Plus className="h-4 w-4" />Add user</Button></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[560px]">
              <thead className="border-b border-line bg-surface-muted"><tr>{["User", "Email", "Role", "Status"].map((h) => <th key={h} scope="col" className="th">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-line">{team.map((u) => (
                <tr key={u.id}><td className="td font-medium">{u.name}</td><td className="td">{u.email}</td>
                  <td className="td"><label><span className="sr-only">Role for {u.name}</span><select disabled={!admin} value={u.role} onChange={(e) => { setTeam((t) => t.map((x) => (x.id === u.id ? { ...x, role: e.target.value as TeamUser["role"] } : x))); toast(`${u.name} is now ${e.target.value}`); }} className="h-8 rounded-md border border-line-strong bg-white px-2 text-[13px] disabled:bg-surface-muted"><option>Admin</option><option>Creator</option><option>Reviewer</option></select></label></td>
                  <td className="td"><button type="button" disabled={!admin} onClick={() => setTeam((t) => t.map((x) => (x.id === u.id ? { ...x, active: !x.active } : x)))} className="disabled:opacity-50">{u.active ? <Badge tone="ok">Active</Badge> : <Badge>Deactivated</Badge>}</button></td></tr>))}</tbody></table></div>
            {!admin && <p className="mt-3 text-xs text-ink-500">Only admins can manage users.</p>}</div>)}

          {tab === "notifications" && (<div className="max-w-lg divide-y divide-line">{NOTIFY.map(([k, l]) => <Toggle key={k} label={l} checked={!!prefs[k]} onChange={() => flip(k)} />)}
            <p className="pt-3 text-xs text-ink-500">Preferences are saved. Delivery starts when the backend is connected.</p></div>)}

          {tab === "security" && (<div className="max-w-md space-y-4">
            <Input label="Current password" type="password" autoComplete="current-password" value={pw.cur} onChange={(e) => setPw({ ...pw, cur: e.target.value })} error={errs.cur} />
            <Input label="New password" type="password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} error={errs.next} hint="At least 10 characters with upper-case, lower-case and a number." />
            <Input label="Confirm new password" type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} error={errs.confirm} />
            <Button onClick={changePassword}>Update password</Button></div>)}

          {tab === "integrations" && (<div className="max-w-lg divide-y divide-line">{INTEGRATIONS.map(([k, l]) => <Toggle key={k} label={`Prefer ${l}`} checked={!!prefs[k]} onChange={() => flip(k)} />)}
            <p className="pt-3 text-xs text-ink-500">These record your preference only. No integration is connected in this preview build.</p></div>)}
        </div>
      </Card>
    </>
  );
}
