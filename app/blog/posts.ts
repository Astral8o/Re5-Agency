// Blog posts, newest first. Each post's content lives in its own folder under app/blog.
export type Post = {
  slug: string;
  number: string;
  title: string;
  description: string;
  category: string;
  readingTime: string;
  published: string; // ISO date
  cover: string;
};

export const POSTS: Post[] = [
  {
    slug: "caribbean-businesses-market-regionally-internationally",
    number: "002",
    title: "Beyond Your Borders: How Caribbean Businesses Can Position and Market Themselves Regionally and Internationally",
    description:
      "An evidence-based guide to finding new markets, attracting international customers, and preparing your business to compete beyond your home country.",
    category: "Growth & New Markets",
    readingTime: "15 minutes",
    published: "2026-11-01",
    cover: "#D39BE0",
  },
  {
    slug: "digital-transformation-small-businesses-trinidad-tobago",
    number: "001",
    title: "Digital Transformation for Small Businesses in Trinidad and Tobago: Where Should You Start?",
    description:
      "Digital transformation doesn't have to happen all at once. Here's what it means, how it supports growth, what it costs and where your business can start.",
    category: "Digital Transformation & Business Growth",
    readingTime: "5 minutes",
    published: "2026-10-22",
    cover: "#D39BE0",
  },
];

export const postUrl = (slug: string) => `/blog/${slug}`;
