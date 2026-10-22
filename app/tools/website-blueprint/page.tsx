import type { Metadata } from "next";
import BlogChrome from "../../blog/Chrome";
import Planner from "./Planner";
import "./planner.css";

export const metadata: Metadata = {
  title: "Free Website Blueprint Planner | RE5 Agency",
  description:
    "Plan your one-page portfolio website before you build it with AI. Find your brand voice, write your content, organise your photos and download your free Website Blueprint PDF.",
  alternates: { canonical: "/tools/website-blueprint" },
};

// /tools/website-blueprint            standalone page with the site header and footer
// /tools/website-blueprint?embed=1    bare planner for an iframe inside a blog post
export default async function Page({ searchParams }: { searchParams: Promise<{ embed?: string }> }) {
  const { embed } = await searchParams;
  if (embed === "1") return <Planner embed />;
  return (
    <BlogChrome>
      <main className="bp-page">
        <Planner />
      </main>
    </BlogChrome>
  );
}
