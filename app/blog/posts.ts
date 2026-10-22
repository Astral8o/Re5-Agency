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
    slug: "digital-transformation-small-businesses-trinidad-tobago",
    number: "001",
    title: "Digital Transformation for Small Businesses in Trinidad and Tobago: Where Should You Start?",
    description:
      "Digital transformation doesn't have to happen all at once. Here's what it means, how it supports growth, what it costs and where your business can start.",
    category: "Digital Transformation & Business Growth",
    readingTime: "5 minutes",
    published: "2026-10-22",
    cover:
      "radial-gradient(60% 70% at 25% 30%, #007750 0%, rgba(0,119,80,0) 72%), radial-gradient(55% 60% at 85% 85%, #A7C68C 0%, rgba(167,198,140,0) 70%), #0D1410",
  },
];

export const postUrl = (slug: string) => `/blog/${slug}`;
