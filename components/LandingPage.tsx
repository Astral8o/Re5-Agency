"use client";

import { useEffect, useState, type FormEvent } from "react";
import { LogoMark, Wordmark } from "./Logo";
import "../app/landing.css";

const MOBILE_BREAKPOINT = 860;

type FormStatus = "idle" | "sending" | "sent" | "error";

type PackageTier = {
  name: string;
  price: string;
  value: string;
  features: string[];
};

type PackageGroup = {
  group: string;
  intro: string[];
  tiers: PackageTier[];
};

const PACKAGES: PackageGroup[] = [
  {
    group: "Content Day",
    intro: [
      "Create a library of photography and video around the work you are already doing.",
    ],
    tiers: [
      {
        name: "Essentials",
        price: "TTD 3,500",
        value:
          "One shoot gives you fresh content to use across your social media, website, Eventory profile and marketing.",
        features: [
          "On-site content shoot",
          "15 to 20 edited photos",
          "One short-form video",
          "Delivered in 3 to 5 business days",
        ],
      },
      {
        name: "Signature",
        price: "TTD 8,000",
        value:
          "A larger content library built around your work, your style and the experience you create.",
        features: [
          "On-site content shoot",
          "30+ edited photos",
          "One longer highlight video",
          "Delivered in 3 to 5 business days",
        ],
      },
    ],
  },
  {
    group: "Social Content Management",
    intro: [
      "Keep telling your story after the shoot is over.",
      "RE5 plans, writes and schedules your content so your business keeps showing up and giving people more chances to remember you.",
    ],
    tiers: [
      {
        name: "Starter",
        price: "TTD 1,400/month",
        value: "A consistent presence on one platform.",
        features: [
          "8 to 12 posts per month",
          "Instagram or Facebook",
          "Content planned by RE5",
          "Captions written for every post",
          "Posts scheduled by RE5",
        ],
      },
      {
        name: "Full",
        price: "TTD 2,800/month",
        value:
          "More content across more of the places your audience spends their time.",
        features: [
          "16+ posts per month",
          "Multiple platforms",
          "Instagram and Facebook, with TikTok available",
          "Content planned by RE5",
          "Captions written for every post",
          "Posts scheduled by RE5",
        ],
      },
    ],
  },
];

const MOMENTUM_BLOCKS: { title: string; body: string }[] = [
  {
    title: "Keep your customer information together.",
    body: "See customer details, conversations and history in one place.",
  },
  {
    title: "Know who needs your attention.",
    body: "Keep track of enquiries, follow-ups and opportunities as they move.",
  },
  {
    title: "Stay connected.",
    body: "Use reminders and workflows to keep important conversations going.",
  },
  {
    title: "Reconnect with past customers.",
    body: "Bring previous customers and older enquiries back into view when there is an opportunity to reach out again.",
  },
  {
    title: "Understand what is happening in your business.",
    body: "Use AI-assisted customer insights to get more context around your customers, conversations and opportunities.",
  },
  {
    title: "Keep the system running.",
    body: "RE5 helps manage the workflows, communication and structure behind Momentum.",
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
                RE5 is built for event businesses in{" "}
                <span className="accent-text">Trinidad &amp; Tobago</span>.
                We help you tell your unique story through content, get
                discovered by people actively planning events, and turn
                enquiries into real opportunities.
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
                <a href="#how-it-works" className="hero-secondary-cta mono">
                  See How RE5 Works <span className="arrow">&#8594;</span>
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
              <span className="accent-text">RE5</span> helps you show people
              what makes your business yours and puts that story in front of
              the people looking for what you do.
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

      {/* HOW RE5 WORKS */}
      <section id="how-it-works" className="section how-it-works-section">
        <div className="how-it-works-glow" />
        <div className="section-inner how-it-works-inner">
          <div className="section-eyebrow mono">How RE5 Works</div>
          <h2 className="section-headline">Seen. Found. Booked.</h2>
          <p className="how-it-works-body">
            We created the Spotlight Framework around the three moments that
            matter most in marketing an event business.
          </p>
          <p className="how-it-works-body">
            People need to see your work, find you when they start planning,
            and understand enough about your business to know when you are
            exactly what they need.
          </p>
          <p className="how-it-works-body">
            Everything RE5 offers connects back to one of those moments.
          </p>
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
          <p className="pillar-body">
            RE5 helps you tell your unique story through photography, video
            and consistent social content that shows people what makes your
            business yours.
          </p>
          <p className="pillar-stat">
            Short-form video continues to rank among the
            strongest-performing content formats for marketers, which makes
            visual storytelling even more valuable for businesses built
            around experiences.
          </p>
          <p className="pillar-source mono">
            Source: HubSpot, State of Marketing
          </p>

          {PACKAGES.map((group) => (
            <div className="package-group" key={group.group}>
              <h3 className="package-group-title">{group.group}</h3>
              {group.intro.map((paragraph) => (
                <p className="package-group-intro" key={paragraph}>
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
                      Ask About This Package{" "}
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
            Being found in all the noise online is getting harder.
          </h2>
          <p className="pillar-body">
            People are searching across Google, social media, websites,
            directories and AI. That gives your business more places to be
            discovered, but also more places to get lost.
          </p>
          <p className="pillar-stat">
            Google says businesses with complete and accurate information are
            more likely to appear in relevant local search results.
          </p>
          <p className="pillar-transition">
            We built Eventory around that shift.
          </p>
          <p className="pillar-source mono">Source: Google Business Profile</p>

          <div className="eventory-card-wrap">
            <div id="eventory" className="eventory-inner">
              <div className="eventory-copy">
                <h3 className="eventory-eyebrow">Meet Eventory.</h3>
                <p className="eventory-title">
                  Built for people planning events.
                </p>
                <div className="eventory-search-list">
                  <p>Someone is looking for a venue.</p>
                  <p>A photographer.</p>
                  <p>A caterer.</p>
                  <p>Lighting.</p>
                  <p>D&#233;cor.</p>
                  <p>Entertainment.</p>
                  <p>Rentals.</p>
                  <p className="eventory-search-list-close">
                    The people who can bring their event together.
                  </p>
                </div>
                <p className="eventory-body">
                  Eventory gives them one place to discover event
                  businesses, explore what they offer and enquire directly.
                </p>
                <p className="eventory-body">
                  Built by RE5 for the event industry in Trinidad &amp;
                  Tobago, Eventory gives your business another place to be
                  found while someone is actively looking for what you do.
                </p>
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
            Being booked starts with someone thinking, &#8220;Yes. This is
            exactly what I need.&#8221;
          </h2>
          <p className="pillar-body">
            People choose businesses when they understand the story behind
            the work, connect with what they see and recognize that the
            experience you create is right for them.
          </p>
          <p className="pillar-transition">Then the enquiry comes in.</p>
          <p className="pillar-transition">
            That conversation becomes part of the experience too.
          </p>
          <p className="pillar-stat">
            Salesforce research found that 80% of customers consider the
            experience a company provides as important as its products and
            services.
          </p>
          <p className="pillar-transition">
            RE5 helps you keep that conversation moving.
          </p>
          <p className="pillar-source mono">Source: Salesforce</p>

          <div id="momentum" className="momentum-feature">
            <div className="momentum-feature-eyebrow mono">Featured</div>
            <div className="momentum-feature-head">
              <h3 className="momentum-feature-title">RE5 Momentum</h3>
              <div className="momentum-feature-price mono">
                TTD 3,500/month
              </div>
            </div>
            <p className="momentum-feature-role">
              Your customer relationship team, sales support and marketing
              assistant, all in one.
            </p>

            <div className="momentum-scenario-list">
              <p>Someone enquires.</p>
              <p>Another person asks about a date.</p>
              <p>A customer says they will get back to you.</p>
              <p>Someone needs a follow-up next week.</p>
              <p>A past customer could be ready to book again.</p>
            </div>
            <p className="momentum-feature-lede">
              Momentum brings those conversations, customers and
              opportunities together so you can keep up with the people
              already showing interest in your business.
            </p>

            <div className="momentum-blocks">
              {MOMENTUM_BLOCKS.map((block) => (
                <div className="momentum-block" key={block.title}>
                  <h4>{block.title}</h4>
                  <p>{block.body}</p>
                </div>
              ))}
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
                  A lot happens between an enquiry and a booking.
                </p>
                <p className="momentum-feature-subline">
                  Momentum helps you keep up with it.
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

      {/* WHERE DO WE START */}
      <section className="section process-section">
        <div className="section-inner process-inner">
          <div className="section-eyebrow mono">Where do we start?</div>
          <h2 className="section-headline">With your business.</h2>
          <p className="process-body">
            Every event business tells a different story.
          </p>
          <p className="process-body">
            A photographer has something different to show from a venue. A
            caterer has a different customer journey from a rental company.
            The way people discover you, understand your work and decide to
            enquire will be different too.
          </p>
          <p className="process-body">We start there.</p>
          <p className="process-body">
            We look at how people currently see your business, where they
            find you and what happens when they enquire.
          </p>
          <p className="process-body">
            Then we build the right mix around what your business needs.
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
            <p>
              RE5 brings together marketers, videographers, photographers,
              event professionals and creative minds around one shared
              focus:
            </p>
            <p>
              Putting event businesses{" "}
              <span className="accent-text">in the Spotlight</span>.
            </p>
            <p>
              We understand an industry built around experiences people can
              see, feel and remember.
            </p>
            <p>
              Our job is to help you tell that story, make your business
              easier to discover and create a clearer path from interest to
              opportunity.
            </p>
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section id="contact" className="cta-section">
        <div className="cta-glow" />
        <div className="cta-inner">
          <h2 className="cta-title">Your work deserves the Spotlight.</h2>
          <p className="cta-sub">
            You have already created something worth seeing.
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
