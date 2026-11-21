import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "./globals.css";
import { SITE_URL } from "@/lib/utils";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "CodeTruth | Verify product claims against your actual product", template: "%s | CodeTruth" },
  description:
    "CodeTruth checks marketing content against facts extracted from your product configuration, so inaccurate claims, premature announcements and outdated numbers are caught before publication.",
  applicationName: "CodeTruth",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website", siteName: "CodeTruth", url: "/",
    title: "CodeTruth | Verify product claims against your actual product",
    description: "Style checkers read words. CodeTruth reads the product.",
  },
  twitter: { card: "summary_large_image", title: "CodeTruth", description: "Style checkers read words. CodeTruth reads the product." },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#1f5bd0", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ ["--font-sans" as string]: "'Inter Variable'" }}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:shadow-pop">
          Skip to content
        </a>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
