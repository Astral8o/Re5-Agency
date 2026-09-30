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

type Answers = Record<string, unknown> & {
  assets?: Record<string, string[]>;
};

type FieldConfig = {
  key: string;
  label: string;
  ph?: string;
  type?: "text" | "email" | "tel" | "date" | "time";
};

type StepType = "single" | "multi" | "fields" | "uploads" | "text";

type ExtraConfig = {
  key: string;
  label: string;
  ph: string;
  show?: (a: Answers) => boolean;
  top?: boolean;
};

type StepConfig = {
  id: string;
  tag: string;
  q: string;
  type: StepType;
  req?: boolean;
  hint?: string;
  ph?: string;
  opts?: string[];
  optsFn?: (a: Answers) => string[];
  fields?: FieldConfig[];
  extra?: ExtraConfig;
  noAuto?: (v: string) => boolean;
  when?: (a: Answers) => boolean;
};

/* ---------------------------------------------------------------- */
/* Wizard config                                                     */
/* ---------------------------------------------------------------- */

const MULTI = "More than one";
const CUSTOM = "Create your own";
const STAFF = "Re5 staff";
const EXCL = ["Help us choose", "Not sure yet", "No add-ons"];
const BRANDED = ["Our logo or names on the cart", "Match our colours or theme"];

const hasK = (a: Answers) => ["Slushie Sweets", MULTI].includes(String(a.offer));
const hasC = (a: Answers) => ["Signature Slushie", MULTI].includes(String(a.offer));
const hasS = (a: Answers) => hasK(a) || hasC(a);
const hasP = (a: Answers) => ["Popcorn Pop-Up", MULTI].includes(String(a.offer));
const isCustom = (a: Answers) => a.offer === CUSTOM;

const EVENT_FIELDS: FieldConfig[] = [
  { key: "eventDate", label: "Event date", type: "date" },
  { key: "startTime", label: "Start time", type: "time" },
  { key: "venue", label: "Venue", ph: "Venue name or address" },
  { key: "area", label: "Area", ph: "e.g. Chaguanas, Tobago" },
];

const CONTACT_FIELDS: FieldConfig[] = [
  { key: "contact", label: "Your name *", ph: "Full name" },
  { key: "email", label: "Email *", ph: "you@email.com", type: "email" },
  { key: "phone", label: "Phone / WhatsApp", ph: "+1 868", type: "tel" },
  { key: "company", label: "Business or brand (if any)", ph: "Your brand" },
  { key: "instagram", label: "Instagram", ph: "@yourhandle" },
];

const UPLOADS = ["Logo", "Packaging artwork", "Invitation or theme", "Inspiration images"];

const visibleStepsFor = (a: Answers) => STEPS.filter((s) => !s.when || s.when(a));

function validateStep(step: StepConfig, a: Answers): string {
  if (step.id === "offer" && !a.offer) return "Pick one to keep going.";
  if (step.id === "customIdea" && !String(a.customIdea || "").trim())
    return "Tell us a bit about what you have in mind.";
  if (step.id === "brand") {
    if (!a.contact || !a.email) return "Add your name and email so we can reply.";
    if (!/^\S+@\S+\.\S+$/.test(String(a.email))) return "That email looks incomplete.";
  }
  return "";
}

function isAnswered(step: StepConfig, a: Answers): boolean {
  const v = a[step.id];
  if (step.type === "fields") return (step.fields || CONTACT_FIELDS).some((f) => a[f.key]);
  if (step.type === "uploads") return !!(a.assets && Object.values(a.assets).some((x) => x && x.length));
  if (Array.isArray(v)) return v.length > 0;
  return !!(v && String(v).trim());
}

const STEPS: StepConfig[] = [
  {
    id: "offer",
    tag: "The bar",
    q: "What would you like to book?",
    type: "single",
    req: true,
    opts: ["Slushie Sweets", "Signature Slushie", "Popcorn Pop-Up", MULTI, CUSTOM],
  },
  {
    id: "customIdea",
    tag: "Your idea",
    q: "Tell us what you want to create.",
    type: "text",
    req: true,
    ph: "Describe the pop-up, cart or experience you have in mind.",
    hint: "Walk us through it. The more detail, the better.",
    when: isCustom,
  },
  {
    id: "occasion",
    tag: "The occasion",
    q: "What are you celebrating?",
    type: "single",
    opts: [
      "Wedding",
      "Birthday party",
      "Kids' party",
      "Baby shower",
      "Graduation",
      "Corporate event",
      "Brand activation or launch",
      "Festival or fair",
      "Something else",
    ],
    extra: {
      key: "occasionOther",
      label: "Tell us more",
      ph: "What is the event?",
      show: (a) => a.occasion === "Something else",
    },
    noAuto: (v) => v === "Something else",
  },
  {
    id: "popPack",
    tag: "Popcorn packaging",
    q: "How should the popcorn be packed?",
    type: "single",
    opts: [
      "Custom printed boxes with our logo",
      "Branded paper bags",
      "Plain Re5 packaging",
      "Help us choose",
    ],
    when: hasP,
  },
  {
    id: "guests",
    tag: "Guests",
    q: "How many guests are you expecting?",
    type: "single",
    opts: ["Under 50", "50 to 100", "100 to 200", "200 to 400", "400+", "Not sure yet"],
  },
  {
    id: "hours",
    tag: "Service time",
    q: "How long should we serve?",
    type: "single",
    hint: "Every booking includes 3 hours of service. Extra hours are added to your quote.",
    opts: [
      "3 hours (standard)",
      "4 hours (+1 extra hour)",
      "5 hours (+2 extra hours)",
      "6+ hours",
      "Not sure yet",
    ],
  },
  {
    id: "staff",
    tag: "Staff",
    q: "Who will be serving?",
    type: "single",
    noAuto: (v) => v === STAFF,
    optsFn: (a) =>
      [
        a.offer === "Signature Slushie"
          ? null
          : "Self-serve (we set up, your guests help themselves)",
        STAFF,
        "Extra staff for a big crowd",
        "Help us choose",
      ].filter(Boolean) as string[],
  },
  {
    id: "addons",
    tag: "Add-ons",
    q: "Any add-ons?",
    type: "multi",
    hint: "Add-ons are priced separately and added to your quote.",
    when: (a) => !isCustom(a),
    optsFn: (a) =>
      (
        [
          ["Custom cup stickers", hasS],
          ["Extra flavours", () => true],
          ["Printed napkins", () => true],
          ["Menu sign", () => true],
          ["Extra service time", () => true],
          ["Lighting", () => true],
          ["Music or speaker", () => true],
        ] as [string, (a: Answers) => boolean][]
      )
        .filter((x) => x[1](a))
        .map((x) => x[0])
        .concat(["No add-ons"]),
    extra: {
      key: "addonsOther",
      label: "Anything else? (optional)",
      ph: "Tell us what you have in mind",
    },
  },
  {
    id: "event",
    tag: "The event",
    q: "When and where?",
    type: "fields",
    fields: EVENT_FIELDS,
    hint: "Rough details are fine.",
  },
  {
    id: "look",
    tag: "The look",
    q: "How should the cart look?",
    type: "single",
    when: (a) => !isCustom(a),
    opts: [...BRANDED, "Classic Re5 look", "Help us choose"],
    extra: {
      key: "lookNote",
      label: "Colours, theme or wording",
      ph: "e.g. sage and gold, or Kim and Andre 2026",
      show: (a) => BRANDED.includes(String(a.look)),
    },
    noAuto: (v) => BRANDED.includes(v),
  },
  {
    id: "assets",
    tag: "Artwork",
    q: "Share your artwork.",
    type: "uploads",
    hint: "All optional. Logos, invitations, mood boards, anything.",
    when: (a) => hasP(a) || BRANDED.includes(String(a.look)) || isCustom(a),
  },
  {
    id: "brand",
    tag: "About you",
    q: "Where should we send your quote?",
    type: "fields",
    fields: CONTACT_FIELDS,
    req: true,
  },
  {
    id: "else",
    tag: "Last thing",
    q: "Anything else we should know?",
    type: "text",
    ph: "Dietary needs, power at the venue, surprises, anything.",
  },
];

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

const HOW_ICONS: string[] = [
  'M4 7.5L6 3.5h11l2 4z|M4 7.5c0 1.2 1 2 2.2 2s2.3-.8 2.3-2c0 1.2 1 2 2.2 2s2.3-.8 2.3-2c0 1.2 1 2 2.2 2s2.3-.8 2.3-2c0 1.2.8 2 1.5 2|M6 9.5v3M17 9.5v3',
  "M6 7.5h12l-1.5 13.5h-9z|M5 5h14v2.5H5z|M7.5 5l.8-2h7.4l.8 2|M6.6 11.5h10.8M16.9 16.5H7.1",
  "M12 5v14M5 12h14",
  "M12 12V2.5M12 12l6.7-6.7M12 12h9.5M12 12l6.7 6.7M12 12v9.5M12 12l-6.7 6.7M12 12H2.5M12 12L5.3 5.3",
  "M6 2.5h12v19H6z",
];

const HOW_STEPS = [
  { n: "01", title: "Pick", body: "Choose one of our experiences or come to us with an idea." },
  {
    n: "02",
    title: "Make it yours",
    body: "We design the look, details and experience around your brand or occasion.",
  },
  { n: "03", title: "Add the extras", body: "Choose any add-ons you want when you book." },
  { n: "04", title: "We Pop Up", body: "We deliver, set up, serve and pack down." },
  {
    n: "05",
    title: "Share the moments with your friends",
    body: "Enjoy it with your guests and share it on socials.",
  },
];

const CUSTOM_WORDS = ["branding", "colours", "menu", "signage", "experience"];

const WHATSAPP_URL = "https://wa.me/18680000000";

// TODO(Re5): swap in your real Google Calendar appointment scheduling link.
const CONSULTATION_BOOKING_URL = "https://calendar.google.com/calendar/u/0/appointments";

/* ---------------------------------------------------------------- */
/* Packages (categories)                                             */
/* ---------------------------------------------------------------- */

type CategoryCta = "builder" | "wizard" | "custom";

type CategoryDef = {
  id: string;
  title: string;
  eyebrow: string;
  heading: string;
  body: string;
  images: { src: string; pos?: string }[];
  tags?: string;
  ctaLabel: string;
  cta: CategoryCta;
};

const CATEGORIES: CategoryDef[] = [
  {
    id: "build",
    title: "Make it Your Pop Up",
    eyebrow: "Build It Your Way",
    heading: "Start with a blank cart. Make it yours.",
    body: "Your sign, your products, your decorations. We'll walk you through it step by step, and bring in a designer if you want one.",
    images: [{ src: "/images/re5popup/cart-blank.png" }],
    ctaLabel: "Start building",
    cta: "builder",
  },
  {
    id: "food",
    title: "Food + Beverage Experiences",
    eyebrow: "Food + Beverage Experiences",
    heading: "The good stuff, made even better.",
    body: "The kind of pop-up people gather around, enjoy together and keep coming back to. A little something that makes the moment feel more fun, more social and more memorable.",
    images: [
      { src: "/images/re5popup/signature-slushie-cocktail.png", pos: "50% 30%" },
      { src: "/images/re5popup/popcorn-boxes.png", pos: "50% 55%" },
      { src: "/images/re5popup/slushie-candy-crop.png" },
    ],
    tags: "Slushie · Popcorn",
    ctaLabel: "Make your moment pop",
    cta: "wizard",
  },
  {
    id: "brand",
    title: "Brand Activation",
    eyebrow: "Brand Activation",
    heading: "Give them something to experience.",
    body: "Turn seeing your brand into experiencing it. Something that draws people in, gets them curious and gives them a reason to stop, explore and remember you.",
    images: [
      { src: "/images/re5popup/hero-popcorn-serving.png", pos: "50% 42%" },
      { src: "/images/re5popup/cart-blank.png" },
      { src: "/images/re5popup/slushie-group-toast.png", pos: "50% 35%" },
    ],
    ctaLabel: "Make your brand pop",
    cta: "custom",
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
  const [mode, setMode] = useState<"q" | "review" | "done">("q");
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const [fromReview, setFromReview] = useState(false);
  const [err, setErr] = useState("");
  const [answers, setAnswers] = useState<Answers>({});
  const [infoOpen, setInfoOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const [activeCat, setActiveCat] = useState(0);

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
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mirrors the latest wizard state so callbacks fired from setTimeout
  // (the single-choice auto-advance) always read fresh values instead of
  // whatever was closed over when the timeout was scheduled.
  const liveRef = useRef({ answers, idx, fromReview, mode });
  useEffect(() => {
    liveRef.current = { answers, idx, fromReview, mode };
  });

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

  const visibleSteps = useMemo(() => STEPS.filter((s) => !s.when || s.when(answers)), [answers]);

  const openWizard = useCallback(() => {
    if (revealTimer.current) clearTimeout(revealTimer.current);
    setAnswers({});
    setOpen(true);
    setMode("q");
    setIdx(0);
    setDir(1);
    setErr("");
    setFromReview(false);
    setSendError("");
  }, []);

  const startWith = useCallback(
    (offer: string) => {
      openWizard();
      setAnswers({ offer });
    },
    [openWizard]
  );

  const close = useCallback(() => {
    if (revealTimer.current) clearTimeout(revealTimer.current);
    setOpen(false);
  }, []);

  const setA = useCallback((key: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setErr("");
  }, []);

  const validate = useCallback((step: StepConfig): string => {
    return validateStep(step, liveRef.current.answers);
  }, []);

  const answered = useCallback((step: StepConfig): boolean => {
    return isAnswered(step, liveRef.current.answers);
  }, []);

  const next = useCallback(() => {
    if (revealTimer.current) clearTimeout(revealTimer.current);
    const { answers: a, idx: curIdx, fromReview: fromRev } = liveRef.current;
    const vis = visibleStepsFor(a);
    const step = vis[Math.min(curIdx, vis.length - 1)];
    const e = validateStep(step, a);
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
    if (fromRev || curIdx >= vis.length - 1) {
      setMode("review");
      setFromReview(false);
      setDir(1);
      setErr("");
    } else {
      setIdx((i) => i + 1);
      setDir(1);
      setErr("");
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (
        e.key === "Enter" &&
        !e.shiftKey &&
        liveRef.current.mode === "q" &&
        (e.target as HTMLElement)?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, next]);

  const back = useCallback(() => {
    if (revealTimer.current) clearTimeout(revealTimer.current);
    const { mode: curMode, answers: a, idx: curIdx } = liveRef.current;
    if (curMode === "review") {
      setMode("q");
      setIdx(visibleStepsFor(a).length - 1);
      setDir(-1);
      return;
    }
    if (curIdx === 0) return;
    setIdx((i) => i - 1);
    setDir(-1);
    setErr("");
  }, []);

  const pick = useCallback(
    (step: StepConfig, label: string) => {
      if (step.type === "single") {
        setAnswers((prev) => ({ ...prev, [step.id]: label }));
        setErr("");
        if (!(step.noAuto && step.noAuto(label))) {
          if (revealTimer.current) clearTimeout(revealTimer.current);
          revealTimer.current = setTimeout(() => next(), 420);
        }
        return;
      }
      setAnswers((prev) => {
        let cur = (prev[step.id] as string[] | undefined) || [];
        if (cur.includes(label)) {
          cur = cur.filter((x) => x !== label);
        } else if (EXCL.includes(label)) {
          cur = [label];
        } else {
          cur = [...cur.filter((x) => !EXCL.includes(x)), label];
        }
        return { ...prev, [step.id]: cur };
      });
      setErr("");
    },
    [next]
  );

  const fmt = useCallback((step: StepConfig, a: Answers): string => {
    const v = a[step.id];
    const note =
      step.extra && a[step.extra.key] && (!step.extra.show || step.extra.show(a))
        ? String(a[step.extra.key])
        : "";
    if (step.type === "fields") {
      return (step.fields || CONTACT_FIELDS)
        .map((f) => {
          const x = a[f.key];
          if (!x) return "";
          if (f.type === "date" && /^\d{4}-\d{2}-\d{2}$/.test(String(x))) {
            return new Date(`${x}T12:00`).toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            });
          }
          if (f.type === "time" && /^\d{2}:\d{2}/.test(String(x))) {
            const [hh, mm] = String(x).split(":").map(Number);
            return `${(hh % 12) || 12}:${String(mm).padStart(2, "0")} ${hh < 12 ? "am" : "pm"}`;
          }
          return String(x);
        })
        .filter(Boolean)
        .join(" · ");
    }
    if (step.type === "uploads") {
      return UPLOADS.map((u) => {
        const n = (a.assets || {})[u];
        return n && n.length ? `${u} (${n.length})` : "";
      })
        .filter(Boolean)
        .join(" · ");
    }
    const base = Array.isArray(v) ? v.join(" · ") : v ? String(v) : "";
    if (step.extra && step.extra.top) return [note, base].filter(Boolean).join(" · ");
    return [base, note].filter(Boolean).join(", ");
  }, []);

  const submit = useCallback(async () => {
    setSending(true);
    setSendError("");
    const brief = visibleSteps.map((s, i) => ({
      n: String(i + 1).padStart(2, "0"),
      tag: s.tag,
      answer: fmt(s, answers) || "Not answered",
    }));
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offer: answers.offer,
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
      setDir(1);
    } catch {
      setSendError("Something went wrong sending that. Please try again, or reach us on WhatsApp.");
    } finally {
      setSending(false);
    }
  }, [answers, visibleSteps, fmt, confetti]);

  const finish = useCallback(() => {
    close();
    setMode("q");
    setIdx(0);
    setAnswers({});
    setFromReview(false);
  }, [close]);

  const setArtFile = useCallback((key: "canopy" | "body", e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setArt((prev) => ({ ...prev, [key]: reader.result as string }));
    reader.readAsDataURL(f);
    e.target.value = "";
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
          offer: "Make it Your Pop Up",
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

  const step = visibleSteps[Math.min(idx, visibleSteps.length - 1)] as StepConfig | undefined;
  const isQ = mode === "q";
  const isReview = mode === "review";
  const isDone = mode === "done";
  const last = idx >= visibleSteps.length - 1;
  const contLabel = fromReview
    ? "Back to booking"
    : last
    ? "Review my booking"
    : step && (answered(step) || step.req)
    ? "Continue"
    : "Skip";

  return (
    <div className="page">
      <header className={`site-header ${headBorder ? "site-header-scrolled" : ""}`}>
        <a href="#top" aria-label="Re5 home" className="logo">
          Re5<span className="accent">.</span>
        </a>
        {!mobile ? (
          <nav className="nav">
            <a href="#popups">Pop-Ups</a>
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
                Create Your Pop-Up
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
              POP UP.
              <StarIcon className="hero-star" />
            </span>
          </h1>
          <p className="hero-sub">
            We create <span className="accent-strong">mobile experiences</span> designed around
            your brand, event or celebration across Trinidad and Tobago.
          </p>
          <div className="hero-actions">
            <button className="btn btn-ink" onClick={openWizard}>
              Create Your Pop-Up <ArrowCircle />
            </button>
            <a href="#popups" className="link-underline">
              See what we offer
            </a>
          </div>
        </div>
        <div className="hero-media">
          <img
            src="/images/re5popup/hero-popcorn-serving.png"
            alt="Re5 popcorn pop-up serving guests"
            fetchPriority="high"
          />
        </div>
      </section>

      <div className="marquee-wrap">
        <Marquee />
      </div>

      <section id="popups" className="categories">
        <div className="category-tabs">
          <div className="category-tablist" role="tablist" aria-label="Pop-up packages">
            {CATEGORIES.map((c, i) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                id={`cat-tab-${c.id}`}
                aria-selected={activeCat === i}
                aria-controls={`cat-panel-${c.id}`}
                className={`category-tab ${activeCat === i ? "active" : ""}`}
                onClick={() => setActiveCat(i)}
              >
                <span className="category-tab-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="category-tab-label">{c.title}</span>
              </button>
            ))}
          </div>
          {CATEGORIES.map((c, i) => (
            <div
              key={c.id}
              role="tabpanel"
              id={`cat-panel-${c.id}`}
              aria-labelledby={`cat-tab-${c.id}`}
              className="category-panel"
              hidden={activeCat !== i}
            >
              <span className="category-eyebrow">{c.eyebrow}</span>
              <h2 className="category-heading">{c.heading}</h2>
              <p className="category-body">{c.body}</p>
              <CategoryCarousel images={c.images} />
              {c.tags && <span className="category-tags">{c.tags}</span>}
              <div className="category-cta-group">
                <button
                  className={`btn ${i === 0 ? "btn-accent" : "btn-ink"} category-cta`}
                  onClick={() => {
                    if (c.cta === "builder") openBuilder();
                    else if (c.cta === "custom") startWith(CUSTOM);
                    else openWizard();
                  }}
                >
                  {c.ctaLabel} <ArrowCircle dark={i === 0} />
                </button>
                <span className="category-cta-note">Takes 2 minutes</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="customize">
        <div className="customize-head">
          <h2>
            Your pop-up. <span className="accent">Your way.</span>
          </h2>
          <p>Every Re5 experience can be customized around what you&rsquo;re creating.</p>
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
            We take care of the design, setup, service and pack down.
          </p>
        </div>
      </section>

      <section className="cta-banner-wrap">
        <div className="cta-banner">
          <div>
            <h2>Have something else in mind?</h2>
            <p className="cta-banner-lede">Re5 isn&rsquo;t limited to what you see here.</p>
          </div>
          <div className="cta-banner-side">
            <p>Tell us what you want to create and we&rsquo;ll explore how to turn it into an experience.</p>
            <button className="btn btn-ink" onClick={openWizard}>
              Tell us your idea <ArrowCircle />
            </button>
          </div>
        </div>
      </section>

      <section id="how" className="how">
        <h2 className="how-heading">
          How <span className="how-brand">Re5</span> works
        </h2>
        <ol className="how-steps">
          {HOW_STEPS.map((s, i) => (
            <li key={s.n} className="how-step">
              <span className="how-step-top">
                <span className="how-step-num">{s.n}</span>
                <span className="how-step-icon">
                  <HowIcon paths={HOW_ICONS[i]} />
                </span>
              </span>
              <span className="how-step-title">{s.title}</span>
              <span className="how-step-body">{s.body}</span>
            </li>
          ))}
        </ol>
        <a href="#popups" className="btn btn-accent how-cta">
          Explore All Pop Ups <ArrowCircle dark />
        </a>
        <div className="how-footer">
          <div>
            <span className="how-footer-title">Let&rsquo;s talk it through.</span>
            <span className="how-footer-body">
              Tell us what you have in mind and we&rsquo;ll work with you to create the experience.
            </span>
          </div>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener" className="btn btn-outline-light">
            <WhatsAppIcon /> Chat on WhatsApp &rarr;
          </a>
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
            Make your moment <span className="final-cta-pop">POP!</span>
          </span>
        </h2>
        <p className="final-cta-sub">Ready when you are.</p>
        <button className="btn btn-ink" onClick={openWizard}>
          Create Your Pop-Up <ArrowCircle />
        </button>
      </section>

      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="footer-logo">
              Re5<span className="accent">.</span>
            </span>
            <p>
              Mobile pop-up experiences for brands, events and celebrations across Trinidad and
              Tobago.
            </p>
          </div>
          <div className="footer-cols">
            <div className="footer-col">
              <span className="footer-col-title">Explore</span>
              <a href="#popups">Pop-Ups</a>
              <button className="footer-link-btn" onClick={openWizard}>
                Create Your Pop-Up
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
            Create Your Pop-Up <span className="arrow-circle arrow-circle-dark">&rarr;</span>
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
          aria-label="Make it your pop up"
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
                    <StarIcon className="wizard-tag-star" /> Make it your pop up
                  </span>
                  <h2 className="wizard-question">This is your blank canvas.</h2>
                  <p className="wizard-hint">
                    Every Re5 cart starts here. From this point, you choose the sign, the products
                    and the finishing touches, and we bring it to life.
                  </p>
                  <div className="builder-intro-cart">
                    <img src="/images/re5popup/cart-blank.png" alt="Blank Re5 pop-up cart" />
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
                    We&rsquo;ll put your pop-up together and follow up within a day with next
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

      {open && step && (
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
                  style={{ width: `${((idx + 1) / visibleSteps.length) * 100}%` }}
                />
              </div>
              <span className="wizard-counter">
                {String(idx + 1).padStart(2, "0")} / {String(visibleSteps.length).padStart(2, "0")}
              </span>
            </div>
          )}

          <div className="wizard-scroll" ref={scrollRef}>
            <div className="wizard-stage" ref={stageRef}>
              {isQ && (
                <WizardQuestion
                  step={step}
                  answers={answers}
                  infoOpen={infoOpen}
                  onInfoToggle={() => setInfoOpen((v) => !v)}
                  onPick={(label) => pick(step, label)}
                  onSetA={setA}
                />
              )}

              {isReview && (
                <div className="wizard-review">
                  <div className="wizard-review-sub">
                    {answers.company || answers.contact
                      ? `Prepared for ${answers.company || answers.contact}`
                      : "Your booking"}
                  </div>
                  <h2 className="wizard-review-heading">
                    Your <span className="wizard-review-brand">booking</span>
                  </h2>
                  <div className="wizard-review-list">
                    {visibleSteps.map((s, i) => {
                      const ans = fmt(s, answers);
                      return (
                        <div className="wizard-review-row" key={s.id}>
                          <span className="wizard-review-tag">
                            {String(i + 1).padStart(2, "0")} &middot; {s.tag}
                          </span>
                          <span className={`wizard-review-answer ${ans ? "" : "muted"}`}>
                            {ans || "Not answered"}
                          </span>
                          <button
                            className="wizard-review-edit"
                            onClick={() => {
                              setMode("q");
                              setIdx(i);
                              setFromReview(true);
                              setDir(1);
                            }}
                          >
                            EDIT
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {sendError && <p className="wizard-error">{sendError}</p>}
                  <div className="wizard-review-actions">
                    <button className="btn btn-accent" onClick={submit} disabled={sending}>
                      {sending ? "Sending…" : "Send my request"} <ArrowCircle dark />
                    </button>
                    <button className="wizard-back-link" onClick={back}>
                      &larr; BACK TO QUESTIONS
                    </button>
                  </div>
                </div>
              )}

              {isDone && (
                <div className="wizard-done">
                  <h2>
                    You&rsquo;re ready to <span className="wizard-review-brand">pop up.</span>
                  </h2>
                  <p>
                    Thanks! We&rsquo;ve received your request. We&rsquo;ll check the date and get
                    back to you with a quote.
                  </p>
                  <button className="btn btn-ink" onClick={finish}>
                    BACK TO THE SITE
                  </button>
                </div>
              )}
            </div>
          </div>

          {isQ && (
            <div className="wizard-footer">
              <button className="wizard-back-btn" style={{ visibility: idx === 0 ? "hidden" : "visible" }} onClick={back}>
                &larr; BACK
              </button>
              <div className="wizard-footer-right">
                {err && <span className="wizard-error">{err}</span>}
                <button ref={contRef} className="wizard-continue" onClick={next}>
                  {contLabel} <span className="arrow-circle arrow-circle-dark">&rarr;</span>
                </button>
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
  const words = ["Pop Up", "Stand Out", "Make A Moment", "Make It Pop"];
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

function HowIcon({ paths }: { paths: string }) {
  return (
    <svg viewBox="0 0 24 24" className="how-icon" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {paths.split("|").map((d, i) => (
        <path d={d} key={i} />
      ))}
    </svg>
  );
}

function CategoryCarousel({ images }: { images: { src: string; pos?: string }[] }) {
  const [i, setI] = useState(0);
  const go = (next: number) => setI((next + images.length) % images.length);

  return (
    <div className="category-carousel">
      <div
        className="category-carousel-track"
        style={{ transform: `translateX(-${i * 100}%)` }}
      >
        {images.map((img, idx) => (
          <div className="category-carousel-slide" key={idx}>
            <img src={img.src} alt="" style={img.pos ? { objectPosition: img.pos } : undefined} />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <>
          <button
            type="button"
            className="category-carousel-nav category-carousel-prev"
            onClick={() => go(i - 1)}
            aria-label="Previous photo"
          >
            &lsaquo;
          </button>
          <button
            type="button"
            className="category-carousel-nav category-carousel-next"
            onClick={() => go(i + 1)}
            aria-label="Next photo"
          >
            &rsaquo;
          </button>
          <div className="category-carousel-dots">
            {images.map((_, idx) => (
              <button
                type="button"
                key={idx}
                className={`category-carousel-dot ${idx === i ? "active" : ""}`}
                onClick={() => go(idx)}
                aria-label={`Go to photo ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function WizardQuestion({
  step,
  answers,
  infoOpen,
  onInfoToggle,
  onPick,
  onSetA,
}: {
  step: StepConfig;
  answers: Answers;
  infoOpen: boolean;
  onInfoToggle: () => void;
  onPick: (label: string) => void;
  onSetA: (key: string, value: unknown) => void;
}) {
  const options = step.optsFn ? step.optsFn(answers) : step.opts || [];
  const selected = step.type === "multi" ? ((answers[step.id] as string[]) || []) : [String(answers[step.id] || "")];
  const showExtra = !!(step.extra && (!step.extra.show || step.extra.show(answers)));
  const showInfoTooltip = infoOpen && step.id === "staff";
  const isCocktailContext = hasC(answers) || !answers.offer;
  const isKidsPopContext = hasK(answers) || hasP(answers) || !answers.offer;

  return (
    <>
      <div className="wizard-tag">
        <StarIcon className="wizard-tag-star" />
        {step.tag}
      </div>
      <h2 className="wizard-question">{step.q}</h2>
      {step.hint && <p className="wizard-hint">{step.hint}</p>}

      {step.extra && step.extra.top && showExtra && (
        <label className="wizard-extra-field">
          <span>{step.extra.label}</span>
          <input
            value={String(answers[step.extra.key] || "")}
            onChange={(e) => onSetA(step.extra!.key, e.target.value)}
            placeholder={step.extra.ph}
          />
        </label>
      )}

      {(step.type === "single" || step.type === "multi") && (
        <div className="wizard-options">
          {options.map((label, i) => {
            const on = selected.includes(label);
            const isStaff = label === STAFF;
            return (
              <button
                key={label}
                className={`wizard-option ${on ? "wizard-option-active" : ""}`}
                onClick={() => onPick(label)}
              >
                <span className="wizard-option-mark">{on ? "✓" : String.fromCharCode(65 + i)}</span>
                <span>{label}</span>
                {isStaff && (
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label="What Re5 staff includes"
                    className="wizard-option-info"
                    onClick={(e) => {
                      e.stopPropagation();
                      onInfoToggle();
                    }}
                  >
                    i
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {showInfoTooltip && (
        <div role="note" className="wizard-info-note">
          <button aria-label="Close" className="wizard-info-close" onClick={onInfoToggle}>
            &times;
          </button>
          <span className="wizard-info-title">Re5 staff</span>
          <span>Our own team runs the cart for you, from the first pour to pack down.</span>
          {isCocktailContext && (
            <span>
              <strong>Signature Slushie:</strong> a trained bartender mixes, pours and checks IDs
              for 18+.
            </span>
          )}
          {isKidsPopContext && (
            <span>
              <strong>Slushie Sweets and Popcorn Pop-Up:</strong> a friendly attendant serves, tops
              up and keeps the cart looking good.
            </span>
          )}
        </div>
      )}

      {step.type === "text" && (
        <textarea
          className="wizard-textarea"
          value={String(answers[step.id] || "")}
          onChange={(e) => onSetA(step.id, e.target.value)}
          placeholder={step.ph}
          rows={4}
        />
      )}

      {step.type === "fields" && (
        <div className="wizard-fields">
          {(step.fields || CONTACT_FIELDS).map((f) => (
            <label key={f.key} className="wizard-field">
              <span>{f.label}</span>
              <input
                type={f.type || "text"}
                value={String(answers[f.key] || "")}
                onChange={(e) => onSetA(f.key, e.target.value)}
                placeholder={f.ph}
              />
            </label>
          ))}
        </div>
      )}

      {step.type === "uploads" && (
        <div className="wizard-uploads">
          {UPLOADS.map((u) => {
            const names = (answers.assets || {})[u] || [];
            return (
              <label key={u} className="wizard-upload-row">
                <input
                  type="file"
                  multiple
                  hidden
                  onChange={(e) => {
                    const fileNames = Array.from(e.target.files || []).map((f) => f.name);
                    onSetA("assets", { ...(answers.assets || {}), [u]: fileNames });
                  }}
                />
                <span className="wizard-upload-label">{u}</span>
                <span className="wizard-upload-status">
                  <span className="wizard-upload-files">{names.join(", ")}</span>
                  <span className={`wizard-upload-btn ${names.length ? "wizard-upload-btn-filled" : ""}`}>
                    {names.length ? "Replace" : "Add files"}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      )}

      {step.extra && !step.extra.top && showExtra && (
        <label className="wizard-extra-field">
          <span>{step.extra.label}</span>
          <input
            value={String(answers[step.extra.key] || "")}
            onChange={(e) => onSetA(step.extra!.key, e.target.value)}
            placeholder={step.extra.ph}
          />
        </label>
      )}
    </>
  );
}
