import type { MetadataRoute } from "next";
import { POSTS } from "./blog/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://www.re5agency.com", changeFrequency: "monthly", priority: 1 },
    { url: "https://www.re5agency.com/blog", changeFrequency: "weekly", priority: 0.6 },
    ...POSTS.map((p) => ({
      url: `https://www.re5agency.com/blog/${p.slug}`,
      lastModified: p.published,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: "https://www.re5agency.com/tools/website-blueprint", changeFrequency: "monthly", priority: 0.8 },
    { url: "https://www.re5agency.com/privacy", changeFrequency: "yearly", priority: 0.2 },
  ];
}
