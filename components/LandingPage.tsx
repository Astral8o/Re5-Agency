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
const STAFF = "Re5 staff";
const EXCL = ["Help us choose", "Not sure yet", "No add-ons"];
const BRANDED = ["Our logo or names on the cart", "Match our colours or theme"];

const hasK = (a: Answers) => ["Slushie Sweets", MULTI].includes(String(a.offer));
const hasC = (a: Answers) => ["Signature Slushie", MULTI].includes(String(a.offer));
const hasS = (a: Answers) => hasK(a) || hasC(a);
const hasP = (a: Answers) => ["Popcorn Pop-Up", MULTI].includes(String(a.offer));

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
    opts: ["Slushie Sweets", "Signature Slushie", "Popcorn Pop-Up", MULTI],
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
    when: (a) => hasP(a) || BRANDED.includes(String(a.look)),
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

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="check-icon" aria-hidden="true">
      <path
        d="M3.5 8.5l3 3 6-6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
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

type Offering = {
  key: "sweets" | "cocktail" | "popcorn";
  num: string;
  name: string;
  eyebrow: string;
  headline: string;
  body: string;
  included: string[];
  price: string;
  image: string;
  alt: string;
  imagePos: string;
  dark?: boolean;
};

const SWEETS: Offering = {
  key: "sweets",
  num: "01",
  name: "Slushie Sweets",
  eyebrow: "Kids' parties · Birthdays · Wherever the party is",
  headline: "The kind of fun they'll grow up remembering.",
  body: "Give them something fun to enjoy with their favourite people, creating childhood memories they'll talk about for years to come.",
  included: [
    "The Slushie Sweets setup",
    "Candy toppings bar for 3 hours",
    "2 slushie flavours",
    "Kid-sized cups, lids and fun straws",
    "Custom front signage",
    "Design consultation and preview",
    "Delivery, setup and pack down",
  ],
  price: "TT$2,400",
  image: "/images/re5popup/slushie-sweets-kids.png",
  alt: "Kids' slushie pop-up with a candy toppings bar",
  imagePos: "50% 45%",
};

const COCKTAIL: Offering = {
  key: "cocktail",
  num: "01",
  name: "Signature Slushie",
  eyebrow: "Adults 18+ · Weddings · Parties · Celebrations",
  headline: "Good drinks. Even better company.",
  body: "Enjoy slushies with your favourite people and make more of the moments worth talking about, and sharing with friends on socials.",
  included: [
    "Up to 40 servings",
    "3 hours of service",
    "Our Signature setup",
    "Two curated slushie flavours",
    "Alcoholic or non-alcoholic options",
    "Fruit, sweets and rim garnishes",
    "Custom signage",
    "Customized drinkware",
    "On-site bartender",
    "Setup and pack down",
  ],
  price: "TT$2,800",
  image: "/images/re5popup/signature-slushie-cocktail.png",
  alt: "Bartender topping a slushie cocktail",
  imagePos: "50% 30%",
};

const POPCORN: Offering = {
  key: "popcorn",
  num: "02",
  name: "Popcorn Pop-Up",
  eyebrow: "Brands · Launches · Corporate",
  headline: "Let the smell draw them in.",
  body: "There's nothing like the smell of fresh popcorn to draw people in. Turn that curiosity into a chance to experience your brand.",
  included: [
    "The Popcorn setup",
    "Seasoning bar for 3 hours",
    "2 popcorn flavours",
    "Custom popcorn packaging",
    "Custom front signage",
    "Design consultation and preview",
    "Delivery, setup and pack down",
  ],
  price: "TT$2,000",
  image: "/images/re5popup/popcorn-boxes.png",
  alt: "Branded popcorn boxes beside the popcorn machine",
  imagePos: "50% 65%",
  dark: true,
};

const CUSTOM_WORDS = ["branding", "colours", "menu", "signage", "experience"];

const WHATSAPP_URL = "https://wa.me/18680000000";

/* ---------------------------------------------------------------- */
/* Component                                                          */
/* ---------------------------------------------------------------- */

export default function LandingPage() {
  const [mobile, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [headBorder, setHeadBorder] = useState(false);

  const [activeOffer, setActiveOffer] = useState<"sweets" | "popcorn" | null>("sweets");
  const [sweetsVariant, setSweetsVariant] = useState<"kids" | "adults">("kids");

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

  const [desOpen, setDesOpen] = useState(false);
  const [art, setArt] = useState<{ canopy?: string | null; body?: string | null }>({});
  const [fit, setFit] = useState<{ canopy: "contain" | "cover"; body: "contain" | "cover" }>({
    canopy: "contain",
    body: "contain",
  });

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
    document.body.style.overflow = open || desOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, desOpen]);

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

  const openDesigner = useCallback(() => {
    setDesOpen(true);
  }, []);
  const closeDesigner = useCallback(() => setDesOpen(false), []);

  const setArtFile = useCallback((key: "canopy" | "body", e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setArt((prev) => ({ ...prev, [key]: reader.result as string }));
    reader.readAsDataURL(f);
    e.target.value = "";
  }, []);

  const quoteCart = useCallback(() => {
    const parts = [art.canopy && "canopy artwork", art.body && "front panel artwork"].filter(
      Boolean
    ) as string[];
    openWizard();
    setDesOpen(false);
    setAnswers({
      look: parts.length ? BRANDED[0] : undefined,
      cartDesign: parts.length ? `Designed online: ${parts.join(" + ")}` : "No artwork yet",
    });
  }, [art, openWizard]);

  /* ---- pop-up tab data ---- */
  const activeOffering: Offering | null =
    activeOffer === "sweets" ? (sweetsVariant === "kids" ? SWEETS : COCKTAIL) : activeOffer === "popcorn" ? POPCORN : null;

  const bookFromPanel = () => {
    if (!activeOffering) return;
    startWith(activeOffering.name);
  };

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

      <section id="popups" className="popups">
        <div className="popups-head">
          <h2>Pick your pop-up</h2>
          <p>Start with one of our experiences. We&rsquo;ll make it yours.</p>
        </div>
        <div className="popups-grid">
          <div className="popups-list">
            <button
              className={`popup-row ${activeOffer === "sweets" ? "popup-row-active" : ""}`}
              onClick={() => setActiveOffer(mobile && activeOffer === "sweets" ? null : "sweets")}
            >
              <span className="popup-row-num">01</span>
              <span className="popup-row-name">Slushie Pop-Up</span>
              <span
                className={`arrow-circle ${activeOffer === "sweets" ? "arrow-circle-active" : ""}`}
              >
                &rarr;
              </span>
            </button>
            {mobile && activeOffer === "sweets" && (
              <PopupPanel
                offering={sweetsVariant === "kids" ? SWEETS : COCKTAIL}
                variant={sweetsVariant}
                onVariant={setSweetsVariant}
                onBook={bookFromPanel}
              />
            )}

            <button
              className={`popup-row ${activeOffer === "popcorn" ? "popup-row-active" : ""}`}
              onClick={() => setActiveOffer(mobile && activeOffer === "popcorn" ? null : "popcorn")}
            >
              <span className="popup-row-num">02</span>
              <span className="popup-row-name">Popcorn Pop-Up</span>
              <span
                className={`arrow-circle ${activeOffer === "popcorn" ? "arrow-circle-active" : ""}`}
              >
                &rarr;
              </span>
            </button>
            {mobile && activeOffer === "popcorn" && (
              <PopupPanel offering={POPCORN} onBook={bookFromPanel} />
            )}

            <div className="popup-teaser">
              <span className="popup-teaser-title">
                <StarIcon className="popup-teaser-star" />
                What&rsquo;s popping up next?
              </span>
              <span className="popup-teaser-body">
                New Re5 experiences are always in the works. Check back to see what&rsquo;s coming.
              </span>
            </div>
          </div>
          {!mobile && (
            <div className="popups-panel">
              {activeOffer === "sweets" && (
                <PopupPanel
                  offering={sweetsVariant === "kids" ? SWEETS : COCKTAIL}
                  variant={sweetsVariant}
                  onVariant={setSweetsVariant}
                  onBook={bookFromPanel}
                />
              )}
              {activeOffer === "popcorn" && <PopupPanel offering={POPCORN} onBook={bookFromPanel} />}
            </div>
          )}
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

      {mobile && scrolled && !open && !desOpen && (
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

      {desOpen && (
        <div role="dialog" aria-modal="true" aria-label="Design your cart" className="modal designer-modal">
          <div className="modal-topbar">
            <span className="modal-logo">
              Re5<span className="accent">.</span>
            </span>
            <button aria-label="Close" className="modal-close" onClick={closeDesigner}>
              &times;
            </button>
          </div>
          <div className="designer-body">
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
            <div className="designer-form">
              <div className="designer-form-head">
                <h2>
                  Design your <span className="accent">cart.</span>
                </h2>
                <p>Upload your artwork and see it on the cart. Your logo on the canopy, your design on the front.</p>
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
              <div className="designer-submit-row">
                <button className="btn btn-accent designer-quote-btn" onClick={quoteCart}>
                  Quote this cart <ArrowCircle dark />
                </button>
                <span className="designer-skip-note">No artwork yet? Skip it. We can design it for you.</span>
              </div>
            </div>
          </div>
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
  const words = ["Slushie Sweets", "Signature Slushie", "Popcorn Pop-Up"];
  const items: string[] = [];
  for (let i = 0; i < 9; i++) items.push(words[i % 3]);
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

function PopupPanel({
  offering,
  variant,
  onVariant,
  onBook,
}: {
  offering: Offering;
  variant?: "kids" | "adults";
  onVariant?: (v: "kids" | "adults") => void;
  onBook: () => void;
}) {
  return (
    <div className={`popup-panel ${offering.dark ? "popup-panel-dark" : ""}`}>
      {onVariant && (
        <div className="popup-subtabs">
          <button
            className={variant === "kids" ? "active" : ""}
            onClick={() => onVariant("kids")}
          >
            <span className="popup-subtab-title">Slushie Sweets</span>
            <span className="popup-subtab-tag">Kids</span>
          </button>
          <button
            className={variant === "adults" ? "active" : ""}
            onClick={() => onVariant("adults")}
          >
            <span className="popup-subtab-title">Signature Slushie</span>
            <span className="popup-subtab-tag">Adults 18+</span>
          </button>
        </div>
      )}
      <div className="popup-panel-media">
        <img src={offering.image} alt={offering.alt} style={{ objectPosition: offering.imagePos }} />
      </div>
      <div className="popup-panel-body">
        <span className="popup-panel-eyebrow">{offering.eyebrow}</span>
        <h3 className="popup-panel-name">{offering.name}</h3>
        <div className="popup-panel-pitch">
          <p className="popup-panel-headline">{offering.headline}</p>
          <p className="popup-panel-copy">{offering.body}</p>
        </div>
        <div className="popup-panel-included">
          <span className="popup-panel-eyebrow">What&rsquo;s included</span>
          <ul>
            {offering.included.map((item) => (
              <li key={item}>
                <CheckIcon />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="popup-panel-addons">Want more? Add on extras when you book.</p>
        <div className="popup-panel-price-row">
          <div>
            <span className="popup-panel-eyebrow">Starting from</span>
            <span className="popup-panel-price">{offering.price}</span>
          </div>
          <button className={`btn ${offering.dark ? "btn-accent" : "btn-ink"}`} onClick={onBook}>
            Book {offering.name} <ArrowCircle dark={!offering.dark} />
          </button>
        </div>
      </div>
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
