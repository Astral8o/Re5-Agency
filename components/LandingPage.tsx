"use client";

import { useEffect, useState, type FormEvent } from "react";
import { LogoMark, Wordmark } from "./Logo";
import "../app/landing.css";

const MOBILE_BREAKPOINT = 860;

type FormStatus = "idle" | "sending" | "sent" | "error";

const FRAMEWORK_SERVICES: { pillar: string; items: string[] }[] = [
  {
    pillar: "Seen",
    items: [
      "Social content",
      "Photography",
      "Videography",
      "Email",
      "Promotional partnerships",
    ],
  },
  {
    pillar: "Found",
    items: ["Eventory listing", "Website", "Google & SEO", "AI visibility"],
  },
  {
    pillar: "Booked",
    items: [
      "Inquiry funnel setup",
      "WhatsApp booking setup",
      "Follow-up systems",
      "Clear CTAs & booking pages",
    ],
  },
];

type PackageTier = {
  name: string;
  price: string;
  value: string;
  features: string[];
};

type PackageGroup = {
  group: string;
  tiers: PackageTier[];
};

const PACKAGES: PackageGroup[] = [
  {
    group: "Content Day",
    tiers: [
      {
        name: "Half day",
        price: "TTD 3,500",
        value:
          "You've been posting the same three photos for months. One afternoon of shooting gets you 15 to 20 new photos and a short video, enough content to post for weeks without picking up a camera again.",
        features: [
          "Up to 4 hours of on-site shooting",
          "15-20 edited photos",
          "One short video (reel-length)",
          "Delivered in 3-5 business days",
        ],
      },
      {
        name: "Full day",
        price: "TTD 8,000",
        value:
          "A full season's worth of content in one day: 30+ photos and a longer video, shot once and used for months.",
        features: [
          "Up to 8 hours of on-site shooting",
          "30+ edited photos",
          "One longer video (highlight-length)",
          "Delivered in 3-5 business days",
        ],
      },
    ],
  },
  {
    group: "Social Content Management",
    tiers: [
      {
        name: "Starter",
        price: "TTD 1,400/mo",
        value:
          "You're running your business, not posting about it. RE5 handles 8 to 12 posts a month on one platform, so your feed stays active while you're busy doing the work.",
        features: [
          "8-12 posts per month",
          "One platform (Instagram or Facebook)",
          "Content planned and scheduled by RE5",
          "Captions written for every post",
        ],
      },
      {
        name: "Full",
        price: "TTD 2,800/mo",
        value:
          "For vendors who need to show up everywhere their customers are looking: 16+ posts a month across multiple platforms.",
        features: [
          "16+ posts per month",
          "Multiple platforms (Instagram + Facebook, or add TikTok)",
          "Content planned and scheduled by RE5",
          "Captions written for every post",
        ],
      },
    ],
  },
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
  const [selectedServices, setSelectedServices] = useState<Set<string>>(
    () => new Set()
  );
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

  const toggleService = (label: string) => {
    setSelectedServices((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const openModalWithSelection = () => {
    const items = Array.from(selectedServices);
    openModal(items.length ? `Interested in: ${items.join(", ")}` : "");
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

  return (
    <div className="page treat-warm">
      <nav className="nav">
        <a href="#top" className="nav-logo">
          <LogoMark size={26} />
          <Wordmark className="mono nav-wordmark" />
        </a>

        {!isMobile && (
          <div className="nav-links mono">
            <a href="#framework">Framework</a>
            <a href="#packages">Packages</a>
            <a href="#eventory">Eventory</a>
            <a href="#about">Who we are</a>
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
            <a href="#framework" onClick={closeMenu}>
              Framework
            </a>
            <a href="#packages" onClick={closeMenu}>
              Packages
            </a>
            <a href="#eventory" onClick={closeMenu}>
              Eventory
            </a>
            <a href="#about" onClick={closeMenu}>
              Who we are
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
            Get in the spotlight <span className="arrow">&#8594;</span>
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
                We put your business where people can{" "}
                <span className="accent-text">see it</span>,{" "}
                <span className="accent-text">find it</span>, and{" "}
                <span className="accent-text">book it</span>.
              </p>
              <a
                href="#contact"
                className="btn-pill btn-primary mono"
                onClick={(e) => {
                  e.preventDefault();
                  openModal();
                }}
              >
                Get in the spotlight <span className="arrow">&#8594;</span>
              </a>
            </div>
          </div>

          <div className="hero-strip mono">
            <span>Get seen.</span>
            <span>Get found.</span>
            <span>Get booked.</span>
          </div>
        </div>
      </header>

      {/* WORTH SEEING */}
      <section className="section">
        <div className="section-inner worth-seeing-grid">
          <div className="worth-seeing-copy">
            <h2 className="worth-seeing-heading">
              Event businesses have something{" "}
              <span className="accent-strong">worth seeing.</span>
            </h2>
            <div className="chip-row">
              <div className="chip">The venue.</div>
              <div className="chip">The setup.</div>
              <div className="chip">The food.</div>
              <div className="chip">The photos.</div>
              <div className="chip">The experience.</div>
              <div className="chip">The details people remember.</div>
            </div>
            <p className="worth-seeing-lede">The work is already there.</p>
            <p className="worth-seeing-closer">
              <span className="accent-text">RE5</span> puts your business in
              the right places, in front of the people looking for what you
              do.
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

      {/* FRAMEWORK */}
      <section id="framework" className="section framework-section">
        <div className="framework-glow" />
        <div className="framework-inner">
          <h2 className="framework-title">
            The Spotlight
            <br />
            Framework
          </h2>
          <p className="framework-intro">
            Every business gets a different mix, built around what actually
            moves the needle for you.
          </p>
          <p className="framework-intro">
            We look at how people discover your business, where they find
            you, and what happens when they&apos;re ready to enquire.
          </p>
          <p className="framework-intro">Then we build from there.</p>
          <div className="framework-grid">
            <div className="framework-card">
              <div className="framework-number mono">01</div>
              <h3>Seen</h3>
              <p className="framework-card-lede">
                Put your work in front of more people.
              </p>
              <p className="framework-card-body">
                Build visibility around what makes your business worth
                noticing.
              </p>
              <div className="service-chip-row">
                {FRAMEWORK_SERVICES[0].items.map((label) => (
                  <button
                    key={label}
                    type="button"
                    className={`service-chip${selectedServices.has(label) ? " selected" : ""}`}
                    aria-pressed={selectedServices.has(label)}
                    onClick={() => toggleService(label)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="framework-card">
              <div className="framework-number mono">02</div>
              <h3>Found</h3>
              <p className="framework-card-lede">
                Make your business easier to discover.
              </p>
              <p className="framework-card-body">
                People are searching in more places than ever.
              </p>
              <p className="framework-card-body">
                <a href="#eventory">Eventory</a>, websites, Google, SEO, AI
                and other places people go when they&apos;re looking for
                event businesses.
              </p>
              <div className="service-chip-row">
                {FRAMEWORK_SERVICES[1].items.map((label) => (
                  <button
                    key={label}
                    type="button"
                    className={`service-chip${selectedServices.has(label) ? " selected" : ""}`}
                    aria-pressed={selectedServices.has(label)}
                    onClick={() => toggleService(label)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="framework-card">
              <div className="framework-number mono">03</div>
              <h3>Booked</h3>
              <p className="framework-card-lede">Turn interest into action.</p>
              <p className="framework-card-body">
                Make it easier for people who find you to take the next
                step.
              </p>
              <div className="service-chip-row">
                {FRAMEWORK_SERVICES[2].items.map((label) => (
                  <button
                    key={label}
                    type="button"
                    className={`service-chip${selectedServices.has(label) ? " selected" : ""}`}
                    aria-pressed={selectedServices.has(label)}
                    onClick={() => toggleService(label)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="framework-cta">
            <a
              href="#contact"
              className="btn-pill btn-primary mono"
              onClick={(e) => {
                e.preventDefault();
                openModalWithSelection();
              }}
            >
              Build this with us <span className="arrow">&#8594;</span>
            </a>
            {selectedServices.size > 0 && (
              <span className="framework-cta-count mono">
                {selectedServices.size} selected
              </span>
            )}
          </div>
          <div className="image-grid-4">
            <ImageTile
              src="/images/videographers.jpg"
              alt="Videography team at a wedding"
            />
            <ImageTile
              src="/images/photographer.jpg"
              alt="Videographer filming a couple"
            />
            <ImageTile src="/images/conference-stage.jpg" alt="Conference stage set" />
            <ImageTile
              src="/images/event-signage.jpg"
              alt="Branded event signage with florals"
            />
          </div>
        </div>
      </section>

      {/* PACKAGES */}
      <section id="packages" className="section packages-section">
        <div className="section-inner packages-inner">
          <div className="packages-eyebrow mono">Packages</div>
          <h2 className="packages-title">Real work, real prices.</h2>
          <p className="packages-intro">
            No guessing games. Here&apos;s exactly what you get.
          </p>
          {PACKAGES.map((group) => (
            <div className="package-group" key={group.group}>
              <h3 className="package-group-title">{group.group}</h3>
              <div className="package-grid">
                {group.tiers.map((tier) => (
                  <div className="package-card" key={tier.name}>
                    <div className="package-card-head">
                      <h4 className="package-card-name">{tier.name}</h4>
                      <div className="package-card-price mono">
                        {tier.price}
                      </div>
                    </div>
                    <p className="package-card-value">{tier.value}</p>
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
                      Get this package
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EVENTORY */}
      <section id="eventory" className="section eventory-section">
        <div className="eventory-glow" />
        <div className="eventory-inner">
          <div className="eventory-copy">
            <div className="eventory-eyebrow mono">Eventory</div>
            <h2 className="eventory-title">Discover what&apos;s next.</h2>
            <p className="eventory-lede">
              Eventory is RE5&apos;s discovery platform for event businesses.
            </p>
            <p className="eventory-body">
              It brings event vendors and suppliers into one place, giving
              people a simpler way to discover businesses, explore what they
              offer and connect with them.
            </p>
            <p className="eventory-body">
              For businesses, it&apos;s another place to be seen and found by
              people actively looking for event services.
            </p>
            <a
              href="https://www.eventorytt.com"
              target="_blank"
              rel="noopener"
              className="btn-pill btn-outline-light mono"
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
                <div className="profile-card-tag mono">Photo &amp; Video</div>
              </div>
              <div className="profile-card-body">
                <div className="profile-card-head">
                  <div className="profile-card-name-col">
                    <div className="profile-card-name">Amberline Studio</div>
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
                  Wedding and corporate coverage &#8212; two shooters,
                  same-week highlight edits, full gallery delivery.
                </p>
                <div className="profile-card-tags">
                  <span className="profile-card-tag-chip">Weddings</span>
                  <span className="profile-card-tag-chip">Corporate</span>
                  <span className="profile-card-tag-chip">Content days</span>
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
                  <span className="profile-card-message mono">Message</span>
                  <span className="profile-card-save mono">Save</span>
                </div>
              </div>
            </div>
          </div>
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
            <h2 className="about-title">Who are we?</h2>
            <p>
              RE5 brings together marketers, videographers, photographers,
              event professionals and creative minds with different skills
              and one shared focus:
            </p>
            <p>
              Putting event businesses{" "}
              <span className="accent-text">in the spotlight</span>.
            </p>
            <p>
              We bring those skills together to create visibility, improve
              discoverability and create clearer paths from being found to
              being booked.
            </p>
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section id="contact" className="cta-section">
        <div className="cta-glow" />
        <div className="cta-inner">
          <h2 className="cta-title">
            Your work deserves to be <span className="accent-strong">seen.</span>
          </h2>
          <p className="cta-sub">Let&apos;s put it in the right places.</p>
          <a
            href="#contact"
            className="btn-pill btn-primary mono"
            onClick={(e) => {
              e.preventDefault();
              openModal();
            }}
          >
            Get in the spotlight <span className="arrow">&#8594;</span>
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
          <div className="footer-tagline">Your work deserves the spotlight.</div>
        </div>
        <div className="footer-links mono">
          <a href="https://www.eventorytt.com" target="_blank" rel="noopener">
            Eventory
          </a>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              openModal();
            }}
          >
            Work with RE5
          </a>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              openModal();
            }}
          >
            Contact
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
