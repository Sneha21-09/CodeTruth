"use client";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { EMAIL_RE } from "@/lib/session";

export function ContactForm() {
  const [f, setF] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Partial<typeof f>>({});
  const [done, setDone] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    const next: Partial<typeof f> = {};
    if (f.name.trim().length < 2) next.name = "Enter your name";
    if (!EMAIL_RE.test(f.email)) next.email = "Enter a valid email address";
    if (f.message.trim().length < 10) next.message = "Write at least 10 characters";
    setErrors(next);
    if (Object.keys(next).length === 0) setDone(true);
  }

  if (done)
    return (
      <div role="status" className="rounded-lg border border-line bg-surface-muted p-5 text-sm text-ink-800">
        <p className="font-semibold">Thanks, {f.name.split(" ")[0]}.</p>
        <p className="mt-1 text-ink-600">This preview build has no server, so your message was not sent. Contact delivery will be connected with the backend.</p>
      </div>
    );

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Input label="Name" autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} error={errors.name} />
      <Input label="Work email" type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} error={errors.email} />
      <Textarea label="How can we help?" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} error={errors.message} />
      <Button type="submit">Send message</Button>
    </form>
  );
}
