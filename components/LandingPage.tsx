"use client";

import { useEffect, useState, type FormEvent } from "react";
import { LogoMark, Wordmark } from "./Logo";
import "../app/landing.css";

const MOBILE_BREAKPOINT = 860;

type FormStatus = "idle" | "sending" | "sent" | "error";

type PackageTier = {
  name: string;
  price: string;
  features: string[];
};

type PackageGroup = {
  group: string;
  headline: string;
  intro: string[];
  tiers: PackageTier[];
};

const PACKAGES: PackageGroup[] = [
  {
    group: "Content Day",
    headline: "One shoot.",
    intro: [
      "A library of content ready to use across social media, your website, Eventory and marketing.",
    ],
    tiers: [
      {
        name: "Essentials",
        price: "TTD 3,500",
        features: [
          "On-site content shoot",
          "15 to 20 edited photos",
          "1 short-form video",
          "3 to 5 day delivery",
        ],
      },
      {
        name: "Signature",
        price: "TTD 8,000",
        features: [
          "On-site content shoot",
          "30+ edited photos",
          "1 longer highlight video",
          "3 to 5 day delivery",
        ],
      },
    ],
  },
  {
    group: "Social Content Management",
    headline: "Great work gives us plenty to talk about.",
    intro: [
      "RE5 plans, writes and schedules content that brings the story, personality and work behind the business to social media consistently.",
    ],
    tiers: [
      {
        name: "Starter",
        price: "TTD 1,400/month",
        features: [
          "8 to 12 posts",
          "Instagram or Facebook",
          "Content planning",
          "Captions",
          "Scheduling",
        ],
      },
      {
        name: "Full",
        price: "TTD 2,800/month",
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
    ],
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

function ImageTile({
  src,
  alt,
  className,
  objectPosition,
}: {
  src: string;
  alt: string;
  className?: string;
  objectPosition?: string;
}) {
  return (
    <div className={className ?? "image-tile"}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={objectPosition ? { objectPosition } : undefined}
      />
    </div>
  );
}

export default function LandingPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [prefillMessage, setPrefillMessage] = useState("");

  useEffect(() => {
    const sync = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
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
  const toggleMenu = () => setMenuOpen((v) => !v);
  const closeMenu = () => setMenuOpen(false);

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

  return (
    <div className="page treat-warm">
      <nav className="nav">
        <a href="#top" className="nav-logo">
          <LogoMark size={26} />
          <Wordmark className="mono nav-wordmark" />
        </a>

        {!isMobile && (
          <div className="nav-links mono">
            <a href="#how-it-works">How RE5 Works</a>
            <a href="#eventory">Eventory</a>
            <a href="#momentum">Momentum</a>
            <a href="#about">Who We Are</a>
            <a
              href="#contact"
              className="nav-contact-btn mono"
              onClick={(e) => {
                e.preventDefault();
                openModal();
              }}
            >
              Contact
            </a>
          </div>
        )}

        {isMobile && (
          <button
            type="button"
            className="nav-burger"
            aria-label="Menu"
            onClick={toggleMenu}
          >
            <span />
            <span />
            <span />
          </button>
        )}
      </nav>

      {menuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-header">
            <div className="nav-logo">
              <LogoMark size={26} />
              <Wordmark className="mono nav-wordmark" />
            </div>
            <button
              type="button"
              className="mobile-menu-close mono"
              aria-label="Close menu"
              onClick={toggleMenu}
            >
              &#215;
            </button>
          </div>
          <div className="mobile-menu-links">
            <a href="#how-it-works" onClick={closeMenu}>
              How RE5 Works
            </a>
            <a href="#eventory" onClick={closeMenu}>
              Eventory
            </a>
            <a href="#momentum" onClick={closeMenu}>
              Momentum
            </a>
            <a href="#about" onClick={closeMenu}>
              Who We Are
            </a>
          </div>
          <a
            href="#contact"
            className="mobile-menu-cta mono"
            onClick={(e) => {
              e.preventDefault();
              openModal();
            }}
          >
            Get in the Spotlight <span className="arrow">&#8594;</span>
          </a>
        </div>
      )}

      {/* HERO */}
      <header id="top" className="hero">
        <div className="hero-glow-main" />
        <div className="hero-glow-secondary" />
        <div className="hero-scrim" />

        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-eyebrow mono">
              RE5<span className="dot">.</span> Agency
            </div>
            <h1 className="hero-title">
              <span className="hero-title-line1">Your work deserves the</span>
              <span className="hero-title-line2">Spotlight.</span>
            </h1>
            <div className="hero-sub-row">
              <p className="hero-copy">
                RE5 helps event businesses in{" "}
                <span className="accent-text">Trinidad &amp; Tobago</span>{" "}
                tell their unique story, get discovered by people planning
                events and turn enquiries into real opportunities.
              </p>
              <div className="hero-cta-row">
                <a
                  href="#contact"
                  className="btn-pill btn-primary mono"
                  onClick={(e) => {
                    e.preventDefault();
                    openModal();
                  }}
                >
                  Get in the Spotlight <span className="arrow">&#8594;</span>
                </a>
              </div>
            </div>
          </div>

          <div className="hero-strip mono">
            <span>Get seen.</span>
            <span>Get found.</span>
            <span>Get booked.</span>
          </div>
        </div>
      </header>

      {/* SEEN. FOUND. BOOKED. */}
      <section id="how-it-works" className="section how-it-works-section">
        <div className="how-it-works-glow" />
        <div className="section-inner worth-seeing-grid">
          <div className="worth-seeing-copy">
            <div className="section-eyebrow mono">Seen. Found. Booked.</div>
            <h2 className="section-headline">
              Your work is already worth seeing.
            </h2>
            <p className="body-copy">
              RE5 helps more people see it, find it and choose it.
            </p>
          </div>

          <div className="image-grid-2x2">
            <ImageTile
              src="/images/venue-draped.jpg"
              alt="Draped venue with chandeliers"
            />
            <ImageTile
              src="/images/catering-spread.jpg"
              alt="Catering spread"
            />
            <ImageTile
              src="/images/event-load-in.jpg"
              alt="Event crew loading in truss"
              objectPosition="center top"
            />
            <ImageTile
              src="/images/photo-booth.jpg"
              alt="Guests on a 360 photo booth"
            />
          </div>
        </div>
      </section>

      {/* PILLAR 01: SEEN */}
      <section id="seen" className="section pillar-section">
        <div className="pillar-glow" />
        <div className="section-inner pillar-inner">
          <div className="pillar-eyebrow mono">01 &#183; Seen</div>
          <h2 className="pillar-headline">
            Your work is great. Now it is time for more people to see it.
          </h2>
          <p className="body-copy">
            Photography, video and social content that show the style,
            ideas and experience behind the work.
          </p>

          {PACKAGES.map((group) => (
            <div className="package-group" key={group.group}>
              <div className="offer-header">
                <div className="offer-label mono">{group.group}</div>
                <h3 className="offer-headline">{group.headline}</h3>
              </div>
              {group.intro.map((paragraph) => (
                <p className="body-copy-sm" key={paragraph}>
                  {paragraph}
                </p>
              ))}
              <div className="package-grid">
                {group.tiers.map((tier) => (
                  <div className="package-card" key={tier.name}>
                    <div className="package-card-head">
                      <h4 className="package-card-name">{tier.name}</h4>
                      <div className="package-card-price mono">
                        {tier.price}
                      </div>
                    </div>
                    <ul className="package-card-features">
                      {tier.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                    <a
                      href="#contact"
                      className="btn-pill btn-outline mono"
                      onClick={(e) => {
                        e.preventDefault();
                        openModal(
                          `Interested in: ${group.group} (${tier.name})`
                        );
                      }}
                    >
                      Ask About {tier.name}{" "}
                      <span className="arrow">&#8594;</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PILLAR 02: FOUND */}
      <section id="found" className="section pillar-section">
        <div className="pillar-glow" />
        <div className="section-inner pillar-inner">
          <div className="pillar-eyebrow mono">02 &#183; Found</div>
          <h2 className="pillar-headline">
            Be there when people are looking.
          </h2>
          <p className="body-copy">
            Every event starts with someone searching.
          </p>
          <div className="chip-row">
            <div className="chip">A venue.</div>
            <div className="chip">A photographer.</div>
            <div className="chip">A caterer.</div>
            <div className="chip">D&#233;cor.</div>
            <div className="chip">Lighting.</div>
            <div className="chip">Entertainment.</div>
            <div className="chip">Rentals.</div>
          </div>
          <p className="body-copy">
            <span className="accent-text">Eventory</span> gives event
            businesses a dedicated place to be discovered by people actively
            planning events across{" "}
            <span className="accent-text">Trinidad &amp; Tobago</span>.
          </p>

          <div className="eventory-card-wrap">
            <div id="eventory" className="eventory-inner">
              <div className="eventory-copy">
                <a
                  href="https://www.eventorytt.com"
                  target="_blank"
                  rel="noopener"
                  className="btn-pill btn-outline mono"
                >
                  Explore Eventory <span className="arrow">&#8594;</span>
                </a>
              </div>

              <div className="eventory-card-col">
                <div className="eventory-card-label mono">
                  <span className="rule" />A profile on Eventory
                </div>
                <div className="profile-card">
                  <div className="profile-card-cover">
                    <img
                      src="/images/videographers.jpg"
                      alt="Videography team"
                      style={{ objectPosition: "center 22%" }}
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="profile-card-tag mono">
                      Photo &amp; Video
                    </div>
                  </div>
                  <div className="profile-card-body">
                    <div className="profile-card-head">
                      <div className="profile-card-name-col">
                        <div className="profile-card-name">
                          Amberline Studio
                        </div>
                        <div className="profile-card-location mono">
                          Port of Spain &#183; Nationwide
                        </div>
                      </div>
                      <div className="profile-card-status">
                        <span className="profile-card-status-dot" />
                        <span className="label mono">Taking bookings</span>
                      </div>
                    </div>
                    <p className="profile-card-desc">
                      Wedding and corporate coverage. Two shooters,
                      same-week highlight edits and full gallery delivery.
                    </p>
                    <div className="profile-card-tags">
                      <span className="profile-card-tag-chip">Weddings</span>
                      <span className="profile-card-tag-chip">
                        Corporate
                      </span>
                      <span className="profile-card-tag-chip">
                        Content Days
                      </span>
                    </div>
                    <div className="profile-card-thumbs">
                      <div className="profile-card-thumb">
                        <img
                          src="/images/photographer.jpg"
                          alt="Portrait shoot"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <div className="profile-card-thumb">
                        <img
                          src="/images/getting-ready.jpg"
                          alt="Getting ready"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <div className="profile-card-thumb">
                        <img
                          src="/images/stage-production.jpg"
                          alt="Stage production"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    </div>
                    <div className="profile-card-actions">
                      <span className="profile-card-message mono">
                        Message
                      </span>
                      <span className="profile-card-save mono">Save</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PILLAR 03: BOOKED */}
      <section id="booked" className="section pillar-section">
        <div className="pillar-glow" />
        <div className="section-inner pillar-inner">
          <div className="pillar-eyebrow mono">03 &#183; Booked</div>
          <h2 className="pillar-headline">
            Keep every opportunity connected.
          </h2>
          <p className="body-copy">
            Running an event business comes with a lot of conversations.
            New enquiries, questions about packages, follow-ups, returning
            customers and people who may be ready to book later.
          </p>
          <p className="body-copy">
            <span className="accent-text">Momentum</span> helps keep all of
            it together.
          </p>

          <div id="momentum" className="momentum-feature">
            <div className="momentum-feature-eyebrow mono">Featured</div>
            <div className="offer-header">
              <div className="offer-label-row">
                <div className="offer-label mono">RE5 Momentum</div>
                <div className="momentum-feature-price mono">
                  TTD 3,500/month
                </div>
              </div>
              <h3 className="offer-headline">
                Your customer relationship team, sales support and marketing
                assistant, all in one.
              </h3>
            </div>

            <div className="momentum-feature-included">
              <h4 className="momentum-feature-included-title mono">
                What&apos;s included
              </h4>
              <ul className="momentum-checklist">
                {MOMENTUM_INCLUDED.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="momentum-feature-footer">
              <div className="momentum-feature-footer-copy">
                <p className="momentum-feature-question">
                  More support behind the business, so every opportunity
                  gets the attention it deserves.
                </p>
              </div>
              <a
                href="#contact"
                className="btn-pill btn-primary mono"
                onClick={(e) => {
                  e.preventDefault();
                  openModal("Interested in: RE5 Momentum");
                }}
              >
                Book a Momentum Consultation{" "}
                <span className="arrow">&#8594;</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* BRING IT ALL TOGETHER */}
      <section className="section recap-section">
        <div className="section-inner recap-inner">
          <div className="section-eyebrow mono">Bring It All Together</div>
          <div className="recap-grid">
            <div className="recap-block">
              <h3>Seen.</h3>
              <p>Content that shows what makes the work special.</p>
            </div>
            <div className="recap-block">
              <h3>Found.</h3>
              <p>A place to be discovered while people are planning.</p>
            </div>
            <div className="recap-block">
              <h3>Booked.</h3>
              <p>A system that helps turn interest into opportunity.</p>
            </div>
          </div>
          <p className="body-copy">
            One <span className="accent-text">Spotlight Framework</span>,
            built around the way people discover and choose event
            businesses.
          </p>
        </div>
      </section>

      {/* WHERE DO WE START */}
      <section className="section process-section">
        <div className="section-inner process-inner">
          <div className="section-eyebrow mono">Where do we start?</div>
          <h2 className="section-headline">With the business.</h2>
          <p className="body-copy">
            No two event businesses need exactly the same thing.
          </p>
          <p className="body-copy">
            RE5 looks at how the business is being seen, where people are
            finding it and what happens after they enquire.
          </p>
          <p className="body-copy">
            Then we build the right mix around what is needed.
          </p>
          <a
            href="#contact"
            className="btn-pill btn-primary mono"
            onClick={(e) => {
              e.preventDefault();
              openModal();
            }}
          >
            Book a Consultation <span className="arrow">&#8594;</span>
          </a>
        </div>
      </section>

      {/* WHO ARE WE */}
      <section id="about" className="section">
        <div className="section-inner about-grid">
          <div className="about-photo">
            <img
              src="/images/guests-event.jpg"
              alt="Guests at an event"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="about-copy">
            <div className="section-eyebrow mono">Who are we?</div>
            <h2 className="about-title">
              We believe good work deserves attention.
            </h2>
            <p className="body-copy">
              RE5 brings marketers, photographers, videographers, event
              professionals and creative minds together around one shared
              focus:
            </p>
            <p className="body-copy">
              Putting event businesses{" "}
              <span className="accent-text">in the Spotlight</span>.
            </p>
            <a
              href="#contact"
              className="btn-pill btn-outline mono"
              onClick={(e) => {
                e.preventDefault();
                openModal();
              }}
            >
              Meet RE5 <span className="arrow">&#8594;</span>
            </a>
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section id="contact" className="cta-section">
        <div className="cta-glow" />
        <div className="cta-inner">
          <h2 className="cta-title">Your work deserves the Spotlight.</h2>
          <p className="cta-sub">
            You already have something worth seeing.
          </p>
          <p className="cta-sub">
            Let&apos;s put it in front of the people looking for it.
          </p>
          <a
            href="#contact"
            className="btn-pill btn-primary mono"
            onClick={(e) => {
              e.preventDefault();
              openModal();
            }}
          >
            Get in the Spotlight <span className="arrow">&#8594;</span>
          </a>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-brand">
          <div className="footer-logo-row">
            <LogoMark size={40} />
            <span className="footer-wordmark">
              RE5<span className="dot">.</span>
            </span>
          </div>
          <div className="footer-tagline">
            Your work deserves the Spotlight.
          </div>
        </div>
        <div className="footer-links mono">
          <a href="#how-it-works">How RE5 Works</a>
          <a href="#eventory">Eventory</a>
          <a href="#momentum">Momentum</a>
          <a href="#about">Who We Are</a>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              openModal();
            }}
          >
            Book a Consultation
          </a>
          <a
            href="https://www.eventorytt.com"
            target="_blank"
            rel="noopener"
            className="muted"
          >
            www.eventorytt.com
          </a>
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
            <button type="button" className="modal-close mono" onClick={closeModal}>
              CLOSE
            </button>

            {status !== "sent" ? (
              <div className="modal-body">
                <div className="modal-head">
                  <div className="modal-eyebrow mono">Get in the spotlight</div>
                  <h3 className="modal-heading">Tell us about your business.</h3>
                </div>
                <form className="form" onSubmit={submit}>
                  <label className="form-label mono">
                    Name
                    <input type="text" name="name" required placeholder="Your name" />
                  </label>
                  <label className="form-label mono">
                    Business
                    <input type="text" name="business" placeholder="Business name" />
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
                      <input type="tel" name="whatsapp" placeholder="+1 868 000 0000" />
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
                    className="btn-pill btn-submit mono"
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
                  className="btn-pill btn-outline mono"
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
