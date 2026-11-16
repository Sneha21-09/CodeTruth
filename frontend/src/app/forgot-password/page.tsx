import type { Metadata } from "next";
import { ForgotForm } from "@/components/auth/ForgotForm";

export const metadata: Metadata = { title: "Reset your password", description: "Request password reset instructions for your CodeTruth account.", robots: { index: false, follow: true }, alternates: { canonical: "/forgot-password" } };
export default function Page() { return <ForgotForm />; }
