"use client";
import { useLocalStorage } from "./useLocalStorage";

export type PreviewSession = { name: string; email: string; role: "Admin" | "Creator" | "Reviewer"; workspace: string } | null;
export const SESSION_KEY = "ct.session";

export function useSession() {
  return useLocalStorage<PreviewSession>(SESSION_KEY, null);
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function passwordError(pw: string): string | undefined {
  if (pw.length < 10) return "Use at least 10 characters";
  if (!/[a-z]/.test(pw) || !/[A-Z]/.test(pw) || !/\d/.test(pw)) return "Include upper-case, lower-case and a number";
  return undefined;
}
