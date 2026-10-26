"use client";

import { useEffect, useRef, useState } from "react";
import { Logo, Mark } from "./brand";
import DemoLaptop from "./DemoLaptop";
import DemoPhone from "./DemoPhone";
import { FAQ } from "./faq";
import PackagesModal from "./PackagesModal";
import { PACKAGE_SETS, type Package, type PackageSet } from "./packages";
import type { Post } from "../app/blog/posts";

// RE5 offers one service for now; every enquiry is about it.
const SERVICE = "Websites & Online Sales";

// "What We Offer" uses the pop-up's own packages and wording, so the two always match.
const WEB = PACKAGE_SETS.find((x) => x.service === SERVICE)!;
const [DIGITAL, ...SITES] = WEB.packages;
// Example sites shown in the laptop previews (fictional businesses, recorded from RE5 demo builds).
const LAPTOP: Record<string, { name: string; url: string; label: string }> = {
  "business-website": { name: "salon-loop", url: "islesalon.com", label: "Example business website for a nail salon: browsing services and booking an appointment" },
  "ecommerce-website": { name: "store-loop", url: "islandheat.shop", label: "Example online store for a pepper sauce brand: adding products to the cart and checking out" },
};

const num = (i: number) => String(i + 1).padStart(2, "0");

export default function HomePage({ posts }: { posts: Post[] }) {
  const [menu, setMenu] = useState(false);
  const [showSticky, setShowSticky] = useState(false);

  // Contact form
  const openedAt = useRef(Date.now());
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [sent, setSent] = useState(false);

  // Packages pop-up and the package chosen from it
  const [openSet, setOpenSet] = useState<PackageSet | null>(null);
  const [focusPkg, setFocusPkg] = useState<string | undefined>();
  const openPackages = (id?: string) => {
    setFocusPkg(id);
    setOpenSet(WEB);
  };
  const [chosen, setChosen] = useState<{ service: string; name: string; consult: boolean } | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);

  const choosePackage = (set: PackageSet, pkg: Package) => {
    setChosen({ service: set.service, name: pkg.name, consult: pkg.cta === "Request a Consultation" });
    setSent(false);
    setOpenSet(null);
    requestAnimationFrame(() => {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 450);
    });
  };


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
          interests: [SERVICE],
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


  return (
    <div className="h" id="top">
      {/* ---------------- Nav ---------------- */}
      <header className="h-nav">
        <a href="#top" className="h-logo" aria-label="RE5 Agency home">
          <Logo />
        </a>
        <nav className="h-links" aria-label="Main">
          <a href="#services">Services</a>
          <a href="/about">About</a>
          <a href="#blog">Education Centre</a>
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
          <a href="/about" onClick={() => setMenu(false)}>About</a>
          <a href="#blog" onClick={() => setMenu(false)}>Education Centre</a>
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
              <h1 id="h-hero-title" className="h-hero-title">
                Helping Caribbean Businesses <span className="h-mark">Thrive in the Digital Economy.</span>
              </h1>
              <p className="h-hero-sub">
                RE5 gives businesses of every size the knowledge, tools and support to adopt digital technology, reach more customers and grow with confidence.
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
              {WEB.title}
            </h2>
            {WEB.intro.map((t) => (
              <p key={t} className="h-edu-intro">
                {t}
              </p>
            ))}
          </div>

          <article className="h-svc">
            <div className="h-svc-text">
              <div className="h-offer-top">
                <span className="h-offer-n">01</span>
                <span className="h-mono">{DIGITAL.name}</span>
                <span className="h-build-price">{DIGITAL.price}</span>
              </div>
              <h3>{DIGITAL.tagline}</h3>
              {DIGITAL.intro.map((t) => (
                <p key={t}>{t}</p>
              ))}
              <div className="h-col-actions">
                <button type="button" className="h-btn h-btn--sm" onClick={() => openPackages(DIGITAL.id)}>
                  See what&rsquo;s included <span aria-hidden="true">→</span>
                </button>
                <a href="/digital/demo" target="_blank" rel="noopener" className="h-link">
                  Try the live demo <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
            <DemoPhone />
          </article>

          <div className="h-sites">
            {SITES.map((p, i) => (
              <article key={p.id} className="h-site">
                <div className="h-offer-top">
                  <span className="h-offer-n">{num(i + 1)}</span>
                  <span className="h-mono">{p.name}</span>
                  <span className="h-build-price">{p.price}</span>
                </div>
                <DemoLaptop {...LAPTOP[p.id]} />
                <h3>{p.tagline}</h3>
                {p.intro.map((t) => (
                  <p key={t}>{t}</p>
                ))}
                <button type="button" className="h-btn h-btn--sm" onClick={() => openPackages(p.id)}>
                  See what&rsquo;s included <span aria-hidden="true">→</span>
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* ---------------- Coming soon ---------------- */}
        <section className="h-soon-band h-pattern" aria-labelledby="h-soon-title">
          <div className="h-soon-card">
            <span className="h-mono">On the way</span>
            <h2 id="h-soon-title">More Services Coming Soon.</h2>
            <p>
              We&rsquo;re starting with websites and online sales, with more ways to help Caribbean businesses grow
              on the way.
            </p>
            <a href="#contact" className="h-link">
              Tell us what your business needs <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section id="faq" className="h-section" aria-labelledby="h-faq-title">
          <div className="h-faq">
            <div className="h-head">
              <span className="h-mono">FAQ</span>
              <h2 id="h-faq-title" className="h-h2">
                Questions, Answered.
              </h2>
              <p className="h-edu-intro">Everything you need to know before we get started.</p>
            </div>
            <div className="h-faq-list">
              {FAQ.map((f) => (
                <details key={f.q} className="h-faq-item">
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
              <a href="#contact" className="h-link h-faq-more">
                Still have questions? Let&rsquo;s talk business <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </section>

        {/* ---------------- Blog ---------------- */}
        <section id="blog" className="h-section h-section--rule" aria-labelledby="h-blog-title">
          <div className="h-head h-head--row">
            <div>
              <span className="h-mono">RE5 Education Centre</span>
              <h2 id="h-blog-title" className="h-h2">Knowledge to Help Your Business Move Forward</h2>
              <p className="h-edu-intro">
                Explore free resources, practical guides, emerging technologies, and opportunities to help your business navigate digital transformation and make informed decisions about its future.
              </p>
            </div>
            <a href="/blog" className="h-link">
              Explore the Education Centre <span aria-hidden="true">→</span>
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
            <a href="#services">{SERVICE}</a>
            <a href="/digital/demo">RE5 Digital</a>
          </div>
          <div className="h-foot-col">
            <span className="h-mono">Company</span>
            <a href="/about">About</a>
            <a href="/blog">Education Centre</a>
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

      <PackagesModal set={openSet} focus={focusPkg} onClose={() => setOpenSet(null)} onChoose={choosePackage} />

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
