"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { EMAIL_RE, useSession } from "@/lib/session";
import { AuthShell } from "./AuthShell";

export function SignInForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [, setSession] = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [busy, setBusy] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!EMAIL_RE.test(email)) next.email = "Enter a valid email address";
    if (!password) next.password = "Enter your password";
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    const name = email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    setSession({ name, email, role: "Admin", workspace: "Northwind (sample)" });
    toast("Signed in to preview mode", "info");
    router.push("/app");
  }

  return (
    <AuthShell title="Sign in to CodeTruth" subtitle="Continue to your workspace."
      footer={<>New to CodeTruth? <Link href="/sign-up" className="font-medium text-brand-700 hover:underline">Create an account</Link></>}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <Input label="Work email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <Input label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <div className="text-right"><Link href="/forgot-password" className="text-[13px] font-medium text-brand-700 hover:underline">Forgot password?</Link></div>
        <Button type="submit" className="w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
      </form>
    </AuthShell>
  );
}
