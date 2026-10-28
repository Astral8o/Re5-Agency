"use client";

import { useEffect, useRef, useState } from "react";
import { Logo, Mark } from "./brand";
import DemoLaptop from "./DemoLaptop";
import DemoPhone from "./DemoPhone";
import { FAQ_GROUPS } from "./faq";
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
  "business-website": { name: "hair-loop", url: "lumierehair.com", label: "Example business website for a hair supplier: browsing the collection, applying for a wholesale account and finding the showroom" },
  "ecommerce-website": { name: "store-loop", url: "islandheat.shop", label: "Example online store for a pepper sauce brand: adding products to the cart and checking out" },
};

const num = (i: number) => String(i + 1).padStart(2, "0");

// Simple line icons (24px grid) for the goal and approach cards.
const ICON: Record<string, string> = {
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-9 9h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z",
  bag: "M6 8h12l-1 12H7L6 8Zm3 0V6a3 3 0 0 1 6 0v2",
  megaphone: "M4 10v4h3l7 4V6L7 10H4Zm14-1a4 4 0 0 1 0 6M7 14l1 5h2l-1-5",
  gear: "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm7.4 3a7.4 7.4 0 0 0-.1-1.3l2-1.6-2-3.4-2.4 1a7.5 7.5 0 0 0-2.2-1.3L14.4 3h-4.8l-.3 2.4a7.5 7.5 0 0 0-2.2 1.3l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.6l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 0 0 2.2 1.3l.3 2.4h4.8l.3-2.4a7.5 7.5 0 0 0 2.2-1.3l2.4 1 2-3.4-2-1.6c.1-.4.1-.9.1-1.3Z",
  chat: "M4 5h12v8H8l-4 3V5Zm16 4v9l-3-2h-7v-3",
  bulb: "M9 18h6m-5 3h4M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3Z",
  wrench: "M14.5 5.5a4 4 0 0 0 5 5L12 18l-3 3-3-3 3-3 7.5-7.5a4 4 0 0 1-2-2Z",
  cap: "M2 9l10-5 10 5-10 5L2 9Zm4 2v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5",
  ear: "M7 9a5 5 0 0 1 10 0c0 3-3 4-3 7a3 3 0 0 1-6 0m2-7a2 2 0 0 1 4 0",
  puzzle: "M10 3h4v3a2 2 0 1 0 4 0V6h3v5h-3a2 2 0 1 0 0 4h3v6h-5v-3a2 2 0 1 0-4 0v3H3v-6h3a2 2 0 1 0 0-4H3V6h7V3Z",
  hand: "M3 12l4-4 4 2 3-2 7 5-4 4-3-2-2 2-3-2-2 1-4-4Zm8-2 4 3",
  compass: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm3.5 5.5-2 5-5 2 2-5 5-2Z",
};
const Icon = ({ name }: { name: string }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={ICON[name]} />
  </svg>
);
const GOALS = [
  ["globe", "Build Your Online Presence", "Make it easier for customers to discover and learn about your business."],
  ["bag", "Sell Your Products Online", "Give customers convenient ways to browse, enquire and order."],
  ["megaphone", "Reach More Customers", "Explore ways to build awareness and connect with your market."],
  ["gear", "Improve How You Work", "Explore technology and AI to support everyday business operations."],
] as const;
const WHY = [
  ["ear", "We Listen First", "Understanding before recommending."],
  ["puzzle", "Solutions That Fit", "Based on your actual business needs."],
  ["hand", "One Point of Contact", "Clear communication throughout."],
  ["compass", "Built for Your Goals", "Decisions guided by what you want to achieve."],
] as const;
const STEPS = [
  ["Discover", "Get to know your business and goals."],
  ["Define", "Identify needs and priorities."],
  ["Recommend", "Agree on the right solution."],
  ["Develop", "Build and review the solution."],
  ["Launch & Handover", "Test, launch and guide you."],
] as const;

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
  const [faqTab, setFaqTab] = useState(FAQ_GROUPS[0].id);
  const [siteDemo, setSiteDemo] = useState<string>(SITES[0].id);
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


  // How We Work: fill each dot of the path as it scrolls into view.
  useEffect(() => {
    const items = document.querySelectorAll(".h-path li");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((el) => el.classList.add("is-on"));
      return;
    }
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add("is-on"), io.unobserve(e.target))),
      { rootMargin: "0px 0px -20% 0px" }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
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
          <a href="#services">Solutions</a>
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
          <a href="#services" onClick={() => setMenu(false)}>Solutions</a>
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
              <div className="h-hero-cta">
                <a href="#services" className="h-btn h-btn--lg">
                  Explore Our Solutions <span aria-hidden="true">→</span>
                </a>
                <a href="#contact" className="h-btn h-btn--lg h-btn--ghost">
                  Let&rsquo;s Talk Business
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- Goals ---------------- */}
        <section className="h-section h-goals" aria-labelledby="h-goals-title">
          <div className="h-center-head">
            <span className="h-mono h-kicker">What We Help You Achieve</span>
            <h2 id="h-goals-title" className="h-h2">Where Would You Like to Take Your Business?</h2>
            <p className="h-edu-intro">Explore the possibilities for your business.</p>
          </div>
          <div className="h-goal-grid">
            {GOALS.map(([, t, d], i) => (
              <div key={t} className="h-goal">
                <span className="h-offer-n">{num(i)}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- Solutions ---------------- */}
        <section id="services" className="h-section h-section--rule" aria-labelledby="h-sol-title">
          <div className="h-center-head">
            <span className="h-mono h-kicker">Our Solutions</span>
            <h2 id="h-sol-title" className="h-h2">Practical Solutions for Your Next Move.</h2>
            <p className="h-edu-intro">Start with the services available today.</p>
          </div>
          <div className="h-sol-grid">
            <article className="h-sol">
              <div className="h-sol-top">
                <span className="h-mono">01 / {DIGITAL.name}</span>
                <span className="h-avail">Available</span>
              </div>
              <div className="h-sol-media h-sol-media--phone">
                <DemoPhone />
              </div>
              <h3>{DIGITAL.tagline}</h3>
              <p>Give customers a convenient way to explore your menu, choose what they want, and send orders through WhatsApp.</p>
              <button type="button" className="h-sol-link" onClick={() => openPackages(DIGITAL.id)}>
                Explore {DIGITAL.name} <span aria-hidden="true">→</span>
              </button>
            </article>
            <article className="h-sol h-sol--peach">
              <div className="h-sol-top">
                <span className="h-mono">02 / {SERVICE}</span>
                <span className="h-avail">Available</span>
              </div>
              <div className="h-sol-media">
                <div className="h-sol-tabs" role="group" aria-label="Example websites">
                  {SITES.map((p) => (
                    <button key={p.id} type="button" aria-pressed={siteDemo === p.id} className={siteDemo === p.id ? "on" : ""} onClick={() => setSiteDemo(p.id)}>
                      {p.name}
                    </button>
                  ))}
                </div>
                <DemoLaptop key={siteDemo} {...LAPTOP[siteDemo]} />
              </div>
              <h3>Build Your Presence. Open New Opportunities.</h3>
              <p>From business websites and searchable product catalogues to online stores, create a better way for customers to find you and do business with you.</p>
              <div className="h-sol-links">
                {SITES.map((p) => (
                  <button key={p.id} type="button" className="h-sol-link" onClick={() => openPackages(p.id)}>
                    {p.name} <span aria-hidden="true">→</span>
                  </button>
                ))}
              </div>
            </article>
          </div>
          <div className="h-more">
            <h3>
              <span aria-hidden="true">⊕</span> More Solutions on the Way
            </h3>
            <p>As RE5 grows, we&rsquo;ll introduce additional ways to support Caribbean businesses.</p>
          </div>
        </section>

        {/* ---------------- How we work ---------------- */}
        <section className="h-section h-section--rule" aria-labelledby="h-how-title">
          <div className="h-head h-how-head">
            <span className="h-mono h-kicker">How We Work</span>
            <h2 id="h-how-title" className="h-h2">From Conversation to Solution.</h2>
            <p className="h-edu-intro">Every business has different needs. We take the time to understand yours and develop solutions that fit your goals.</p>
            <p className="h-how-note">
              <Mark className="h-how-mark" /> Five dots, five steps.
            </p>
          </div>
          {/* The five steps echo the five dots of the RE5 mark; each dot fills as it scrolls into view. */}
          <ol className="h-path">
            {STEPS.map(([t, d], i) => (
              <li key={t} style={{ ["--i" as string]: i }}>
                <span className="h-path-dot">{num(i)}</span>
                <div>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------------- Why RE5 ---------------- */}
        <section className="h-section h-approach" aria-labelledby="h-why-title">
          <div className="h-approach-inner">
            <div className="h-head">
              <span className="h-mono h-kicker">Why RE5</span>
              <h2 id="h-why-title" className="h-h2">More Than Just a Digital Solution.</h2>
            </div>
            <div className="h-approach-grid">
              {WHY.map(([icon, t, d]) => (
                <div key={t} className="h-approach-item">
                  <span className="h-approach-icon"><Icon name={icon} /></span>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Blog ---------------- */}
        <section id="blog" className="h-section h-edu" aria-labelledby="h-blog-title">
          <div className="h-head h-head--row">
            <div>
              <span className="h-mono h-kicker">RE5 Education</span>
              <h2 id="h-blog-title" className="h-h2">Learn What AI Can Do for Your Business.</h2>
              <p className="h-edu-intro">
                Discover free guides, tutorials, and practical resources to help you understand AI and use it in your business.
              </p>
            </div>
            <a href="/blog" className="h-link">
              Explore Free Resources <span aria-hidden="true">→</span>
            </a>
          </div>
          <div className="h-posts">
            {posts.map((p) => (
              <a key={p.slug} href={`/blog/${p.slug}`} className="h-panel h-post">
                <div className="h-post-cover">
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

        {/* ---------------- FAQ ---------------- */}
        <section id="faq" className="h-section" aria-labelledby="h-faq-title">
          <div className="h-faq">
            <div className="h-head">
              <span className="h-mono h-kicker">Questions, Answered</span>
              <h2 id="h-faq-title" className="h-h2">
                Good Questions Deserve Clear Answers.
              </h2>
            </div>
            <div className="h-faq-list">
              <div className="h-faq-tabs" role="tablist" aria-label="FAQ topics">
                {FAQ_GROUPS.map((g) => (
                  <button key={g.id} type="button" role="tab" id={`faq-tab-${g.id}`} aria-selected={faqTab === g.id} aria-controls="faq-panel" className={faqTab === g.id ? "on" : ""} onClick={() => setFaqTab(g.id)}>
                    {g.label}
                  </button>
                ))}
              </div>
              <div id="faq-panel" role="tabpanel" aria-labelledby={`faq-tab-${faqTab}`} className="h-faq-panel">
              {FAQ_GROUPS.find((g) => g.id === faqTab)!.items.map((f) => (
                <details key={faqTab + f.q} className="h-faq-item">
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
              </div>
              <a href="#contact" className="h-link h-faq-more">
                Still have questions? Let&rsquo;s talk business <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </section>

        {/* ---------------- Contact ---------------- */}
        <section id="contact" className="h-contact h-pattern" aria-labelledby="h-contact-title">
          <div className="h-contact-inner">
            <div className="h-panel h-panel--coral h-contact-copy">
              <span className="h-mono">Let&rsquo;s Talk Business</span>
              <h2 id="h-contact-title" className="h-contact-title">
                Your Next Move Starts Here.
              </h2>
              <p>Tell us about your business, what you&rsquo;re working towards, and where you need support.</p>
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
                    {chosen?.consult ? "Tell us about your business and what you'd like to connect" : "Tell us about your business and what you'd like to achieve"}
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
            <p>Taking Your Business to the Next Level.</p>
          </div>
          <div className="h-foot-col">
            <span className="h-mono">Explore</span>
            <a href="#services">Solutions</a>
            <a href="/blog">Education Centre</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="h-foot-col">
            <span className="h-mono">Company</span>
            <a href="/about">About RE5</a>
            <a href="#contact">Contact</a>
            <a href="/privacy">Privacy Policy</a>
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
