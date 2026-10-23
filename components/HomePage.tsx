"use client";

import { useEffect, useRef, useState } from "react";
import { Mark, Spark, Squiggle } from "./brand";
import type { Post } from "../app/blog/posts";

const SERVICES = [
  ["Business Consulting", "Strategy, planning, and operational improvement."],
  ["Marketing & Customer Growth", "Brand development, campaigns, and customer engagement."],
  ["Business & Administrative Support", "Administrative services, customer inquiries, and operational assistance."],
  ["Websites & Online Sales", "Websites, eCommerce, and digital experiences."],
  ["Business Systems & Automation", "CRM, business software, AI, and workflow automation."],
] as const;

// Each of the five gets its own colour block.
const TONES = ["lime", "lavender", "forest", "orange", "plum"] as const;

export default function HomePage({ posts }: { posts: Post[] }) {
  const [menu, setMenu] = useState(false);
  const [showSticky, setShowSticky] = useState(false);

  // Contact form
  const openedAt = useRef(Date.now());
  const [picked, setPicked] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const c = document.getElementById("contact");
      const near = c ? c.getBoundingClientRect().top < window.innerHeight * 0.8 : false;
      setShowSticky(window.scrollY > 500 && !near);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (sending) return;
    const f = new FormData(ev.currentTarget);
    setSending(true);
    setSendError(false);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.get("name"),
          company: f.get("company"),
          email: f.get("email"),
          phone: f.get("phone"),
          interests: picked,
          message: f.get("message"),
          website: f.get("website"),
          elapsed: Date.now() - openedAt.current,
        }),
      });
      if (!res.ok) throw new Error("failed");
      setSent(true);
    } catch {
      setSendError(true);
    } finally {
      setSending(false);
    }
  };

  const toggle = (s: string) => setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  return (
    <div className="h" id="top">
      {/* ---------------- Nav ---------------- */}
      <header className="h-nav">
        <a href="#top" className="h-logo" aria-label="RE5 Agency home">
          <Mark className="h-logo-mark" />
          <span>
            RE<em>5</em> Agency
          </span>
        </a>
        <nav className="h-links" aria-label="Main">
          <a href="#services">Services</a>
          <a href="#blog">Blog</a>
          <a href="#contact" className="h-pill h-pill--lime">
            Let&rsquo;s Talk Business
          </a>
        </nav>
        <button type="button" className="h-menu-btn" aria-expanded={menu} aria-controls="h-menu" onClick={() => setMenu((m) => !m)}>
          {menu ? "Close" : "Menu"}
        </button>
      </header>
      {menu && (
        <nav id="h-menu" className="h-menu" aria-label="Mobile">
          <a href="#services" onClick={() => setMenu(false)}>Services</a>
          <a href="#blog" onClick={() => setMenu(false)}>Blog</a>
          <a href="#contact" className="h-pill h-pill--lime" onClick={() => setMenu(false)}>
            Let&rsquo;s Talk Business
          </a>
        </nav>
      )}

      <main>
        {/* ---------------- Hero ---------------- */}
        <section className="h-hero" aria-labelledby="h-hero-title">
          <div className="h-hero-copy">
            <span className="h-tag h-tag--lime">
              <Spark className="h-tag-icon" /> Business Consulting
            </span>
            <h1 id="h-hero-title" className="h-hero-title">
              More Customers. Better Operations. <span className="h-hl">More Room to Grow.</span>
            </h1>
            <p className="h-hero-sub">
              RE5 helps Caribbean businesses improve marketing, sales, customer management, and operations through
              business consulting, technology, and AI.
            </p>
            <a href="#contact" className="h-btn h-btn--lime">
              Let&rsquo;s Talk Business <span aria-hidden="true">→</span>
            </a>
          </div>
          <div className="h-hero-art" aria-hidden="true">
            <div className="h-tile h-tile--lime h-tile--big">
              <Mark className="h-tile-mark" />
              <span className="h-tile-word">RE5</span>
            </div>
            <div className="h-tile h-tile--lavender">
              <Mark className="h-tile-burst" />
            </div>
            <div className="h-tile h-tile--orange">
              <span className="h-tile-num">05</span>
              <span className="h-tile-small">ways to grow</span>
            </div>
            <div className="h-tile h-tile--plum">
              <Spark className="h-tile-spark" />
            </div>
          </div>
          <Squiggle className="h-hero-squiggle" />
        </section>

        {/* ---------------- Ticker ---------------- */}
        <div className="h-ticker" aria-hidden="true">
          <div className="h-ticker-track">
            {[0, 1].map((r) =>
              SERVICES.map(([t]) => (
                <span key={`${r}-${t}`}>
                  {t}
                  <Spark className="h-ticker-spark" />
                </span>
              ))
            )}
          </div>
        </div>

        {/* ---------------- The RE5 Five ---------------- */}
        <section id="services" className="h-section" aria-labelledby="h-five-title">
          <div className="h-head">
            <span className="h-tag h-tag--forest">
              <Spark className="h-tag-icon" /> The RE5 Five
            </span>
            <h2 id="h-five-title" className="h-h2">
              The Expertise to Make It <span className="h-under">Happen.</span>
            </h2>
          </div>
          <div className="h-five">
            {SERVICES.map(([title, desc], i) => (
              <article key={title} className={`h-card h-card--${TONES[i]}`}>
                <span className="h-card-num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
                {i === 0 && <Mark className="h-card-burst" />}
                {i === 3 && <Mark className="h-card-mark" />}
              </article>
            ))}
            <a href="#contact" className="h-card h-card--cta">
              <span>Explore Our Services</span>
              <span className="h-card-arrow" aria-hidden="true">→</span>
            </a>
          </div>
        </section>

        {/* ---------------- Blog ---------------- */}
        <section id="blog" className="h-section h-section--blog" aria-labelledby="h-blog-title">
          <div className="h-head h-head--row">
            <div>
              <span className="h-tag h-tag--lavender">
                <Spark className="h-tag-icon" /> RE5 Insights
              </span>
              <h2 id="h-blog-title" className="h-h2">Latest from RE5</h2>
            </div>
            <a href="/blog" className="h-link">
              View all posts <span aria-hidden="true">→</span>
            </a>
          </div>
          <div className="h-posts">
            {posts.map((p, i) => (
              <a key={p.slug} href={`/blog/${p.slug}`} className={`h-post h-post--${["forest", "plum", "orange"][i % 3]}`}>
                <div className="h-post-cover">
                  <Mark className="h-post-burst" />
                </div>
                <div className="h-post-body">
                  <span className="h-post-meta">
                    <span>{p.category}</span>
                    <span>{p.readingTime}</span>
                  </span>
                  <h3>{p.title}</h3>
                  <span className="h-post-read">
                    Read article <span aria-hidden="true">→</span>
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ---------------- Contact ---------------- */}
        <section id="contact" className="h-contact" aria-labelledby="h-contact-title">
          <Squiggle className="h-contact-squiggle" />
          <div className="h-contact-inner">
            <div className="h-contact-copy">
              <h2 id="h-contact-title" className="h-contact-title">
                Your Next Move <span className="h-hl">Starts Here.</span>
              </h2>
              <p>One clear priority. A practical plan. The support to make it happen.</p>
              <Mark className="h-contact-burst" />
            </div>
            <div className="h-form-card">
              {!sent ? (
                <form onSubmit={submit} className="h-form">
                  <div className="h-form-grid">
                    <label>
                      Name
                      <input name="name" required autoComplete="name" />
                    </label>
                    <label>
                      Company
                      <input name="company" autoComplete="organization" />
                    </label>
                    <label>
                      Email
                      <input name="email" type="email" required autoComplete="email" />
                    </label>
                    <label>
                      Phone / WhatsApp
                      <input name="phone" type="tel" autoComplete="tel" />
                    </label>
                  </div>
                  <fieldset className="h-chips">
                    <legend>I&rsquo;m interested in</legend>
                    {SERVICES.map(([t], i) => (
                      <button
                        key={t}
                        type="button"
                        aria-pressed={picked.includes(t)}
                        className={`h-chip h-chip--${TONES[i]}`}
                        onClick={() => toggle(t)}
                      >
                        {picked.includes(t) ? "✓ " : ""}
                        {t}
                      </button>
                    ))}
                  </fieldset>
                  <label>
                    Tell us about your plans
                    <textarea name="message" rows={4} />
                  </label>
                  <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="h-hp" />
                  <button type="submit" className="h-btn h-btn--ink h-btn--full" disabled={sending}>
                    {sending ? "Sending…" : "Start a Conversation →"}
                  </button>
                  {sendError && (
                    <p className="h-form-error" role="alert">
                      Something went wrong sending that. Please try again.
                    </p>
                  )}
                  <p className="h-form-note">
                    We only use these details to reply to your enquiry. See our <a href="/privacy">privacy policy</a>.
                  </p>
                </form>
              ) : (
                <div className="h-sent" role="status">
                  <span className="h-sent-tick" aria-hidden="true">✓</span>
                  <h3>Thanks, we&rsquo;ll be in touch.</h3>
                  <p>The RE5 team will reach out within one business day.</p>
                  <button
                    type="button"
                    className="h-btn h-btn--outline"
                    onClick={() => {
                      setSent(false);
                      setPicked([]);
                      openedAt.current = Date.now();
                    }}
                  >
                    Send another message
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* ---------------- Footer ---------------- */}
      <footer className="h-foot">
        <div className="h-foot-grid">
          <div className="h-foot-brand">
            <a href="#top" className="h-logo h-logo--light" aria-label="RE5 Agency home">
              <Mark className="h-logo-mark" />
              <span>
                RE<em>5</em> Agency
              </span>
            </a>
            <p>Business Consulting</p>
          </div>
          <div className="h-foot-col">
            <span className="h-foot-label">Services</span>
            {SERVICES.map(([t]) => (
              <a key={t} href="#services">
                {t}
              </a>
            ))}
          </div>
          <div className="h-foot-col">
            <span className="h-foot-label">Company</span>
            <a href="/blog">Blog</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="h-foot-col">
            <span className="h-foot-label">Get in Touch</span>
            <span>Trinidad &amp; Tobago</span>
            <a href="#contact" className="h-pill h-pill--lime">
              Let&rsquo;s Talk Business →
            </a>
          </div>
        </div>
        <div className="h-foot-base">
          <span>
            &copy; {new Date().getFullYear()} RE5 Agency. All rights reserved. <a href="/privacy">Privacy Policy</a>
          </span>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>

      {showSticky && !menu && (
        <div className="h-sticky">
          <a href="#contact" className="h-btn h-btn--lime">
            Let&rsquo;s Talk Business →
          </a>
        </div>
      )}
    </div>
  );
}
