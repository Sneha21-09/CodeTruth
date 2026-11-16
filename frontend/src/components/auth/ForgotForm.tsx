"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { EMAIL_RE } from "@/lib/session";
import { AuthShell } from "./AuthShell";

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [done, setDone] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) { setError("Enter a valid email address"); return; }
    setError(undefined);
    setDone(true);
  }

  return (
    <AuthShell title="Reset your password" subtitle="Enter your email and we will send reset instructions."
      footer={<Link href="/sign-in" className="font-medium text-brand-700 hover:underline">← Back to sign in</Link>}>
      {done ? (
        <div role="status" className="rounded-md border border-line bg-surface-muted p-4 text-sm text-ink-800">
          <p className="font-medium">Request recorded for {email}</p>
          <p className="mt-1 text-ink-600">No email was sent because this preview build has no mail service. Password reset will work once the backend is connected.</p>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4">
          <Input label="Work email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
          <Button type="submit" className="w-full">Send reset instructions</Button>
        </form>
      )}
    </AuthShell>
  );
}
