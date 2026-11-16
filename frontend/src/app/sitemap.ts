import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/utils";

// Only public marketing pages. Authenticated /app routes are never listed.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-11-16");
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/sign-up`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];
}
