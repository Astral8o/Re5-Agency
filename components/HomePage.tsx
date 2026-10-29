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

const GOALS = [
  ["globe", "Build Your Online Presence", "Make it easier for customers to discover and learn about your business."],
  ["bag", "Sell Your Products Online", "Give customers convenient ways to browse, enquire and order."],
  ["megaphone", "Reach More Customers", "Explore ways to build awareness and connect with your market."],
  ["gear", "Improve How You Work", "Explore technology and AI to support everyday business operations."],
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
        <div className="h-wrap h-nav-in">
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
        </div>
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
          <div className="h-wrap">
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
            <figure className="h-hero-media">
              <picture>
                <source srcSet="/home/goal-ordering.webp" type="image/webp" />
                <img src="/home/goal-ordering.jpg" alt="A restaurant menu on a phone with orders sent through WhatsApp" width={1200} height={800} fetchPriority="high" />
              </picture>
            </figure>
          </div>
          </div>
        </section>

        {/* ---------------- Goals ---------------- */}
        <section className="h-sec" aria-labelledby="h-goals-title">
          <div className="h-wrap">
          <div className="h-sec-head h-sec-head--solo">
            <div className="h-sec-title">
              <span className="h-mono h-kicker">What We Help You Achieve</span>
              <h2 id="h-goals-title" className="h-h2">Where Would You Like to Take Your Business?</h2>
              <p className="h-lead">Explore the possibilities for your business.</p>
            </div>
          </div>
          <div className="h-goal-grid">
            {GOALS.map(([, t, d], i) => (
              <div key={t} className="h-card h-goal">
                <span className="h-num">{num(i)}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
          </div>
        </section>

        {/* ---------------- Solutions ---------------- */}
        <section id="services" className="h-sec h-sec--tint" aria-labelledby="h-sol-title">
          <div className="h-wrap">
          <div className="h-sec-head h-sec-head--solo">
            <div className="h-sec-title">
              <span className="h-mono h-kicker">Our Solutions</span>
              <h2 id="h-sol-title" className="h-h2">Practical Solutions for Your Next Move.</h2>
            </div>
          </div>
          <div className="h-sol-grid">
            <article className="h-card h-sol">
              <div className="h-sol-media">
                <DemoPhone />
              </div>
              <div className="h-sol-body">
                <div className="h-sol-top">
                  <span className="h-mono">01 / {DIGITAL.name}</span>
                  <span className="h-avail">Available</span>
                </div>
                <h3>{DIGITAL.tagline}</h3>
                <p>Give customers a convenient way to explore your menu, choose what they want, and send orders through WhatsApp.</p>
                <button type="button" className="h-btn h-sol-cta" onClick={() => openPackages(DIGITAL.id)} aria-label={`See what's included in ${DIGITAL.name}`}>
                  See what&rsquo;s included <span aria-hidden="true">→</span>
                </button>
              </div>
            </article>
            <article className="h-card h-sol">
              <div className="h-sol-media h-sol-media--grey">
                <div className="h-seg" role="group" aria-label="Example websites">
                  {SITES.map((p) => (
                    <button key={p.id} type="button" aria-pressed={siteDemo === p.id} className={siteDemo === p.id ? "on" : ""} onClick={() => setSiteDemo(p.id)}>
                      {p.name}
                    </button>
                  ))}
                </div>
                <DemoLaptop key={siteDemo} {...LAPTOP[siteDemo]} />
              </div>
              <div className="h-sol-body">
                <div className="h-sol-top">
                  <span className="h-mono">02 / {SERVICE}</span>
                  <span className="h-avail">Available</span>
                </div>
                <h3>Build Your Presence. Open New Opportunities.</h3>
                <p>From business websites and searchable product catalogues to online stores, create a better way for customers to find you and do business with you.</p>
                {/* One button that follows the switcher above, so the video and the package always match. */}
                <button type="button" className="h-btn h-sol-cta" onClick={() => openPackages(siteDemo)} aria-label={`See what's included in the ${SITES.find((p) => p.id === siteDemo)!.name}`}>
                  See what&rsquo;s included <span aria-hidden="true">→</span>
                </button>
              </div>
            </article>
          </div>
          <div className="h-more">
            <span className="h-more-icon" aria-hidden="true">+</span>
            <div>
              <h3>More Solutions on the Way</h3>
              <p>As RE5 grows, we&rsquo;ll introduce additional ways to support Caribbean businesses.</p>
            </div>
          </div>
          </div>
        </section>

        {/* ---------------- How we work ---------------- */}
        <section className="h-sec" aria-labelledby="h-how-title">
          <div className="h-wrap">
          <div className="h-sec-head">
            <div className="h-sec-title">
              <span className="h-mono h-kicker">How We Work</span>
              <h2 id="h-how-title" className="h-h2">From Conversation to Solution.</h2>
            </div>
            <div className="h-sec-aside">
              <p className="h-lead">Every business has different needs. We take the time to understand yours and develop solutions that fit your goals.</p>
              <p className="h-how-note">
                <Mark className="h-how-mark" /> Five dots, five steps.
              </p>
            </div>
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
          </div>
        </section>

        {/* ---------------- Blog ---------------- */}
        <section id="blog" className="h-sec h-sec--lav" aria-labelledby="h-blog-title">
          <div className="h-wrap h-edu">
          <div className="h-edu-copy">
            <span className="h-mono h-kicker">RE5 Education</span>
            <h2 id="h-blog-title" className="h-h2">Learn What AI Can Do for Your Business.</h2>
            <p className="h-lead">
              Discover free guides, tutorials, and practical resources to help you understand AI and use it in your business.
            </p>
            <a href="/blog" className="h-btn h-btn--ghost">
              Explore Free Resources <span aria-hidden="true">→</span>
            </a>
          </div>
          <div className="h-posts">
            {posts.map((p) => (
              <a key={p.slug} href={`/blog/${p.slug}`} className="h-card h-post">
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
          </div>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section id="faq" className="h-sec" aria-labelledby="h-faq-title">
          <div className="h-wrap h-faq">
            <div className="h-faq-head">
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
              <a href="#contact" className="h-btn h-btn--sm h-btn--ghost h-faq-more">
                Still have questions? Let&rsquo;s talk business <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </section>

        {/* ---------------- Contact ---------------- */}
        <section id="contact" className="h-contact h-pattern" aria-labelledby="h-contact-title">
          <div className="h-wrap h-contact-inner">
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
        <div className="h-wrap">
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
