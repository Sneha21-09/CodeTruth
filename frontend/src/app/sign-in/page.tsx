import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata: Metadata = { title: "Sign in", description: "Sign in to your CodeTruth workspace.", robots: { index: false, follow: true }, alternates: { canonical: "/sign-in" } };
export default function Page() { return <SignInForm />; }
