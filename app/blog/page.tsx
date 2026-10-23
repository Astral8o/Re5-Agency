import type { Metadata } from "next";
import BlogChrome, { Mark } from "./Chrome";
import { POSTS, postUrl } from "./posts";

export const metadata: Metadata = {
  title: "Blog | RE5 Agency",
  description: "RE5 Insights: practical ideas on digital transformation and business growth for Caribbean businesses.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  return (
    <BlogChrome>
      <main className="bl-index">
        <div className="bl-index-head">
          <span className="bl-mono" style={{ color: "#8A2FA3" }}>
            RE5 Insights
          </span>
          <h1>Latest from RE5</h1>
        </div>
        <div className="bl-grid">
          {POSTS.map((p) => (
            <a key={p.slug} href={postUrl(p.slug)} className="bl-card">
              <div className="bl-cover" style={{ background: p.cover }}>
                <Mark color="#E59BFA" />
              </div>
              <div className="bl-meta bl-mono">
                <span>{p.category}</span>
                <span>{p.readingTime}</span>
              </div>
              <h2>{p.title}</h2>
            </a>
          ))}
        </div>
      </main>
    </BlogChrome>
  );
}
