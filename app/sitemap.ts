import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://www.re5agency.com", changeFrequency: "monthly", priority: 1 },
    { url: "https://www.re5agency.com/privacy", changeFrequency: "yearly", priority: 0.2 },
  ];
}
