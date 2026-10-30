import type { Metadata } from "next";
import BlogChrome, { Mark } from "./Chrome";
import { POSTS, postUrl } from "./posts";

export const metadata: Metadata = {
  title: "RE5 Education Centre | RE5 Agency",
  description: "Explore free resources, practical guides, emerging technologies, and opportunities to help your business navigate digital transformation and make informed decisions about its future.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  return (
    <BlogChrome>
      <main className="bl-index">
        <div className="bl-index-head">
          <span className="bl-mono" style={{ color: "#5d4a60" }}>
            RE5 Education Centre
          </span>
          <h1>Knowledge to Help Your Business Move Forward</h1>
          <p className="bl-index-intro">Explore free resources, practical guides, emerging technologies, and opportunities to help your business navigate digital transformation and make informed decisions about its future.</p>
        </div>
        <div className="bl-grid">
          {POSTS.map((p) => (
            <a key={p.slug} href={postUrl(p.slug)} className="bl-card">
              <div className="bl-cover" style={{ background: p.cover }}>
                <Mark color="#2a0f2e" />
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
