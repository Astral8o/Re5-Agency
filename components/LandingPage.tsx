"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import "../app/landing.css";

/* ---------------------------------------------------------------- */
/* Types                                                             */
/* ---------------------------------------------------------------- */

type Answers = Record<string, unknown>;

type FieldConfig = {
  key: string;
  label: string;
  ph?: string;
  type?: "text" | "email" | "tel" | "date" | "time";
};

/* ---------------------------------------------------------------- */
/* Wizard config                                                     */
/* ---------------------------------------------------------------- */

const PLANNING_OPTS = [
  "Wedding",
  "Birthday",
  "Private celebration",
  "Corporate event",
  "Brand experience",
  "Product launch",
  "Other",
];

const CREATE_OPTS = [
  {
    id: "slushie",
    label: "Slushie Experience",
    body: "A styled slushie experience for your event or brand.",
  },
  {
    id: "popcorn",
    label: "Popcorn Experience",
    body: "A styled popcorn experience for your event or brand.",
  },
  {
    id: "both",
    label: "Slushie + Popcorn",
    body: "Bring both experiences together.",
  },
  {
    id: "another",
    label: "I Have Another Idea",
    body: "Have something different in mind? Tell us what you’re thinking.",
  },
];

const showsSlushieDetails = (a: Answers) => a.create === "slushie" || a.create === "both";

const CONTACT_FIELDS: FieldConfig[] = [
  { key: "contact", label: "Your name *", ph: "Full name" },
  { key: "company", label: "Business / Brand", ph: "Your brand" },
  { key: "email", label: "Email *", ph: "you@email.com", type: "email" },
  { key: "phone", label: "Phone / WhatsApp", ph: "+1 868", type: "tel" },
];

const WIZARD_PAGE_IDS = ["plan", "create", "details", "yours", "else", "connect"] as const;
type WizardPageId = (typeof WIZARD_PAGE_IDS)[number];

const visibleWizardPages = (a: Answers): WizardPageId[] =>
  WIZARD_PAGE_IDS.filter((id) => id !== "details" || showsSlushieDetails(a));

function validateWizardPage(id: WizardPageId, a: Answers): string {
  if (id === "plan") {
    if (!a.planning) return "Pick one to keep going.";
    if (a.planning === "Other" && !String(a.planningOther || "").trim())
      return "Tell us what you're planning.";
  }
  if (id === "create") {
    if (!a.create) return "Pick one to keep going.";
    if (a.create === "another" && !String(a.createIdea || "").trim())
      return "Tell us what you'd like to create.";
  }
  if (id === "details") {
    if (!a.slushieFor) return "Pick one to keep going.";
    if ((a.slushieFor === "Adults" || a.slushieFor === "Both") && !a.alcohol)
      return "Let us know about the alcoholic option.";
  }
  if (id === "yours" && !a.lookBasis) return "Pick one to keep going.";
  if (id === "connect") {
    if (!a.contact || !a.email) return "Add your name and email so we can reply.";
    if (!/^\S+@\S+\.\S+$/.test(String(a.email))) return "That email looks incomplete.";
  }
  return "";
}

const LOOK_THEME = "Yes, I have an event theme or colour palette";
const LOOK_BRAND = "Yes, I have an existing brand";
const LOOK_NONE = "No, not yet";

function formatWizardDate(v: unknown): string {
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
    return new Date(`${v}T12:00`).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return "";
}

function buildWizardBrief(a: Answers) {
  const rows: { n: string; tag: string; answer: string }[] = [];
  let n = 1;
  const push = (tag: string, answer: string) => {
    rows.push({ n: String(n++).padStart(2, "0"), tag, answer: answer || "Not answered" });
  };

  push(
    "Planning",
    a.planning === "Other" ? `Other: ${a.planningOther || ""}` : String(a.planning || "")
  );
  push("Date", formatWizardDate(a.eventDate));
  push("Venue", [a.venue, a.venueStatus].filter(Boolean).join(" · "));
  push("Guests", a.guestCount ? String(a.guestCount) : "");

  const createLabel = CREATE_OPTS.find((c) => c.id === a.create)?.label || "";
  push("Create", a.create === "another" ? `${createLabel}: ${a.createIdea || ""}` : createLabel);

  if (showsSlushieDetails(a)) {
    const alcoholNote =
      a.slushieFor === "Adults" || a.slushieFor === "Both"
        ? ` · Alcohol: ${a.alcohol || ""}`
        : "";
    push("Slushie details", `${a.slushieFor || ""}${alcoholNote}`);
  }

  if (a.lookBasis === LOOK_THEME) {
    push(
      "Look",
      [a.themeNote, a.themeUpload ? `Uploaded: ${a.themeUpload}` : ""]
        .filter(Boolean)
        .join(" · ") || "Event theme or colour palette"
    );
  } else if (a.lookBasis === LOOK_BRAND) {
    push(
      "Look",
      [
        a.brandName,
        a.brandColours,
        a.brandLogo ? `Logo: ${a.brandLogo}` : "",
        a.brandMaterial ? `Material: ${a.brandMaterial}` : "",
      ]
        .filter(Boolean)
        .join(" · ") || "Existing brand"
    );
  } else {
    push("Look", a.lookBasis ? "No, not yet" : "");
  }

  push("Anything else", String(a.notes || ""));
  push("Preferred contact", String(a.contactPref || ""));

  return rows;
}

/* ---------------------------------------------------------------- */
/* Small shared bits                                                  */
/* ---------------------------------------------------------------- */

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 1.5c.9 6.2 2.6 8.3 9.5 10.5-6.9 1.8-8.6 4-9.5 10.5-.9-6.5-2.6-8.7-9.5-10.5 6.9-2.2 8.6-4.3 9.5-10.5z"
        fill="currentColor"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="wa-icon" aria-hidden="true">
      <path
        d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowCircle({ dark }: { dark?: boolean }) {
  return <span className={`arrow-circle ${dark ? "arrow-circle-dark" : ""}`}>&rarr;</span>;
}

const PILLARS = [
  {
    n: "01",
    title: "The Idea",
    body: "We shape the idea with you, thinking about the moment, the people and what you want them to experience.",
  },
  {
    n: "02",
    title: "The Look",
    body: "From the cart to the signage and everything around it, we bring the look together around your event, idea or brand.",
  },
  {
    n: "03",
    title: "The Taste",
    body: "From drinks and treats to something created for your moment, we work with you to bring the right tastes into your experience.",
    extra: "Part of our mission is to bring local businesses into the experiences we create. Depending on the experience, we collaborate with small businesses, caterers and makers across Trinidad & Tobago, bringing their tastes to your moment while creating more opportunities for local businesses to grow.",
  },
  {
    n: "04",
    title: "The People",
    body: "From serving and mixing to sampling and interacting with guests, we bring in the right people for your experience.",
  },
  {
    n: "05",
    title: "The Setup",
    body: "We bring everything together, get it there, set it up and make sure it's ready for your moment.",
  },
];

const CUSTOM_WORDS = ["branding", "colours", "menu", "signage", "experience"];

const WHATSAPP_URL = "https://wa.me/18680000000";

// TODO(Re5): swap in your real Google Calendar appointment scheduling link.
const CONSULTATION_BOOKING_URL = "https://calendar.google.com/calendar/u/0/appointments";

/* ---------------------------------------------------------------- */
/* Paths (for your event / for your brand)                           */
/* ---------------------------------------------------------------- */

type PathCta = "builder" | "wizard";

type PathDef = {
  id: string;
  eyebrow: string;
  heading: string;
  body: string;
  bodyTwo: string;
  images: { src: string; pos?: string }[];
  ctaLabel: string;
  cta: PathCta;
};

const PATHS: PathDef[] = [
  {
    id: "event",
    eyebrow: "For Your Event",
    heading: "Give them something to experience.",
    body: "Weddings, birthdays, celebrations, corporate events and the moments that bring people together.",
    bodyTwo: "We work with you to create an experience around your moment and the people you're sharing it with.",
    images: [
      { src: "/images/re5popup/signature-slushie-cocktail.png", pos: "50% 30%" },
      { src: "/images/re5popup/popcorn-boxes.png", pos: "50% 55%" },
      { src: "/images/re5popup/slushie-candy-crop.png" },
    ],
    ctaLabel: "Plan your experience",
    cta: "wizard",
  },
  {
    id: "brand",
    eyebrow: "For Your Brand",
    heading: "Put your brand where people can experience it.",
    body: "Launching something new? Want people to try it, talk about it or experience your brand differently?",
    bodyTwo: "We create mobile brand experiences that bring your idea directly to the people you want to reach.",
    images: [
      { src: "/images/re5popup/hero-popcorn-serving.png", pos: "50% 42%" },
      { src: "/images/re5popup/cart-blank.png" },
      { src: "/images/re5popup/slushie-group-toast.png", pos: "50% 35%" },
    ],
    ctaLabel: "Bring your brand to life",
    cta: "builder",
  },
];

const DECORATION_OPTS = ["Minimal & clean", "Bold & colourful", "Themed to my event", "Let us surprise you"];

const BUILDER_STEP_COUNT = 6;

/* ---------------------------------------------------------------- */
/* Component                                                          */
/* ---------------------------------------------------------------- */

export default function LandingPage() {
  const [mobile, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [headBorder, setHeadBorder] = useState(false);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"intro" | "q" | "done">("intro");
  const [idx, setIdx] = useState(0);
  const [err, setErr] = useState("");
  const [answers, setAnswers] = useState<Answers>({});
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderStep, setBuilderStep] = useState(0);
  const [builderErr, setBuilderErr] = useState("");
  const [builderSending, setBuilderSending] = useState(false);
  const [builderSendError, setBuilderSendError] = useState("");
  const [art, setArt] = useState<{ canopy?: string | null; body?: string | null }>({});
  const [fit, setFit] = useState<{ canopy: "contain" | "cover"; body: "contain" | "cover" }>({
    canopy: "contain",
    body: "contain",
  });
  const [builderAnswers, setBuilderAnswers] = useState<Record<string, unknown>>({});

  const contRef = useRef<HTMLButtonElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 960px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener ? mq.addEventListener("change", update) : mq.addListener(update);
    return () => {
      mq.removeEventListener ? mq.removeEventListener("change", update) : mq.removeListener(update);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.7);
      setHeadBorder(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open || builderOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, builderOpen]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, mode]);

  const confetti = useCallback(() => {
    const cols = ["#FF5B1F", "#17140F", "#E7E0D3", "#fff"];
    for (let k = 0; k < 26; k++) {
      const d = document.createElement("span");
      const sz = 8 + Math.random() * 14;
      d.style.cssText = `position:fixed;z-index:200;pointer-events:none;left:50%;top:55%;width:${sz}px;height:${sz}px;border-radius:${
        k % 3 ? "50%" : "3px"
      };background:${cols[k % cols.length]}`;
      document.body.appendChild(d);
      const ang = Math.random() * Math.PI * 2;
      const dist = 180 + Math.random() * 380;
      const anim = d.animate(
        [
          { transform: "translate(-50%,-50%) scale(0)", opacity: 1 },
          {
            transform: `translate(${Math.cos(ang) * dist}px,${Math.sin(ang) * dist + 120}px) scale(1) rotate(${
              Math.random() * 360
            }deg)`,
            opacity: 0,
          },
        ],
        { duration: 1400 + Math.random() * 700, easing: "cubic-bezier(.1,.7,.3,1)", fill: "forwards" }
      );
      anim.onfinish = () => d.remove();
    }
  }, []);

  const visibleWizard = useMemo(() => visibleWizardPages(answers), [answers]);

  const openWizard = useCallback(() => {
    setAnswers({});
    setOpen(true);
    setMode("intro");
    setIdx(0);
    setErr("");
    setSendError("");
  }, []);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const openBuilder = useCallback(() => {
    setBuilderOpen(true);
    setBuilderStep(0);
    setBuilderErr("");
    setBuilderSendError("");
    setArt({});
    setFit({ canopy: "contain", body: "contain" });
    setBuilderAnswers({});
  }, []);

  const setA = useCallback((key: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setErr("");
  }, []);

  const setWizardFile = useCallback(
    (key: string, e: ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      setA(key, f.name);
      e.target.value = "";
    },
    [setA]
  );

  const startQuestions = useCallback(() => {
    setMode("q");
    setIdx(0);
    setErr("");
  }, []);

  const next = useCallback(() => {
    const page = visibleWizard[Math.min(idx, visibleWizard.length - 1)];
    const e = validateWizardPage(page, answers);
    if (e) {
      setErr(e);
      const b = contRef.current;
      if (b)
        b.animate(
          [
            { transform: "translateX(0)" },
            { transform: "translateX(-8px)" },
            { transform: "translateX(8px)" },
            { transform: "translateX(-4px)" },
            { transform: "translateX(0)" },
          ],
          { duration: 360 }
        );
      return;
    }
    setErr("");
    setIdx((i) => i + 1);
  }, [answers, idx, visibleWizard]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const back = useCallback(() => {
    setErr("");
    setIdx((i) => Math.max(i - 1, 0));
  }, []);

  const submit = useCallback(async () => {
    const page = visibleWizard[visibleWizard.length - 1];
    const e = validateWizardPage(page, answers);
    if (e) {
      setErr(e);
      return;
    }
    setSending(true);
    setSendError("");
    const brief = buildWizardBrief(answers);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offer: answers.planning,
          contact: answers.contact,
          email: answers.email,
          phone: answers.phone,
          company: answers.company,
          brief,
        }),
      });
      if (!res.ok) throw new Error("failed");
      confetti();
      setMode("done");
    } catch {
      setSendError("Something went wrong sending that. Please try again, or reach us on WhatsApp.");
    } finally {
      setSending(false);
    }
  }, [answers, visibleWizard, confetti]);

  const finish = useCallback(() => {
    close();
    setMode("intro");
    setIdx(0);
    setAnswers({});
  }, [close]);

  const setArtFile = useCallback((key: "canopy" | "body", e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setArt((prev) => ({ ...prev, [key]: reader.result as string }));
    reader.readAsDataURL(f);
    e.target.value = "";
  }, []);

  const closeBuilder = useCallback(() => setBuilderOpen(false), []);

  const setBA = useCallback((key: string, value: unknown) => {
    setBuilderAnswers((prev) => ({ ...prev, [key]: value }));
    setBuilderErr("");
  }, []);

  const builderNext = useCallback(() => {
    if (builderStep === 2 && !String(builderAnswers.products || "").trim()) {
      setBuilderErr("Tell us what you'll be serving or showcasing.");
      return;
    }
    if (builderStep === 3 && !builderAnswers.decorations) {
      setBuilderErr("Pick a decoration style to keep going.");
      return;
    }
    setBuilderErr("");
    setBuilderStep((s) => Math.min(s + 1, BUILDER_STEP_COUNT - 1));
  }, [builderStep, builderAnswers]);

  const builderBack = useCallback(() => {
    setBuilderErr("");
    setBuilderStep((s) => Math.max(s - 1, 0));
  }, []);

  const submitBuilder = useCallback(async () => {
    if (!builderAnswers.contact || !builderAnswers.email) {
      setBuilderErr("Add your name and email so we can reply.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(String(builderAnswers.email))) {
      setBuilderErr("That email looks incomplete.");
      return;
    }
    setBuilderSending(true);
    setBuilderSendError("");
    const brief = [
      {
        n: "01",
        tag: "Sign",
        answer:
          art.canopy || art.body
            ? "Uploaded artwork online"
            : "No artwork yet, ask Re5 to design it",
      },
      { n: "02", tag: "Products", answer: String(builderAnswers.products || "Not answered") },
      {
        n: "03",
        tag: "Decorations",
        answer:
          [builderAnswers.decorations, builderAnswers.decorationsNote]
            .filter(Boolean)
            .join(", ") || "Not answered",
      },
      {
        n: "04",
        tag: "Design consultation",
        answer: builderAnswers.wantsConsultation ? "Requested" : "Not requested",
      },
    ];
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offer: "Make it Your Experience",
          contact: builderAnswers.contact,
          email: builderAnswers.email,
          phone: builderAnswers.phone,
          company: builderAnswers.company,
          brief,
        }),
      });
      if (!res.ok) throw new Error("failed");
      confetti();
      setBuilderStep(BUILDER_STEP_COUNT);
    } catch {
      setBuilderSendError(
        "Something went wrong sending that. Please try again, or reach us on WhatsApp."
      );
    } finally {
      setBuilderSending(false);
    }
  }, [builderAnswers, art, confetti]);

  /* ---- render helpers ---- */

  const isIntro = mode === "intro";
  const isQ = mode === "q";
  const isDone = mode === "done";
  const page = visibleWizard[Math.min(idx, visibleWizard.length - 1)] as WizardPageId | undefined;
  const isLastPage = idx >= visibleWizard.length - 1;

  return (
    <div className="page">
      <header className={`site-header ${headBorder ? "site-header-scrolled" : ""}`}>
        <a href="#top" aria-label="Re5 home" className="logo">
          Re5<span className="accent">.</span>
        </a>
        {!mobile ? (
          <nav className="nav">
            <a href="#popups">Experiences</a>
            <a href="#how">How It Works</a>
            <div className="nav-actions">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener"
                aria-label="Chat on WhatsApp"
                className="icon-btn"
              >
                <WhatsAppIcon />
              </a>
              <button className="btn btn-accent" onClick={openWizard}>
                Create Your Experience
              </button>
            </div>
          </nav>
        ) : (
          <div className="nav-actions">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener"
              aria-label="Chat on WhatsApp"
              className="icon-btn"
            >
              <WhatsAppIcon />
            </a>
            <button className="btn btn-accent" onClick={openWizard}>
              Book
            </button>
          </div>
        )}
      </header>

      <section id="top" className="hero">
        <div className="hero-copy">
          <h1 className="hero-heading">
            <span className="hero-kicker">Roll up.</span>
            <span className="hero-headline">
              EXPERIENCE IT.
              <StarIcon className="hero-star" />
            </span>
          </h1>
          <div className="hero-sub-group">
            <p className="hero-sub">
              <span className="accent-strong">Mobile experiences</span> designed for brands,
              events and celebrations.
            </p>
            <p className="hero-sub hero-sub-two">
              From the first look to the last interaction, we create experiences people want to
              be part of.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-ink" onClick={openWizard}>
              Create Your Experience <ArrowCircle />
            </button>
            <a href="#popups" className="link-underline">
              See what we offer
            </a>
          </div>
        </div>
        <div className="hero-media">
          <img
            src="/images/re5popup/hero-popcorn-serving.png"
            alt="Re5 popcorn experience serving guests"
            fetchPriority="high"
          />
        </div>
      </section>

      <div className="marquee-wrap">
        <Marquee />
      </div>

      <section id="popups" className="paths">
        <div className="paths-head">
          <h2 className="paths-heading">
            How do you want to <span className="accent">show up?</span>
          </h2>
        </div>
        <div className="paths-split">
          {PATHS.map((p) => (
            <div key={p.id} className="path-panel">
              <img
                className="path-panel-bg"
                src={p.images[0].src}
                alt={`${p.eyebrow} experience`}
                style={p.images[0].pos ? { objectPosition: p.images[0].pos } : undefined}
              />
              <div className="path-panel-overlay" aria-hidden="true" />
              <div className="path-panel-content">
                <span className="path-panel-eyebrow">{p.eyebrow}</span>
                <h3 className="path-panel-heading">{p.heading}</h3>
                <p className="path-panel-body">{p.body}</p>
                <p className="path-panel-body">{p.bodyTwo}</p>
                <div className="path-panel-cta-row">
                  <button
                    className="btn btn-accent path-panel-cta"
                    onClick={() => (p.cta === "builder" ? openBuilder() : openWizard())}
                  >
                    {p.ctaLabel} <ArrowCircle dark />
                  </button>
                  <span className="path-panel-note">Takes 2 minutes</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="signature">
        <div className="signature-media">
          <img src="/images/re5popup/cart-blank.png" alt="Re5 signature mobile cart" />
        </div>
        <div className="signature-copy">
          <h2 className="signature-heading">
            Our signature. <span className="accent">Your experience.</span>
          </h2>
          <p className="signature-body">
            Our signature mobile carts are where it starts. From there, we work with you to build
            the experience around your event, idea or brand, from the styling and signage to the
            tastes and people that bring it to life.
          </p>
        </div>
      </section>

      <section className="customize">
        <div className="customize-head">
          <h2>
            Your experience. <span className="accent">Your way.</span>
          </h2>
        </div>
        <div className="customize-list">
          <ul>
            {CUSTOM_WORDS.map((w) => (
              <li key={w}>
                <span className="muted">Your</span>
                <span>
                  {w}
                  <span className="accent">.</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="customize-footnote">
            We work with you to bring every detail together around the experience you have in
            mind.
          </p>
        </div>
      </section>

      <section id="how" className="pillars">
        <div className="pillars-head">
          <h2 className="pillars-heading">
            How it <span className="accent">works.</span>
          </h2>
          <p className="pillars-intro">
            It starts with a conversation. We get to know your idea, your moment and how you want
            people to experience it. Then we work with you to bring it to life.
          </p>
        </div>
        <ol className="pillars-list">
          {PILLARS.map((p) => (
            <li key={p.n} className="pillar">
              <span className="pillar-num">{p.n}</span>
              <div className="pillar-copy">
                <span className="pillar-title">{p.title}</span>
                <p className="pillar-body">{p.body}</p>
                {p.extra && <p className="pillar-extra">{p.extra}</p>}
              </div>
            </li>
          ))}
        </ol>
        <button className="btn btn-accent" onClick={openWizard}>
          Let&rsquo;s create it together <ArrowCircle dark />
        </button>
      </section>

      <section className="cta-banner-wrap">
        <div className="cta-banner">
          <div>
            <h2>Have something else in mind?</h2>
            <p className="cta-banner-lede">Have an idea we haven&rsquo;t mentioned? Tell us.</p>
          </div>
          <div className="cta-banner-side">
            <p>
              We love seeing where an idea can go and finding a way to make it{" "}
              <span className="accent">show up.</span>
            </p>
            <button className="btn btn-ink" onClick={openWizard}>
              Tell us your idea <ArrowCircle />
            </button>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <StarIcon className="final-cta-star" />
        <div className="final-cta-collage" aria-hidden="true">
          <div className="cta-photo cta-photo-1">
            <img src="/images/re5popup/slushie-group-toast.png" alt="" style={{ objectPosition: "50% 35%" }} />
          </div>
          <div className="cta-photo cta-photo-2">
            <img src="/images/re5popup/popcorn-kernels-crop.png" alt="" />
          </div>
          <div className="cta-photo cta-photo-3">
            <img src="/images/re5popup/cart-blank.png" alt="" />
          </div>
          <div className="cta-photo cta-photo-4">
            <img src="/images/re5popup/slushie-candy-crop.png" alt="" />
          </div>
        </div>
        <h2 className="final-cta-heading">
          <span>
            Make your moment <span className="final-cta-pop">show up.</span>
          </span>
        </h2>
        <p className="final-cta-sub">
          Your event. Your brand. Your idea. Let&rsquo;s create an experience people want to be
          part of.
        </p>
        <button className="btn btn-ink" onClick={openWizard}>
          Create Your Experience <ArrowCircle />
        </button>
      </section>

      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="footer-logo">
              Re5<span className="accent">.</span>
            </span>
            <p>
              Mobile experiences for brands, events and celebrations across Trinidad and
              Tobago.
            </p>
          </div>
          <div className="footer-cols">
            <div className="footer-col">
              <span className="footer-col-title">Explore</span>
              <a href="#popups">Experiences</a>
              <button className="footer-link-btn" onClick={openWizard}>
                Create Your Experience
              </button>
              <a href="#how">How It Works</a>
            </div>
            <div className="footer-col">
              <span className="footer-col-title">Say hello</span>
              <a href="mailto:hello@re5.tt">hello@re5.tt</a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener">
                WhatsApp
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">Made in Trinidad and Tobago.</div>
      </footer>

      {mobile && scrolled && !open && !builderOpen && (
        <div className="mobile-bar">
          <button className="btn btn-accent mobile-bar-cta" onClick={openWizard}>
            Create Your Experience <span className="arrow-circle arrow-circle-dark">&rarr;</span>
          </button>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener"
            aria-label="Chat on WhatsApp"
            className="mobile-bar-wa"
          >
            <WhatsAppIcon />
          </a>
        </div>
      )}

      {builderOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Make it your experience"
          className="modal wizard-modal"
        >
          <div className="modal-topbar">
            <span className="modal-logo">
              Re5<span className="accent">.</span>
            </span>
            <button aria-label="Close" className="modal-close" onClick={closeBuilder}>
              &times;
            </button>
          </div>

          {builderStep < BUILDER_STEP_COUNT && (
            <div className="wizard-progress-row">
              <div className="wizard-progress-track">
                <div
                  className="wizard-progress-fill"
                  style={{ width: `${((builderStep + 1) / BUILDER_STEP_COUNT) * 100}%` }}
                />
              </div>
              <span className="wizard-counter">
                {String(builderStep + 1).padStart(2, "0")} / {String(BUILDER_STEP_COUNT).padStart(2, "0")}
              </span>
            </div>
          )}

          <div className="wizard-scroll">
            <div className="wizard-stage">
              {builderStep === 0 && (
                <>
                  <span className="wizard-tag">
                    <StarIcon className="wizard-tag-star" /> Make it your experience
                  </span>
                  <h2 className="wizard-question">This is your blank canvas.</h2>
                  <p className="wizard-hint">
                    Every Re5 cart starts here. From this point, you choose the sign, the products
                    and the finishing touches, and we bring it to life.
                  </p>
                  <div className="builder-intro-cart">
                    <img src="/images/re5popup/cart-blank.png" alt="Blank Re5 experience cart" />
                  </div>
                </>
              )}

              {builderStep === 1 && (
                <>
                  <span className="wizard-tag">
                    <StarIcon className="wizard-tag-star" /> Design your sign
                  </span>
                  <h2 className="wizard-question">Put your name on it.</h2>
                  <p className="wizard-hint">
                    Upload your logo for the canopy and any artwork for the front panel. No
                    artwork yet? Skip it, we can design it for you.
                  </p>
                  <div className="builder-sign-body">
                    <div className="designer-preview">
                      <div className="designer-cart">
                        <img src="/images/re5popup/cart-blank.png" alt="Blank Re5 cart" />
                        <div
                          className="designer-zone designer-zone-canopy"
                          style={{
                            backgroundImage: art.canopy ? `url("${art.canopy}")` : "none",
                            backgroundSize: fit.canopy,
                          }}
                        />
                        <div
                          className="designer-zone designer-zone-body"
                          style={{
                            backgroundImage: art.body ? `url("${art.body}")` : "none",
                            backgroundSize: fit.body,
                          }}
                        />
                      </div>
                      <span className="designer-note">Preview only. Final finish may vary.</span>
                    </div>
                    <div className="designer-zones">
                      {(
                        [
                          ["canopy", "01", "Canopy", "Your logo or name along the front of the roof."],
                          ["body", "02", "Cart front", "Your artwork, poster or pattern on the front panel."],
                        ] as const
                      ).map(([key, n, label, hint]) => (
                        <div className="designer-zone-card" key={key}>
                          <div className="designer-zone-head">
                            <div>
                              <span className="designer-zone-n">{n}</span>
                              <span className="designer-zone-label">{label}</span>
                              <span className="designer-zone-hint">{hint}</span>
                            </div>
                            {art[key] && (
                              <div
                                className="designer-zone-thumb"
                                style={{ backgroundImage: `url("${art[key]}")` }}
                              />
                            )}
                          </div>
                          <div className="designer-zone-actions">
                            <label className="btn btn-ink designer-upload-btn">
                              {art[key] ? "Replace image" : "Upload image"}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setArtFile(key, e)}
                                hidden
                              />
                            </label>
                            {art[key] && (
                              <>
                                <div className="designer-fit-toggle">
                                  <button
                                    className={fit[key] === "contain" ? "active" : ""}
                                    onClick={() => setFit((s) => ({ ...s, [key]: "contain" }))}
                                  >
                                    Fit
                                  </button>
                                  <button
                                    className={fit[key] === "cover" ? "active" : ""}
                                    onClick={() => setFit((s) => ({ ...s, [key]: "cover" }))}
                                  >
                                    Fill
                                  </button>
                                </div>
                                <button
                                  className="designer-remove"
                                  onClick={() => setArt((s) => ({ ...s, [key]: null }))}
                                >
                                  Remove
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {builderStep === 2 && (
                <>
                  <span className="wizard-tag">
                    <StarIcon className="wizard-tag-star" /> Add your products
                  </span>
                  <h2 className="wizard-question">What will you be serving or showing off?</h2>
                  <p className="wizard-hint">
                    Drinks, snacks, merch, samples, anything. Tell us what&rsquo;s going in the
                    cart.
                  </p>
                  <textarea
                    className="wizard-textarea"
                    rows={3}
                    placeholder="e.g. our own cold brew, branded tote bags, a mini tasting menu"
                    value={String(builderAnswers.products || "")}
                    onChange={(e) => setBA("products", e.target.value)}
                  />
                </>
              )}

              {builderStep === 3 && (
                <>
                  <span className="wizard-tag">
                    <StarIcon className="wizard-tag-star" /> Decorations
                  </span>
                  <h2 className="wizard-question">How should it feel?</h2>
                  <div className="wizard-options">
                    {DECORATION_OPTS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`wizard-option ${
                          builderAnswers.decorations === opt ? "wizard-option-active" : ""
                        }`}
                        onClick={() => setBA("decorations", opt)}
                      >
                        <span className="wizard-option-mark">
                          {builderAnswers.decorations === opt ? "✓" : ""}
                        </span>
                        {opt}
                      </button>
                    ))}
                  </div>
                  {builderAnswers.decorations === "Themed to my event" && (
                    <label className="wizard-extra-field">
                      <span>Tell us the theme</span>
                      <input
                        value={String(builderAnswers.decorationsNote || "")}
                        onChange={(e) => setBA("decorationsNote", e.target.value)}
                        placeholder="e.g. sage and gold, or a beach theme"
                      />
                    </label>
                  )}
                </>
              )}

              {builderStep === 4 && (
                <>
                  <span className="wizard-tag">
                    <StarIcon className="wizard-tag-star" /> Expert help
                  </span>
                  <h2 className="wizard-question">Want a hand with the design?</h2>
                  <p className="wizard-hint">
                    If you&rsquo;d rather talk it through, book a free consultation with our
                    design team. Or skip this and continue, we&rsquo;ve got everything we need.
                  </p>
                  <div className="builder-consult-actions">
                    <a
                      href={CONSULTATION_BOOKING_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ink"
                      onClick={() => setBA("wantsConsultation", true)}
                    >
                      Book a free consultation <ArrowCircle />
                    </a>
                    <span className="builder-consult-note">
                      {builderAnswers.wantsConsultation
                        ? "Nice, we’ll see you there. Hit continue when you’re ready."
                        : "No consultation? No problem, just continue below."}
                    </span>
                  </div>
                </>
              )}

              {builderStep === 5 && (
                <>
                  <span className="wizard-tag">
                    <StarIcon className="wizard-tag-star" /> Last step
                  </span>
                  <h2 className="wizard-question">Where should we send this?</h2>
                  <div className="wizard-fields">
                    {CONTACT_FIELDS.map((f) => (
                      <label className="wizard-field" key={f.key}>
                        <span>{f.label}</span>
                        <input
                          type={f.type || "text"}
                          placeholder={f.ph}
                          value={String(builderAnswers[f.key] || "")}
                          onChange={(e) => setBA(f.key, e.target.value)}
                        />
                      </label>
                    ))}
                  </div>
                  <div className="wizard-review-list">
                    <div className="wizard-review-row">
                      <span className="wizard-review-tag">Sign</span>
                      <span className="wizard-review-answer">
                        {art.canopy || art.body ? "Uploaded artwork" : "No artwork yet"}
                      </span>
                    </div>
                    <div className="wizard-review-row">
                      <span className="wizard-review-tag">Products</span>
                      <span className="wizard-review-answer">
                        {builderAnswers.products ? String(builderAnswers.products) : "Not answered"}
                      </span>
                    </div>
                    <div className="wizard-review-row">
                      <span className="wizard-review-tag">Decorations</span>
                      <span className="wizard-review-answer">
                        {[builderAnswers.decorations, builderAnswers.decorationsNote]
                          .filter(Boolean)
                          .join(", ") || "Not answered"}
                      </span>
                    </div>
                    <div className="wizard-review-row">
                      <span className="wizard-review-tag">Consultation</span>
                      <span className="wizard-review-answer">
                        {builderAnswers.wantsConsultation ? "Requested" : "Not requested"}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {builderStep >= BUILDER_STEP_COUNT && (
                <div className="wizard-done">
                  <h2>
                    Got it<span className="accent">.</span>
                  </h2>
                  <p>
                    We&rsquo;ll put your experience together and follow up within a day with next
                    steps
                    {builderAnswers.wantsConsultation
                      ? ", and we'll see you at the consultation."
                      : "."}
                  </p>
                  <button className="btn btn-accent" onClick={closeBuilder}>
                    Back to Re5 <ArrowCircle dark />
                  </button>
                </div>
              )}
            </div>
          </div>

          {builderStep < BUILDER_STEP_COUNT && (
            <div className="wizard-footer">
              {builderStep > 0 ? (
                <button className="wizard-back-btn" onClick={builderBack}>
                  &larr; Back
                </button>
              ) : (
                <span />
              )}
              <div className="wizard-footer-right">
                {(builderStep === BUILDER_STEP_COUNT - 1 ? builderSendError : builderErr) && (
                  <span className="wizard-error">
                    {builderStep === BUILDER_STEP_COUNT - 1 ? builderSendError : builderErr}
                  </span>
                )}
                {builderStep < BUILDER_STEP_COUNT - 1 ? (
                  <button className="wizard-continue" onClick={builderNext}>
                    Continue <ArrowCircle />
                  </button>
                ) : (
                  <button
                    className="wizard-continue"
                    onClick={submitBuilder}
                    disabled={builderSending}
                  >
                    {builderSending ? "Sending…" : "Send it in"} <ArrowCircle />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {open && (
        <div role="dialog" aria-modal="true" className="modal wizard-modal">
          <div className="wizard-topbar">
            <span className="modal-logo">
              Re5<span className="accent">.</span>
            </span>
            <button aria-label="Close" className="modal-close" onClick={close}>
              &times;
            </button>
          </div>

          {isQ && (
            <div className="wizard-progress-row">
              <div className="wizard-progress-track">
                <div
                  className="wizard-progress-fill"
                  style={{ width: `${((idx + 1) / visibleWizard.length) * 100}%` }}
                />
              </div>
              <span className="wizard-counter">
                {String(idx + 1).padStart(2, "0")} / {String(visibleWizard.length).padStart(2, "0")}
              </span>
            </div>
          )}

          <div className="wizard-scroll" ref={scrollRef}>
            <div className="wizard-stage" ref={stageRef}>
              {isIntro && (
                <>
                  <span className="wizard-tag">
                    <StarIcon className="wizard-tag-star" /> Start your experience
                  </span>
                  <h2 className="wizard-question">Tell us what you have in mind.</h2>
                  <p className="wizard-hint">
                    We&rsquo;ll ask a few questions about your event or brand so we can
                    understand the experience you want to create.
                  </p>
                </>
              )}

              {isQ && page === "plan" && (
                <>
                  <span className="wizard-tag">
                    <StarIcon className="wizard-tag-star" /> The plan
                  </span>
                  <h2 className="wizard-question">What are you planning?</h2>
                  <div className="wizard-options">
                    {PLANNING_OPTS.map((opt, i) => (
                      <button
                        key={opt}
                        className={`wizard-option ${answers.planning === opt ? "wizard-option-active" : ""}`}
                        onClick={() => setA("planning", opt)}
                      >
                        <span className="wizard-option-mark">
                          {answers.planning === opt ? "✓" : String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                      </button>
                    ))}
                  </div>
                  {answers.planning === "Other" && (
                    <label className="wizard-extra-field">
                      <span>Tell us what you&rsquo;re planning</span>
                      <input
                        value={String(answers.planningOther || "")}
                        onChange={(e) => setA("planningOther", e.target.value)}
                        placeholder="What are you planning?"
                      />
                    </label>
                  )}
                  <div className="wizard-fields">
                    <label className="wizard-field">
                      <span>When is it happening?</span>
                      <input
                        type="date"
                        value={String(answers.eventDate || "")}
                        onChange={(e) => setA("eventDate", e.target.value)}
                      />
                    </label>
                    <label className="wizard-field">
                      <span>Where is it happening?</span>
                      <input
                        value={String(answers.venue || "")}
                        onChange={(e) => setA("venue", e.target.value)}
                        placeholder="Venue / Location"
                      />
                    </label>
                  </div>
                  <div className="wizard-subquestion">
                    <div className="wizard-options">
                      {["Venue confirmed", "Still deciding"].map((opt, i) => (
                        <button
                          key={opt}
                          className={`wizard-option ${answers.venueStatus === opt ? "wizard-option-active" : ""}`}
                          onClick={() => setA("venueStatus", opt)}
                        >
                          <span className="wizard-option-mark">
                            {answers.venueStatus === opt ? "✓" : String.fromCharCode(65 + i)}
                          </span>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="wizard-extra-field">
                    <span>How many guests or attendees are you expecting?</span>
                    <input
                      type="number"
                      min="0"
                      value={String(answers.guestCount || "")}
                      onChange={(e) => setA("guestCount", e.target.value)}
                      placeholder="Number"
                    />
                  </label>
                </>
              )}

              {isQ && page === "create" && (
                <>
                  <span className="wizard-tag">
                    <StarIcon className="wizard-tag-star" /> The experience
                  </span>
                  <h2 className="wizard-question">What would you like to create?</h2>
                  <p className="wizard-hint">
                    We&rsquo;re starting with Slushie and Popcorn, with more experiences to
                    come. Have something else in mind? Tell us. We&rsquo;d love to see how we
                    can make it <span className="accent">show up.</span>
                  </p>
                  <div className="wizard-choice-cards">
                    {CREATE_OPTS.map((c) => (
                      <button
                        key={c.id}
                        className={`wizard-choice-card ${
                          answers.create === c.id ? "wizard-choice-card-active" : ""
                        }`}
                        onClick={() => setA("create", c.id)}
                      >
                        <span className="wizard-choice-card-label">{c.label}</span>
                        <span className="wizard-choice-card-body">{c.body}</span>
                        <span className="wizard-choice-card-mark">
                          {answers.create === c.id ? "✓ Selected" : "Select"}
                        </span>
                      </button>
                    ))}
                  </div>
                  {answers.create === "another" && (
                    <label className="wizard-extra-field">
                      <span>What would you like to create?</span>
                      <input
                        value={String(answers.createIdea || "")}
                        onChange={(e) => setA("createIdea", e.target.value)}
                        placeholder="Tell us what you&rsquo;re thinking"
                      />
                    </label>
                  )}
                </>
              )}

              {isQ && page === "details" && (
                <>
                  <span className="wizard-tag">
                    <StarIcon className="wizard-tag-star" /> The details
                  </span>
                  <h2 className="wizard-question">Tell us about your experience.</h2>
                  <p className="wizard-hint">Who is the experience for?</p>
                  <div className="wizard-options">
                    {["Children", "Adults", "Both"].map((opt, i) => (
                      <button
                        key={opt}
                        className={`wizard-option ${answers.slushieFor === opt ? "wizard-option-active" : ""}`}
                        onClick={() => setA("slushieFor", opt)}
                      >
                        <span className="wizard-option-mark">
                          {answers.slushieFor === opt ? "✓" : String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                      </button>
                    ))}
                  </div>
                  {(answers.slushieFor === "Adults" || answers.slushieFor === "Both") && (
                    <div className="wizard-subquestion">
                      <p className="wizard-hint">Would you like an alcoholic slushie option?</p>
                      <div className="wizard-options">
                        {["Yes", "No", "Not sure yet"].map((opt, i) => (
                          <button
                            key={opt}
                            className={`wizard-option ${answers.alcohol === opt ? "wizard-option-active" : ""}`}
                            onClick={() => setA("alcohol", opt)}
                          >
                            <span className="wizard-option-mark">
                              {answers.alcohol === opt ? "✓" : String.fromCharCode(65 + i)}
                            </span>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {isQ && page === "yours" && (
                <>
                  <span className="wizard-tag">
                    <StarIcon className="wizard-tag-star" /> The look
                  </span>
                  <h2 className="wizard-question">Make it yours.</h2>
                  <p className="wizard-hint">Are we creating this around an existing look?</p>
                  <div className="wizard-options">
                    {[LOOK_THEME, LOOK_BRAND, LOOK_NONE].map((opt, i) => (
                      <button
                        key={opt}
                        className={`wizard-option ${answers.lookBasis === opt ? "wizard-option-active" : ""}`}
                        onClick={() => setA("lookBasis", opt)}
                      >
                        <span className="wizard-option-mark">
                          {answers.lookBasis === opt ? "✓" : String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                      </button>
                    ))}
                  </div>

                  {answers.lookBasis === LOOK_THEME && (
                    <div className="wizard-subquestion">
                      <label className="wizard-extra-field">
                        <span>Tell us about your theme or colours</span>
                        <input
                          value={String(answers.themeNote || "")}
                          onChange={(e) => setA("themeNote", e.target.value)}
                          placeholder="e.g. sage and gold"
                        />
                      </label>
                      <div className="wizard-uploads">
                        <label className="wizard-upload-row">
                          <input type="file" hidden onChange={(e) => setWizardFile("themeUpload", e)} />
                          <span className="wizard-upload-label">
                            Have something you&rsquo;d like us to see? (Optional)
                          </span>
                          <span className="wizard-upload-status">
                            <span className="wizard-upload-files">{String(answers.themeUpload || "")}</span>
                            <span
                              className={`wizard-upload-btn ${answers.themeUpload ? "wizard-upload-btn-filled" : ""}`}
                            >
                              {answers.themeUpload ? "Replace" : "Upload"}
                            </span>
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {answers.lookBasis === LOOK_BRAND && (
                    <div className="wizard-subquestion">
                      <div className="wizard-fields">
                        <label className="wizard-field">
                          <span>Business / Brand name</span>
                          <input
                            value={String(answers.brandName || "")}
                            onChange={(e) => setA("brandName", e.target.value)}
                          />
                        </label>
                        <label className="wizard-field">
                          <span>Brand colours</span>
                          <input
                            value={String(answers.brandColours || "")}
                            onChange={(e) => setA("brandColours", e.target.value)}
                            placeholder="e.g. navy and gold"
                          />
                        </label>
                      </div>
                      <div className="wizard-uploads">
                        <label className="wizard-upload-row">
                          <input type="file" hidden onChange={(e) => setWizardFile("brandLogo", e)} />
                          <span className="wizard-upload-label">Upload your logo</span>
                          <span className="wizard-upload-status">
                            <span className="wizard-upload-files">{String(answers.brandLogo || "")}</span>
                            <span
                              className={`wizard-upload-btn ${answers.brandLogo ? "wizard-upload-btn-filled" : ""}`}
                            >
                              {answers.brandLogo ? "Replace" : "Upload"}
                            </span>
                          </span>
                        </label>
                        <label className="wizard-upload-row">
                          <input type="file" hidden onChange={(e) => setWizardFile("brandMaterial", e)} />
                          <span className="wizard-upload-label">
                            Have brand material you&rsquo;d like us to see? (Optional)
                          </span>
                          <span className="wizard-upload-status">
                            <span className="wizard-upload-files">{String(answers.brandMaterial || "")}</span>
                            <span
                              className={`wizard-upload-btn ${answers.brandMaterial ? "wizard-upload-btn-filled" : ""}`}
                            >
                              {answers.brandMaterial ? "Replace" : "Upload"}
                            </span>
                          </span>
                        </label>
                      </div>
                    </div>
                  )}
                </>
              )}

              {isQ && page === "else" && (
                <>
                  <span className="wizard-tag">
                    <StarIcon className="wizard-tag-star" /> Last thing
                  </span>
                  <h2 className="wizard-question">Anything else we should know?</h2>
                  <p className="wizard-hint">
                    Is there anything else you&rsquo;d like us to know about the experience?
                    (Optional)
                  </p>
                  <textarea
                    className="wizard-textarea"
                    rows={4}
                    value={String(answers.notes || "")}
                    onChange={(e) => setA("notes", e.target.value)}
                    placeholder="Tell us anything else that would help."
                  />
                </>
              )}

              {isQ && page === "connect" && (
                <>
                  <span className="wizard-tag">
                    <StarIcon className="wizard-tag-star" /> Let&rsquo;s connect
                  </span>
                  <h2 className="wizard-question">Let&rsquo;s connect.</h2>
                  <div className="wizard-fields">
                    {CONTACT_FIELDS.map((f) => (
                      <label key={f.key} className="wizard-field">
                        <span>{f.label}</span>
                        <input
                          type={f.type || "text"}
                          value={String(answers[f.key] || "")}
                          onChange={(e) => setA(f.key, e.target.value)}
                          placeholder={f.ph}
                        />
                      </label>
                    ))}
                  </div>
                  <div className="wizard-subquestion">
                    <p className="wizard-hint">How would you prefer us to contact you?</p>
                    <div className="wizard-options">
                      {["WhatsApp", "Phone", "Email"].map((opt, i) => (
                        <button
                          key={opt}
                          className={`wizard-option ${answers.contactPref === opt ? "wizard-option-active" : ""}`}
                          onClick={() => setA("contactPref", opt)}
                        >
                          <span className="wizard-option-mark">
                            {answers.contactPref === opt ? "✓" : String.fromCharCode(65 + i)}
                          </span>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {isDone && (
                <div className="wizard-done">
                  <h2>
                    We&rsquo;ve got <span className="wizard-review-brand">it.</span>
                  </h2>
                  <p>
                    Thanks for telling us what you have in mind. We&rsquo;ll review your
                    request and get in touch to talk through your experience and the next
                    steps.
                  </p>
                  <button className="btn btn-ink" onClick={finish}>
                    Show up differently. <ArrowCircle />
                  </button>
                </div>
              )}
            </div>
          </div>

          {isIntro && (
            <div className="wizard-footer">
              <span />
              <div className="wizard-footer-right">
                <button ref={contRef} className="wizard-continue" onClick={startQuestions}>
                  Let&rsquo;s start <span className="arrow-circle arrow-circle-dark">&rarr;</span>
                </button>
              </div>
            </div>
          )}

          {isQ && (
            <div className="wizard-footer">
              <button className="wizard-back-btn" style={{ visibility: idx === 0 ? "hidden" : "visible" }} onClick={back}>
                &larr; BACK
              </button>
              <div className="wizard-footer-right">
                {(err || (isLastPage && sendError)) && (
                  <span className="wizard-error">{err || sendError}</span>
                )}
                {isLastPage ? (
                  <button ref={contRef} className="wizard-continue" onClick={submit} disabled={sending}>
                    {sending ? "Sending…" : "Send my request"}{" "}
                    <span className="arrow-circle arrow-circle-dark">&rarr;</span>
                  </button>
                ) : (
                  <button ref={contRef} className="wizard-continue" onClick={next}>
                    Next <span className="arrow-circle arrow-circle-dark">&rarr;</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Sub components                                                     */
/* ---------------------------------------------------------------- */

function Marquee() {
  const words = ["Experiences", "Stand Out", "Make A Moment", "Make It Pop"];
  const items: string[] = [];
  for (let i = 0; i < words.length * 3; i++) items.push(words[i % words.length]);
  const track = (key: number) => (
    <div className="marquee-track" key={key}>
      {items.map((w, i) => (
        <span key={i} className="marquee-item">
          {w}
          <StarIcon className="marquee-star" />
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-scroll">
        {track(0)}
        {track(1)}
      </div>
    </div>
  );
}

