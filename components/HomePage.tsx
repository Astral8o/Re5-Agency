"use client";

import { useEffect, useRef, useState } from "react";
import { Logo, Mark } from "./brand";
import DemoLaptop from "./DemoLaptop";
import DemoPhone from "./DemoPhone";
import type { Post } from "../app/blog/posts";

// RE5 offers one service for now; every enquiry is about it.
const SERVICE = "Websites & Online Sales";

// Example online store shown in the laptop preview (fictional business, recorded from an RE5 demo build).
const STORE = { name: "store-loop", url: "islandheat.shop", label: "Example online store for a pepper sauce brand: adding products to the cart and checking out" };

const num = (i: number) => String(i + 1).padStart(2, "0");

const BENEFITS = [
  ["Make Shopping Easier", "Let customers browse your products, check prices, choose options and pay online. Make it convenient for regular customers to return and order again."],
  ["Make Orders Easier to Manage", "Receive orders with the details you need, reduce manual order-taking and keep track of purchases, so your team can spend more time serving customers."],
  ["Reach More Customers", "Make your products easier to discover beyond your immediate location. Explore opportunities to sell across Trinidad and Tobago and other Caribbean markets."],
] as const;

// "What Can We Help You Create?": the two ways to sell online with RE5.
const OFFERS = [
  {
    name: "Your Own Website",
    head: "Built Around Your Business.",
    text: "Have something specific in mind? Let\u2019s create a website that works for you.",
    items: ["Your own domain and branding", "Online store or product catalogue", "Ordering, quotations and payment options", "Hosting, maintenance and support"],
    how: "Pay for website development and ongoing maintenance.",
    cta: "Let\u2019s Talk About Your Website",
  },
  {
    name: "RE5 Managed Store",
    head: "Start Selling Online. We\u2019ll Handle the Tech.",
    text: "Choose a store design, add your products and start selling. We\u2019ll take care of the setup and maintenance.",
    items: ["Ready-made store designs", "Your own branded store on RE5", "Product and order dashboard", "Payment and delivery integrations", "Hosting, maintenance and support"],
    how: "No upfront development or monthly platform fee. RE5 earns a commission when you make a sale. Payment processing and delivery fees are separate.",
    cta: "Interested? Let\u2019s Talk",
  },
] as const;

const APPROACH = [
  ["Discovery", "Getting to Know Your Business", "We start by learning about your products, customers, current sales process and what you\u2019d like to achieve."],
  ["Strategy", "Finding the Right Solution", "We\u2019ll explore your options, recommend an approach and explain the features, costs and work involved."],
  ["Development", "Bringing It to Life", "We\u2019ll coordinate the development of your online store, catalogue or ordering solution, keeping you involved along the way."],
  ["Integration & Testing", "Making Sure It Works", "We\u2019ll test the purchasing experience, check important features and connect any agreed business systems."],
  ["Launch & Adoption", "Getting Everyone On Board", "We\u2019ll help you prepare for launch, show your team how to use the system and plan how to introduce it to customers so they can start ordering online."],
] as const;

// The approach diagram: five steps placed like the five dots of the RE5 mark, clockwise from the top.
// The arrow into step 5 stops a little earlier so it clears that step's label.
const CX = 50, CY = 52, R = 32;
const at = (deg: number, r = R) => [CX + r * Math.cos((deg * Math.PI) / 180), CY + r * Math.sin((deg * Math.PI) / 180)] as const;
const NODE_DEG = [-90, -18, 54, 126, 198];
const arc = (from: number, to: number, endGap = 14) => {
  const [x1, y1] = at(from + 14);
  const [x2, y2] = at(to - endGap);
  return `M${x1.toFixed(2)} ${y1.toFixed(2)} A${R} ${R} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
};

export default function HomePage({ posts }: { posts: Post[] }) {
  const [menu, setMenu] = useState(false);
  const [showSticky, setShowSticky] = useState(false);

  // Contact form
  const openedAt = useRef(Date.now());
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [sent, setSent] = useState(false);

  // The RE5 Approach diagram: which step is highlighted
  const [step, setStep] = useState(0);
  // Offer picked from "What Can We Help You Create?", sent with the enquiry.
  const [interest, setInterest] = useState<string | null>(null);

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
          package: interest ?? "",
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

        {/* ---------------- Digital commerce ---------------- */}
        <section id="services" className="h-sec" aria-labelledby="h-dc-title">
          <div className="h-wrap">
            <div className="h-split">
              <div className="h-split-copy">
                <span className="h-mono h-kicker">Digital Commerce</span>
                <h2 id="h-dc-title" className="h-h2">Give Your Customers More Ways to Shop With You.</h2>
                <p className="h-lead">Imagine customers being able to browse your products, choose what they need, place an order and pay online, all in one place.</p>
                <p className="h-lead">Whether you sell to individual customers or other businesses, RE5 Agency helps you explore the right online selling solution for your business.</p>
              </div>
              {/* Two examples of what RE5 builds: an online store, with WhatsApp ordering on a phone in front of it. */}
              <div className="h-split-media h-split-media--grey h-devices">
                <DemoLaptop {...STORE} />
                <DemoPhone />
              </div>
            </div>

            <h3 className="h-h3 h-sub">What Could This Mean for Your Business?</h3>
            <div className="h-benefits">
              {BENEFITS.map(([t, d], i) => (
                <div key={t} className="h-card h-benefit">
                  <span className="h-num">{num(i)}</span>
                  <h4>{t}</h4>
                  <p>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- What we create ---------------- */}
        <section className="h-sec h-sec--tint" aria-labelledby="h-create-title">
          <div className="h-wrap">
            <div className="h-sec-head h-sec-head--solo">
              <div className="h-sec-title">
                <h2 id="h-create-title" className="h-h2">What Can We Help You Create?</h2>
              </div>
            </div>
            <div className="h-offers">
              {OFFERS.map((o, i) => (
                <article key={o.name} className={`h-card h-offer${i === 1 ? " h-offer--lav" : ""}`}>
                  <h3 className="h-offer-name">{o.name}</h3>
                  <p className="h-offer-head">{o.head}</p>
                  <p className="h-offer-text">{o.text}</p>
                  <ul className="h-offer-list">
                    {o.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                  <p className="h-offer-how">
                    <strong>How it works:</strong> {o.how}
                  </p>
                  <a href="#contact" className={`h-btn${i === 1 ? " h-btn--ghost" : ""}`} onClick={() => { setInterest(o.name); setSent(false); }}>
                    {o.cta} <span aria-hidden="true">→</span>
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- The RE5 approach ---------------- */}
        <section className="h-sec" aria-labelledby="h-approach-title">
          <div className="h-wrap">
            <div className="h-sec-head h-sec-head--solo">
              <div className="h-sec-title">
                <span className="h-mono h-kicker">The RE5 Approach</span>
                <h2 id="h-approach-title" className="h-h2">From Our First Conversation to Launch &amp; Beyond.</h2>
              </div>
            </div>
            <div className="h-approach">
              {/* Diagram: the five steps sit where the five dots of the RE5 mark sit, joined clockwise, with step 5 looping back to step 1. */}
              <div className="h-cycle" aria-hidden="true">
                <svg viewBox="0 0 100 100">
                  <defs>
                    <marker id="h-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                      <path d="M0 0L10 5L0 10z" fill="#111" />
                    </marker>
                    <marker id="h-arrow-c" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                      <path d="M0 0L10 5L0 10z" fill="#ff6a3d" />
                    </marker>
                  </defs>
                  {NODE_DEG.slice(0, 4).map((d, i) => (
                    <path key={d} d={arc(d, NODE_DEG[i + 1], i === 3 ? 24 : 14)} className="h-cycle-arc" markerEnd="url(#h-arrow)" />
                  ))}
                  <path d={arc(198, 270)} className="h-cycle-arc h-cycle-arc--loop" markerEnd="url(#h-arrow-c)" />
                </svg>
                {NODE_DEG.map((d, i) => {
                  const [x, y] = at(d);
                  return (
                    <button key={d} type="button" tabIndex={-1} className={`h-node${step === i ? " on" : ""}`} style={{ left: `${x}%`, top: `${y}%` }} onClick={() => setStep(i)} onMouseEnter={() => setStep(i)}>
                      <span className="h-node-dot">{num(i)}</span>
                      <span className="h-node-label">{APPROACH[i][0]}</span>
                    </button>
                  );
                })}
                {(() => {
                  const [x, y] = at(234, 45);
                  return <span className="h-cycle-beyond" style={{ left: `${x}%`, top: `${y}%` }}>&amp; Beyond</span>;
                })()}
              </div>
              <ol className="h-steps">
                {APPROACH.map(([t, sub, d], i) => (
                  <li key={t} className={step === i ? "on" : ""} onMouseEnter={() => setStep(i)}>
                    <span className="h-num">{num(i)}</span>
                    <div>
                      <h3>
                        {t} <span className="h-step-sub">{sub}</span>
                      </h3>
                      <p>{d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ---------------- RE5 Education ---------------- */}
        <section id="blog" className="h-sec" aria-labelledby="h-blog-title">
          <div className="h-wrap">
            <div className="h-split">
              <div className="h-split-copy">
                <span className="h-mono h-kicker">RE5 Education</span>
                <h2 id="h-blog-title" className="h-h2">Curious About AI? Let&rsquo;s Explore.</h2>
                <p className="h-lead">Discover free guides, tutorials and practical resources to help you understand AI and find ways to use it in your business.</p>
                <p className="h-lead">Whether you&rsquo;re just getting started or want to learn something new, our Education Centre is here to help.</p>
                <a href="/blog" className="h-btn h-btn--lg h-btn--ghost">
                  Visit the Education Centre <span aria-hidden="true">→</span>
                </a>
              </div>
              <div className="h-posts">
                {posts.slice(0, 1).map((p) => (
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
          </div>
        </section>

        {/* ---------------- Contact ---------------- */}
        <section id="contact" className="h-contact h-pattern" aria-labelledby="h-contact-title">
          <div className="h-wrap h-contact-inner">
            <div className="h-panel h-panel--coral h-contact-copy">
              <h2 id="h-contact-title" className="h-contact-title">
                Let&rsquo;s Talk About Your Business.
              </h2>
              <p>Thinking about selling online? Already have a website but want to improve how customers order?</p>
              <p>Tell us what you&rsquo;re hoping to achieve. We&rsquo;ll help you explore your options and figure out the next steps.</p>
              <Mark className="h-contact-mark" />
            </div>
            <div className="h-panel h-form-card">
              {!sent ? (
                <form onSubmit={submit} className="h-form">
                  {interest && (
                    <div className="h-interest" role="status">
                      <span>
                        Interested in: <strong>{interest}</strong>
                      </span>
                      <button type="button" className="h-interest-x" onClick={() => setInterest(null)} aria-label={`Remove ${interest}`}>
                        ✕
                      </button>
                    </div>
                  )}
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
                  <label>
                    Tell us about your business and what you&rsquo;d like to achieve
                    <textarea name="message" rows={4} />
                  </label>
                  <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="h-hp" />
                  <button type="submit" className="h-btn h-btn--lg h-btn--full" disabled={sending}>
                    {sending ? "Sending…" : "Get in Touch →"}
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
                      setInterest(null);
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

      {showSticky && !menu && (
        <div className="h-sticky">
          <a href="#contact" className="h-btn h-btn--lg">
            Let&rsquo;s Talk Business →
          </a>
        </div>
      )}
    </div>
  );
}
