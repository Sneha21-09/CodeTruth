"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { EMAIL_RE, passwordError, useSession } from "@/lib/session";
import { AuthShell } from "./AuthShell";

type Errors = Partial<Record<"name" | "email" | "workspace" | "password" | "confirm", string>>;

export function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [, setSession] = useSession();
  const [f, setF] = useState({ name: "", email: "", workspace: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Errors>({});
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  function submit(e: FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (f.name.trim().length < 2) next.name = "Enter your full name";
    if (!EMAIL_RE.test(f.email)) next.email = "Enter a valid email address";
    if (f.workspace.trim().length < 2) next.workspace = "Name your product workspace";
    next.password = passwordError(f.password);
    if (f.confirm !== f.password) next.confirm = "Passwords do not match";
    Object.keys(next).forEach((k) => next[k as keyof Errors] === undefined && delete next[k as keyof Errors]);
    setErrors(next);
    if (Object.keys(next).length) return;
    setSession({ name: f.name.trim(), email: f.email, role: "Admin", workspace: f.workspace.trim() });
    toast("Preview workspace created in this browser", "info");
    router.push("/app");
  }

  return (
    <AuthShell title="Create your account" subtitle="Set up a workspace for your product."
      footer={<>Already have an account? <Link href="/sign-in" className="font-medium text-brand-700 hover:underline">Sign in</Link></>}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <Input label="Full name" autoComplete="name" value={f.name} onChange={set("name")} error={errors.name} />
        <Input label="Work email" type="email" autoComplete="email" value={f.email} onChange={set("email")} error={errors.email} />
        <Input label="Product workspace name" value={f.workspace} onChange={set("workspace")} error={errors.workspace} hint="Usually your product or company name." />
        <Input label="Password" type="password" autoComplete="new-password" value={f.password} onChange={set("password")} error={errors.password} hint="At least 10 characters with upper-case, lower-case and a number." />
        <Input label="Confirm password" type="password" autoComplete="new-password" value={f.confirm} onChange={set("confirm")} error={errors.confirm} />
        <Button type="submit" className="w-full">Create account</Button>
      </form>
    </AuthShell>
  );
}
