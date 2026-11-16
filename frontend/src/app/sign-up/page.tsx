import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata: Metadata = { title: "Create your account", description: "Create a CodeTruth workspace and start verifying product claims against your product facts.", alternates: { canonical: "/sign-up" } };
export default function Page() { return <SignUpForm />; }
