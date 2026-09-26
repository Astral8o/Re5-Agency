"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { LogoMark } from "./Logo";
import "../app/landing.css";

type FormStatus = "idle" | "sending" | "sent" | "error";

type Tier = {
  name: string;
  price: string;
  period?: string;
  features: string[];
};

type ServiceTab = {
  key: "cd" | "sc";
  tabLabel: string;
  leadTitle: string;
  leadBody: string;
  light: Tier;
  dark: Tier;
};

const SERVICE_TABS: ServiceTab[] = [
  {
    key: "cd",
    tabLabel: "Content Day",
    leadTitle: "One shoot.",
    leadBody:
      "A library of content ready to use across social media, your website, Eventory and marketing.",
    light: {
      name: "Essentials",
      price: "3,500",
      features: [
        "On-site content shoot",
        "15 to 20 edited photos",
        "1 short-form video",
        "3 to 5 day delivery",
      ],
    },
    dark: {
      name: "Signature",
      price: "8,000",
      features: [
        "On-site content shoot",
        "30+ edited photos",
        "1 longer highlight video",
        "3 to 5 day delivery",
      ],
    },
  },
  {
    key: "sc",
    tabLabel: "Social Content Management",
    leadTitle: "Great work gives us plenty to talk about.",
    leadBody:
      "RE5 plans, writes and schedules content that brings the story, personality and work behind the business to social media consistently.",
    light: {
      name: "Starter",
      price: "1,400",
      period: "/month",
      features: [
        "8 to 12 posts",
        "Instagram or Facebook",
        "Content planning",
        "Captions",
        "Scheduling",
      ],
    },
    dark: {
      name: "Full",
      price: "2,800",
      period: "/month",
      features: [
        "16+ posts",
        "Multiple platforms",
        "Instagram + Facebook",
        "TikTok available",
        "Content planning",
        "Captions",
        "Scheduling",
      ],
    },
  },
];

const MOMENTUM_INCLUDED: string[] = [
  "Customer information and history",
  "Enquiry and lead organization",
  "Follow-ups and reminders",
  "Customer organization",
  "AI-powered customer insights",
  "Customer re-engagement",
  "Automated workflows",
  "Marketing and communication tools",
  "Ongoing system management",
];

const SEARCH_WORDS = [
  "A venue.",
  "A photographer.",
  "A caterer.",
  "Décor.",
  "Lighting.",
  "Entertainment.",
  "Rentals.",
];

const NAV_ITEMS = [
  { label: "How RE5 Works", href: "#how", img: "/images/sunset-reception.jpg" },
  { label: "Eventory", href: "#eventory", img: "/images/dj-setup-tent.jpg" },
  { label: "Momentum", href: "#momentum", img: "/images/branded-stage.jpg" },
  { label: "Who We Are", href: "#who", img: "/images/team-tugofwar.jpg" },
  { label: "Contact", href: "#contact", img: "/images/hero-dancefloor.jpg" },
];

const CAROUSEL_SLIDES = [
  { src: "/images/sunset-reception.jpg", alt: "The venue" },
  { src: "/images/balloon-decor.jpg", alt: "The décor" },
  { src: "/images/catering-spread.jpg", alt: "The food" },
  { src: "/images/dj-setup-tent.jpg", alt: "The music" },
  { src: "/images/bounce-house-wedding.jpg", alt: "The celebration" },
  { src: "/images/photo-booth.jpg", alt: "The experience" },
  { src: "/images/branded-stage.jpg", alt: "The stage" },
  { src: "/images/charity-run-event.jpg", alt: "The run" },
  { src: "/images/team-tugofwar.jpg", alt: "The team day" },
  { src: "/images/videographers.jpg", alt: "The team" },
].map((s, i) => ({ ...s, num: String(i + 1).padStart(2, "0") }));

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoverIdx, setHoverIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<"cd" | "sc">("cd");
  const [saved, setSaved] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [prefillMessage, setPrefillMessage] = useState("");

  const heroRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen && !modalOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, modalOpen]);

  const openModal = (prefill?: string) => {
    setMenuOpen(false);
    setStatus("idle");
    setErrorMessage("");
    setPrefillMessage(prefill ?? "");
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const onHeroMouseMove = (e: ReactMouseEvent<HTMLElement>) => {
    const el = heroRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--sx", (((e.clientX - r.left) / r.width) * 100).toFixed(1) + "%");
    el.style.setProperty("--sy", (((e.clientY - r.top) / r.height) * 100).toFixed(1) + "%");
  };

  // Typewriter effect cycling through SEARCH_WORDS
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const typeState = useRef({ dir: 1, hold: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const word = SEARCH_WORDS[wordIdx];
      const s = typeState.current;
      if (s.hold > 0) {
        s.hold -= 1;
        return;
      }
      if (s.dir > 0) {
        if (charIdx < word.length) {
          setCharIdx((c) => c + 1);
        } else {
          s.dir = -1;
          s.hold = 22;
        }
      } else {
        if (charIdx > 0) {
          setCharIdx((c) => c - 1);
        } else {
          s.dir = 1;
          s.hold = 4;
          setWordIdx((w) => (w + 1) % SEARCH_WORDS.length);
        }
      }
    }, 55);
    return () => clearInterval(timer);
  }, [wordIdx, charIdx]);

  // Carousel
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [slide, setSlide] = useState(0);
  const idxRef = useRef(0);
  const pausedRef = useRef(false);
  const lastManualRef = useRef(0);
  const animatingRef = useRef(false);

  const cardWidth = useCallback((el: HTMLDivElement) => {
    const c = el.firstElementChild as HTMLElement | null;
    return c ? c.getBoundingClientRect().width + 16 : 300;
  }, []);

  const step = useCallback(
    (dir: number, wrap?: boolean) => {
      const el = trackRef.current;
      if (!el) return;
      const w = cardWidth(el);
      const max = el.scrollWidth - el.clientWidth;
      const lastIdx = Math.ceil(max / w);
      let next = idxRef.current + dir;
      if (next > lastIdx) next = wrap ? 0 : lastIdx;
      if (next < 0) next = 0;
      idxRef.current = next;
      animatingRef.current = true;
      setTimeout(() => {
        animatingRef.current = false;
      }, 700);
      const left = Math.min(next * w, max);
      el.scrollTo({ left, behavior: "smooth" });
      const n = CAROUSEL_SLIDES.length;
      setSlide(max > 0 ? Math.round((left / max) * (n - 1)) : 0);
    },
    [cardWidth]
  );

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let endTimer: ReturnType<typeof setTimeout>;
    const onTrackScroll = () => {
      if (animatingRef.current) return;
      clearTimeout(endTimer);
      endTimer = setTimeout(() => {
        const w = cardWidth(el);
        const n = CAROUSEL_SLIDES.length;
        const max = el.scrollWidth - el.clientWidth;
        idxRef.current = Math.round(el.scrollLeft / w);
        const idx = max > 0 ? Math.round((el.scrollLeft / max) * (n - 1)) : 0;
        setSlide(idx);
      }, 120);
    };
    el.addEventListener("scroll", onTrackScroll, { passive: true });

    const auto = setInterval(() => {
      if (!pausedRef.current && Date.now() - lastManualRef.current > 6000) {
        step(1, true);
      }
    }, 4000);

    return () => {
      el.removeEventListener("scroll", onTrackScroll);
      clearTimeout(endTimer);
      clearInterval(auto);
    };
  }, [cardWidth, step]);

  const manualStep = (dir: number, wrap?: boolean) => {
    lastManualRef.current = Date.now();
    step(dir, wrap);
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setErrorMessage("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          business: data.get("business"),
          email: data.get("email"),
          whatsapp: data.get("whatsapp"),
          message: data.get("message"),
        }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("sent");
    } catch {
      setStatus("error");
      setErrorMessage(
        "Something went wrong sending that. Please try again, or email us directly at hello@re5agency.com."
      );
    }
  };

  const activeService = SERVICE_TABS.find((t) => t.key === activeTab)!;
  const typed = SEARCH_WORDS[wordIdx].slice(0, charIdx);

  return (
    <div className="page treat-warm">
      <nav className={`nav${scrolled || menuOpen ? " is-scrolled" : ""}`}>
        <button
          type="button"
          className="nav-menu-btn"
          aria-label="Menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className={`nav-menu-bars${menuOpen ? " is-open" : ""}`}>
            <span />
            <span />
          </span>
          <span>{menuOpen ? "Close" : "Menu"}</span>
        </button>
        <a
          href="#top"
          className="nav-logo"
          onClick={() => setMenuOpen(false)}
        >
          <LogoMark size={28} />
          <span className="nav-logo-text">
            <span className="nav-logo-mark">
              RE5<span className="dot">.</span>
            </span>
            <span className="nav-logo-word">Agency</span>
          </span>
        </a>
        <a
          href="#contact"
          className="nav-contact-btn"
          onClick={(e) => {
            e.preventDefault();
            openModal();
          }}
        >
          <span className="nav-contact-dot" />
          Contact
        </a>
      </nav>

      {menuOpen && (
        <div className="mega-menu">
          <nav className="mega-menu-nav">
            <ul className="mega-menu-list">
              {NAV_ITEMS.map((item, i) => (
                <li
                  className="mega-menu-item"
                  key={item.label}
                  onMouseEnter={() => setHoverIdx(i)}
                >
                  <a
                    href={item.href}
                    className={`mega-menu-link${i === hoverIdx ? " is-active" : ""}`}
                    onClick={(e) => {
                      if (item.href === "#contact") {
                        e.preventDefault();
                        openModal();
                      } else {
                        setMenuOpen(false);
                      }
                    }}
                  >
                    <span className="mega-menu-num">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mega-menu-footer">
              <span className="mega-menu-tagline">
                Your work deserves the Spotlight.
              </span>
              <a
                href="https://www.eventorytt.com"
                target="_blank"
                rel="noopener"
              >
                www.eventorytt.com &#8599;
              </a>
            </div>
          </nav>
          <div className="mega-menu-visual">
            <img src={NAV_ITEMS[hoverIdx].img} alt="" />
            <div className="mega-menu-visual-scrim" />
          </div>
        </div>
      )}

      {/* HERO */}
      <header
        id="top"
        className="hero"
        ref={heroRef}
        onMouseMove={onHeroMouseMove}
      >
        <div
          className="hero-bg"
          style={{ backgroundImage: "url('/images/hero-dancefloor.jpg')" }}
        />
        <div
          className="hero-bg-spot"
          style={{ backgroundImage: "url('/images/hero-dancefloor.jpg')" }}
        />
        <div className="hero-scrim" />
        <div className="hero-content">
          <div className="eyebrow">
            <span className="eyebrow-rule" />
            RE5. Agency
          </div>
          <h1 className="hero-title">
            Your work deserves the <span className="serif">Spotlight.</span>
          </h1>
          <div className="hero-sub-row">
            <p className="hero-copy">
              RE5 helps event businesses in Trinidad &amp; Tobago tell their
              unique story, get discovered by people planning events and
              turn enquiries into real opportunities.
            </p>
            <a
              href="#contact"
              className="btn-spot"
              onClick={(e) => {
                e.preventDefault();
                openModal();
              }}
            >
              <span>Get in the Spotlight</span>
              <span className="btn-spot-icon">&#8594;</span>
            </a>
          </div>
        </div>
        <div className="hero-links">
          <div className="hero-links-row">
            <a href="#seen" className="hero-link">
              <span className="hero-link-label">
                <span className="hero-link-num">01</span>Get seen.
              </span>
              <span className="hero-link-arrow">&#8595;</span>
            </a>
            <a href="#eventory" className="hero-link">
              <span className="hero-link-label">
                <span className="hero-link-num">02</span>Get found.
              </span>
              <span className="hero-link-arrow">&#8595;</span>
            </a>
            <a href="#momentum" className="hero-link">
              <span className="hero-link-label">
                <span className="hero-link-num">03</span>Get booked.
              </span>
              <span className="hero-link-arrow">&#8595;</span>
            </a>
          </div>
        </div>
      </header>

      {/* SEEN. FOUND. BOOKED. + carousel */}
      <section id="how" className="intro-section section-cream on-cream">
        <div className="wrap intro-head">
          <h2 className="intro-title">
            Seen. Found. <span className="serif">Booked.</span>
          </h2>
          <div className="intro-subhead">
            <p className="intro-lede">Your work is already worth seeing.</p>
            <p className="intro-body">
              RE5 helps more people see it, find it and choose it.
            </p>
          </div>
        </div>
        <div className="carousel-wrap">
          <div
            className="carousel-track"
            ref={trackRef}
            onMouseEnter={() => {
              pausedRef.current = true;
            }}
            onMouseLeave={() => {
              pausedRef.current = false;
            }}
          >
            {CAROUSEL_SLIDES.map((s) => (
              <figure className="carousel-card" key={s.num}>
                <div className="carousel-photo">
                  <img src={s.src} alt={s.alt} loading="lazy" decoding="async" />
                </div>
                <figcaption className="carousel-caption">
                  <span>{s.alt}</span>
                  <span>{s.num}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="carousel-controls">
            <div className="carousel-bar">
              <div
                className="carousel-bar-fill"
                style={{
                  width: `${((slide + 1) / CAROUSEL_SLIDES.length) * 100}%`,
                }}
              />
            </div>
            <span className="carousel-counter">
              {String(slide + 1).padStart(2, "0")} /{" "}
              {String(CAROUSEL_SLIDES.length).padStart(2, "0")}
            </span>
            <div className="carousel-btns">
              <button
                type="button"
                className="carousel-btn"
                aria-label="Previous"
                onClick={() => manualStep(-1)}
              >
                &#8592;
              </button>
              <button
                type="button"
                className="carousel-btn carousel-btn-next"
                aria-label="Next"
                onClick={() => manualStep(1, true)}
              >
                &#8594;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PILLAR 01: SEEN */}
      <section id="seen" className="pillar section-cream on-cream">
        <div className="pillar-inner">
          <div className="pillar-head-grid">
            <div className="pillar-head-copy">
              <div className="pillar-num-row">
                <span className="pillar-num">01</span>
                <span className="pillar-num-label mono">Seen</span>
              </div>
              <h2 className="pillar-headline">
                Your work is great.{" "}
                <span className="serif">
                  Now it is time for more people to see it.
                </span>
              </h2>
              <p className="pillar-body">
                Photography, video and social content that show the style,
                ideas and experience behind the work.
              </p>
            </div>
            <div className="pillar-photo-frame">
              <img
                src="/images/videographers.jpg"
                alt="Videographer filming a live event"
                loading="lazy"
                decoding="async"
              />
              <div className="pillar-photo-badge">
                <span className="pillar-photo-badge-dot" />
                Rec
              </div>
            </div>
          </div>

          <div className="tabs-block">
            <div className="tab-row">
              <div className="tab-switch">
                {SERVICE_TABS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    className={`tab-btn${activeTab === t.key ? " is-active" : ""}`}
                    onClick={() => setActiveTab(t.key)}
                  >
                    {t.tabLabel}
                  </button>
                ))}
              </div>
            </div>

            <div className="tier-grid">
              <div className="tier-lede">
                <h3>{activeService.leadTitle}</h3>
                <p>{activeService.leadBody}</p>
              </div>

              {([activeService.light, activeService.dark] as const).map(
                (tier, i) => (
                  <div
                    className={`tier-card ${i === 0 ? "tier-card-light" : "tier-card-dark"}`}
                    key={tier.name}
                  >
                    <div className="tier-card-head">
                      <h4 className="tier-card-name">{tier.name}</h4>
                      <div className="tier-card-price-row">
                        <span className="tier-card-currency">TTD</span>
                        <span className="tier-card-price">{tier.price}</span>
                        {tier.period && (
                          <span className="tier-card-period">
                            {tier.period}
                          </span>
                        )}
                      </div>
                    </div>
                    <ul className="tier-card-features">
                      {tier.features.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                    <a
                      href="#contact"
                      className={`btn-card ${i === 0 ? "btn-card-outline" : "btn-card-solid"}`}
                      onClick={(e) => {
                        e.preventDefault();
                        openModal(
                          `Interested in: ${activeService.tabLabel} (${tier.name})`
                        );
                      }}
                    >
                      <span>Ask About {tier.name}</span>
                      <span>&#8594;</span>
                    </a>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PILLAR 02: FOUND */}
      <section id="eventory" className="pillar found-section section-dark on-dark">
        <div className="found-glow" />
        <div className="found-grid">
          <div className="found-copy">
            <div className="pillar-num-row">
              <span className="pillar-num">02</span>
              <span className="pillar-num-label mono">Found</span>
            </div>
            <h2 className="pillar-headline">
              Be there when people are{" "}
              <span className="serif accent-text">looking.</span>
            </h2>
            <div className="found-search-block">
              <p className="found-search-lede">
                Every event starts with someone searching.
              </p>
              <div className="search-pill">
                <span className="search-pill-dot" />
                <span className="search-pill-text">
                  {typed}
                  <span className="search-pill-cursor" />
                </span>
                <span className="search-pill-icon">&#8594;</span>
              </div>
              <ul className="search-words">
                {SEARCH_WORDS.map((w, i) => (
                  <li
                    key={w}
                    className={`search-word${i === wordIdx ? " is-active" : ""}`}
                  >
                    {w}
                  </li>
                ))}
              </ul>
            </div>
            <p className="found-outro">
              <span className="accent-text">Eventory</span> gives event
              businesses a dedicated place to be discovered by people
              actively planning events across Trinidad &amp; Tobago.
            </p>
            <a
              href="https://www.eventorytt.com"
              target="_blank"
              rel="noopener"
              className="btn-spot btn-spot-sm"
            >
              <span>Explore Eventory</span>
              <span className="btn-spot-icon">&#8594;</span>
            </a>
          </div>

          <div className="eventory-visual">
            <div className="eventory-visual-label mono">
              A profile on Eventory
            </div>
            <div className="profile-card">
              <div className="profile-card-cover">
                <img
                  src="/images/videographers.jpg"
                  alt="Videography team"
                  loading="lazy"
                  decoding="async"
                  style={{ objectPosition: "center 25%" }}
                />
                <span className="profile-card-tag">Photo &amp; Video</span>
              </div>
              <div className="profile-card-body">
                <div className="profile-card-head">
                  <div className="profile-card-name-col">
                    <div className="profile-card-name">Amberline Studio</div>
                    <div className="profile-card-location">
                      Port of Spain &#183; Nationwide
                    </div>
                  </div>
                  <span className="profile-card-status">
                    <span className="profile-card-status-dot" />
                    Taking bookings
                  </span>
                </div>
                <p className="profile-card-desc">
                  Wedding and corporate coverage. Two shooters, same-week
                  highlight edits and full gallery delivery.
                </p>
                <div className="profile-card-tags">
                  <span className="profile-card-tag-chip">Weddings</span>
                  <span className="profile-card-tag-chip">Corporate</span>
                  <span className="profile-card-tag-chip">Content Days</span>
                </div>
                <div className="profile-card-thumbs">
                  <img
                    className="profile-card-thumb"
                    src="/images/photographer.jpg"
                    alt="Portrait shoot"
                    loading="lazy"
                    decoding="async"
                  />
                  <img
                    className="profile-card-thumb"
                    src="/images/getting-ready.jpg"
                    alt="Getting ready"
                    loading="lazy"
                    decoding="async"
                  />
                  <img
                    className="profile-card-thumb"
                    src="/images/stage-production.jpg"
                    alt="Stage production"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="profile-card-actions">
                  <button type="button" className="profile-card-message">
                    Message
                  </button>
                  <button
                    type="button"
                    className={`profile-card-save${saved ? " is-saved" : ""}`}
                    onClick={() => setSaved((v) => !v)}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PILLAR 03: BOOKED */}
      <section id="momentum" className="pillar section-dark-alt on-dark">
        <div className="pillar-inner">
          <div className="pillar-head-grid">
            <div className="pillar-head-copy">
              <div className="pillar-num-row">
                <span className="pillar-num">03</span>
                <span className="pillar-num-label mono">Booked</span>
              </div>
              <h2 className="pillar-headline">
                Keep every opportunity{" "}
                <span className="serif accent-text">connected.</span>
              </h2>
            </div>
            <div style={{ display: "grid", gap: 16, maxWidth: 540 }}>
              <p className="pillar-body">
                Running an event business comes with a lot of conversations.
                New enquiries, questions about packages, follow-ups,
                returning customers and people who may be ready to book
                later.
              </p>
              <p style={{ margin: 0, color: "var(--bone)", fontSize: 20 }}>
                Momentum helps keep all of it together.
              </p>
            </div>
          </div>

          <div className="momentum-grid">
            <div className="momentum-feature-card">
              <img
                src="/images/branded-stage.jpg"
                alt="Branded conference stage"
              />
              <div className="momentum-feature-scrim" />
              <div className="momentum-feature-top">
                <span className="momentum-feature-badge">Featured</span>
                <span className="momentum-feature-name">RE5 Momentum</span>
              </div>
              <div className="momentum-feature-bottom">
                <div className="momentum-feature-price-row">
                  <span style={{ fontSize: 16, fontWeight: 500 }}>TTD</span>
                  <span className="momentum-feature-price">3,500</span>
                  <span style={{ fontSize: 18 }}>/month</span>
                </div>
                <h3 className="momentum-feature-headline">
                  Your customer relationship team, sales support and
                  marketing assistant, all in one.
                </h3>
                <a
                  href="#contact"
                  className="btn-spot btn-spot-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    openModal("Interested in: RE5 Momentum");
                  }}
                >
                  <span>Book a Momentum Consultation</span>
                  <span className="btn-spot-icon">&#8594;</span>
                </a>
              </div>
            </div>

            <div className="momentum-included-card">
              <div className="momentum-included-head">
                <h4 className="momentum-included-title mono">
                  What&apos;s included
                </h4>
                <ul className="momentum-checklist">
                  {MOMENTUM_INCLUDED.map((item, i) => (
                    <li key={item}>
                      <span className="momentum-checklist-num mono">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="momentum-quote">
                More support behind the business, so every opportunity gets
                the attention it deserves.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BRING IT ALL TOGETHER */}
      <section className="recap-section section-cream on-cream">
        <div className="recap-inner">
          <div className="recap-head">
            <div className="eyebrow eyebrow-deep">Bring It All Together</div>
            <p className="recap-statement">
              One Spotlight Framework, built around the way people discover
              and choose event businesses.
            </p>
          </div>
          <div className="recap-grid">
            <a href="#seen" className="recap-card">
              <div className="recap-card-top">
                <span>01</span>
                <span>&#8599;</span>
              </div>
              <div className="recap-card-body">
                <span className="recap-card-word">Seen.</span>
                <p>Content that shows what makes the work special.</p>
              </div>
            </a>
            <a href="#eventory" className="recap-card">
              <div className="recap-card-top">
                <span>02</span>
                <span>&#8599;</span>
              </div>
              <div className="recap-card-body">
                <span className="recap-card-word">Found.</span>
                <p>A place to be discovered while people are planning.</p>
              </div>
            </a>
            <a href="#momentum" className="recap-card recap-card-dark">
              <div className="recap-card-top">
                <span>03</span>
                <span>&#8599;</span>
              </div>
              <div className="recap-card-body">
                <span className="recap-card-word">Booked.</span>
                <p>A system that helps turn interest into opportunity.</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* WHO WE ARE */}
      <section id="who" className="who-section section-dark on-dark">
        <div className="who-inner">
          <div className="who-collage">
            <img
              src="/images/branded-stage.jpg"
              alt="Branded conference stage"
              loading="lazy"
              decoding="async"
            />
            <img
              src="/images/team-tugofwar.jpg"
              alt="Team day tug of war"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="who-copy">
            <div className="eyebrow">
              <span className="eyebrow-rule" />
              Who we are
            </div>
            <h2 className="who-headline">
              We believe good work deserves{" "}
              <span className="serif">attention.</span>
            </h2>
            <div className="who-body">
              <p>
                RE5 brings marketers, photographers, videographers, event
                professionals and creative minds together to put event
                businesses in the Spotlight.
              </p>
              <p>
                No two businesses need exactly the same thing. So we start
                with yours: how it is being seen, where people are finding
                it and what happens after they enquire. Then we build the
                right mix around it.
              </p>
            </div>
            <a
              href="#contact"
              className="btn-spot btn-spot-sm"
              onClick={(e) => {
                e.preventDefault();
                openModal();
              }}
            >
              <span>Book a Consultation</span>
              <span className="btn-spot-icon">&#8594;</span>
            </a>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section id="contact" className="final-cta-section section-dark">
        <div className="final-cta-frame">
          <img src="/images/sunset-reception.jpg" alt="" />
          <div className="final-cta-scrim" />
          <div className="final-cta-content">
            <h2 className="final-cta-title">
              Your work deserves the <span className="serif">Spotlight.</span>
            </h2>
            <div className="final-cta-row">
              <div className="final-cta-copy">
                <p>You already have something worth seeing.</p>
                <p>Let&apos;s put it in front of the people looking for it.</p>
              </div>
              <a
                href="#contact"
                className="btn-spot"
                onClick={(e) => {
                  e.preventDefault();
                  openModal();
                }}
              >
                <span>Get in the Spotlight</span>
                <span className="btn-spot-icon">&#8594;</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer section-dark">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-logo-row">
                <LogoMark size={44} />
                <span className="footer-wordmark">
                  RE5<span className="dot">.</span>
                </span>
              </div>
              <span className="footer-tagline">
                Your work deserves the Spotlight.
              </span>
            </div>
            <nav className="footer-links">
              <a href="#how">How RE5 Works</a>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  openModal();
                }}
              >
                Book a Consultation
              </a>
              <a href="#eventory">Eventory</a>
              <a
                href="https://www.eventorytt.com"
                target="_blank"
                rel="noopener"
              >
                www.eventorytt.com
              </a>
              <a href="#momentum">Momentum</a>
              <span />
              <a href="#who">Who We Are</a>
            </nav>
          </div>
        </div>
      </footer>

      {modalOpen && (
        <div className="modal-overlay">
          <button
            type="button"
            className="modal-backdrop-click"
            aria-label="Close"
            onClick={closeModal}
          />
          <div className="modal-panel">
            <button
              type="button"
              className="modal-close mono"
              onClick={closeModal}
            >
              CLOSE
            </button>

            {status !== "sent" ? (
              <div className="modal-body">
                <div className="modal-head">
                  <div className="modal-eyebrow mono">
                    Get in the spotlight
                  </div>
                  <h3 className="modal-heading">
                    Tell us about your business.
                  </h3>
                </div>
                <form className="form" onSubmit={submit}>
                  <label className="form-label mono">
                    Name
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Your name"
                    />
                  </label>
                  <label className="form-label mono">
                    Business
                    <input
                      type="text"
                      name="business"
                      placeholder="Business name"
                    />
                  </label>
                  <div className="form-row">
                    <label className="form-label mono">
                      Email
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="you@business.com"
                      />
                    </label>
                    <label className="form-label mono">
                      WhatsApp
                      <input
                        type="tel"
                        name="whatsapp"
                        placeholder="+1 868 000 0000"
                      />
                    </label>
                  </div>
                  <label className="form-label mono">
                    What do you need?
                    <textarea
                      key={prefillMessage}
                      name="message"
                      rows={3}
                      placeholder="Social content, photography, website, discovery on Eventory..."
                      defaultValue={prefillMessage}
                    />
                  </label>
                  {status === "error" && (
                    <p className="form-error">{errorMessage}</p>
                  )}
                  <button
                    type="submit"
                    className="btn-card btn-card-solid btn-submit"
                    disabled={status === "sending"}
                  >
                    {status === "sending" ? "Sending..." : "Send it over"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="modal-sent">
                <div className="modal-eyebrow mono">Received</div>
                <h3 className="modal-heading">Thanks. We&apos;ll be in touch.</h3>
                <p>
                  One of the team will reach out shortly to talk through
                  getting your work seen, found and booked.
                </p>
                <button
                  type="button"
                  className="btn-card btn-card-outline"
                  onClick={closeModal}
                >
                  Back to site
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
