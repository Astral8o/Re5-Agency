"use client";

import { useEffect, useRef, useState } from "react";
import { Logo, Mark } from "./brand";
import PackagesModal from "./PackagesModal";
import { PACKAGE_SETS, type Package, type PackageSet } from "./packages";
import type { Post } from "../app/blog/posts";

const SERVICES = [
  ["Marketing & Customer Growth", "Brand development, campaigns, and customer engagement."],
  ["Websites & Online Sales", "Websites, eCommerce, and digital experiences."],
  ["Virtual Assistant", "Customer messages, admin, and everyday business tasks."],
] as const;

// "What We Offer" section. Each button opens the contact form with that service already picked.
const OFFERS = [
  {
    label: "Marketing & Customer Growth",
    title: "Get Seen. Attract Customers. Grow Your Business.",
    body: "We develop marketing strategies, manage social media, and create campaigns that help businesses reach customers and increase sales.",
  },
  {
    label: "Websites & Online Sales",
    title: "Sell Online. Answer Faster. Run It All in One Place.",
    body: "From your website or RE5 Digital page to the messages, orders, and customers it brings in, we set up everything you need to sell online and manage it from one simple dashboard.",
  },
  {
    label: "Virtual Assistant",
    title: "Your Extra Pair of Hands.",
    body: "Focus on running your business while a trained RE5 virtual assistant handles customer messages, admin, and the day-to-day tasks that eat up your time.",
  },
] as const;

const num = (i: number) => String(i + 1).padStart(2, "0");

export default function HomePage({ posts }: { posts: Post[] }) {
  const [menu, setMenu] = useState(false);
  const [showSticky, setShowSticky] = useState(false);

  // Contact form
  const openedAt = useRef(Date.now());
  const [picked, setPicked] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [sent, setSent] = useState(false);

  // Packages pop-up and the package chosen from it
  const [openSet, setOpenSet] = useState<PackageSet | null>(null);
  const [chosen, setChosen] = useState<{ service: string; name: string; consult: boolean } | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);

  const choosePackage = (set: PackageSet, pkg: Package) => {
    setChosen({ service: set.service, name: pkg.name, consult: pkg.cta === "Request a Consultation" });
    setPicked((p) => (p.includes(set.service) ? p : [...p, set.service]));
    setSent(false);
    setOpenSet(null);
    requestAnimationFrame(() => {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 450);
    });
  };

  // Links like /?interest=automation#contact arrive with that service already picked.
  useEffect(() => {
    const map: Record<string, string> = {
      automation: "Websites & Online Sales",
      assistant: "Virtual Assistant",
      marketing: "Marketing & Customer Growth",
      websites: "Websites & Online Sales",
    };
    const pick = map[new URLSearchParams(window.location.search).get("interest") ?? ""];
    if (pick) setPicked((p) => (p.includes(pick) ? p : [...p, pick]));
  }, []);

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
          package: chosen ? `${chosen.name} (${chosen.service})${chosen.consult ? ", consultation request" : ""}` : "",
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
          <Logo />
        </a>
        <nav className="h-links" aria-label="Main">
          <a href="#services">Services</a>
          <a href="#blog">Blog</a>
          <a href="#contact" className="h-btn h-btn--sm">
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
          <a href="#contact" className="h-btn" onClick={() => setMenu(false)}>
            Let&rsquo;s Talk Business →
          </a>
        </nav>
      )}

      <main>
        {/* ---------------- Hero ---------------- */}
        <section className="h-hero h-pattern" aria-labelledby="h-hero-title">
          <div className="h-panel h-hero-panel">
            <div className="h-hero-main">
              <span className="h-mono">RE5 Agency / Business Consulting</span>
              <h1 id="h-hero-title" className="h-hero-title">
                More Customers. Better Operations. <span className="h-mark">More Room to Grow.</span>
              </h1>
              <p className="h-hero-sub">
                RE5 helps Caribbean businesses improve marketing, sales, customer management, and operations through
                business consulting, technology, and AI.
              </p>
              <a href="#contact" className="h-btn h-btn--lg">
                Let&rsquo;s Talk Business <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </section>

        {/* ---------------- What We Offer ---------------- */}
        <section id="services" className="h-section" aria-labelledby="h-five-title">
          <div className="h-head">
            <span className="h-mono">What We Offer</span>
            <h2 id="h-five-title" className="h-h2">
              The Expertise to Make It Happen.
            </h2>
          </div>
          <div className="h-five h-five--offers">
            {OFFERS.map((o, i) => (
              <article key={o.label} className="h-col">
                <div className="h-col-text">
                  <span className="h-mono h-col-label">
                    {num(i)}. {o.label}
                  </span>
                  <h3>{o.title}</h3>
                  <p>{o.body}</p>
                  <div className="h-col-actions">
                    <button
                      type="button"
                      className="h-btn h-btn--sm"
                      onClick={() => setOpenSet(PACKAGE_SETS.find((x) => x.service === o.label) ?? null)}
                    >
                      See Packages <span aria-hidden="true">→</span>
                    </button>
                    {o.label === "Websites & Online Sales" && (
                      <a href="/digital/demo" target="_blank" rel="noopener" className="h-link">
                        See RE5 Digital demo <span aria-hidden="true">↗</span>
                      </a>
                    )}
                    {o.label === "Websites & Online Sales" && (
                      <a href="/see-ai-in-action" className="h-link">
                        See the Dashboard in action <span aria-hidden="true">→</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="h-col-bar" style={{ height: `${70 + i * 40}px` }}>
                  <span>{num(i)}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ---------------- Blog ---------------- */}
        <section id="blog" className="h-section h-section--rule" aria-labelledby="h-blog-title">
          <div className="h-head h-head--row">
            <div>
              <span className="h-mono">RE5 Insights</span>
              <h2 id="h-blog-title" className="h-h2">Latest from RE5</h2>
            </div>
            <a href="/blog" className="h-link">
              View all posts <span aria-hidden="true">→</span>
            </a>
          </div>
          <div className="h-posts">
            {posts.map((p) => (
              <a key={p.slug} href={`/blog/${p.slug}`} className="h-panel h-post">
                <div className="h-post-cover h-pattern">
                  <Mark className="h-post-mark" />
                </div>
                <div className="h-post-body">
                  <span className="h-mono">
                    {p.category} · {p.readingTime}
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
        <section id="contact" className="h-contact h-pattern" aria-labelledby="h-contact-title">
          <div className="h-contact-inner">
            <div className="h-panel h-panel--coral h-contact-copy">
              <span className="h-mono">Contact</span>
              <h2 id="h-contact-title" className="h-contact-title">
                Your Next Move Starts Here.
              </h2>
              <p>One clear priority. A practical plan. The support to make it happen.</p>
              <Mark className="h-contact-mark" />
            </div>
            <div className="h-panel h-form-card">
              {!sent ? (
                <form onSubmit={submit} className="h-form">
                  {chosen && (
                    <div className="h-chosen" role="status">
                      <span>
                        <span className="h-mono">{chosen.consult ? "Consultation request" : "Selected package"}</span>
                        <strong>{chosen.name}</strong>
                      </span>
                      <button type="button" className="h-chosen-x" onClick={() => setChosen(null)} aria-label="Remove selected package">
                        ✕
                      </button>
                    </div>
                  )}
                  <div className="h-form-grid">
                    <label>
                      Name
                      <input name="name" required autoComplete="name" ref={nameRef} />
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
                    {SERVICES.map(([t]) => (
                      <button key={t} type="button" aria-pressed={picked.includes(t)} className="h-chip" onClick={() => toggle(t)}>
                        {picked.includes(t) ? "✓ " : ""}
                        {t}
                      </button>
                    ))}
                  </fieldset>
                  <label>
                    {chosen?.consult ? "Tell us about your business and what you'd like to connect" : "Tell us about your plans"}
                    <textarea name="message" rows={4} />
                  </label>
                  <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="h-hp" />
                  <button type="submit" className="h-btn h-btn--lg h-btn--full" disabled={sending}>
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
                    className="h-btn h-btn--ghost"
                    onClick={() => {
                      setSent(false);
                      setPicked([]);
                      setChosen(null);
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
            <a href="#top" className="h-logo" aria-label="RE5 Agency home">
              <Logo />
            </a>
            <p>Business Consulting</p>
          </div>
          <div className="h-foot-col">
            <span className="h-mono">Services</span>
            {SERVICES.map(([t]) => (
              <a key={t} href="#services">
                {t}
              </a>
            ))}
          </div>
          <div className="h-foot-col">
            <span className="h-mono">Company</span>
            <a href="/blog">Blog</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="h-foot-col">
            <span className="h-mono">Get in Touch</span>
            <span>Trinidad &amp; Tobago</span>
            <a href="#contact" className="h-btn h-btn--sm">
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

      <PackagesModal set={openSet} onClose={() => setOpenSet(null)} onChoose={choosePackage} />

      {showSticky && !menu && !openSet && (
        <div className="h-sticky">
          <a href="#contact" className="h-btn h-btn--lg">
            Let&rsquo;s Talk Business →
          </a>
        </div>
      )}
    </div>
  );
}
