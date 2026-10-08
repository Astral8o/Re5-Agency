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
/* Request form config                                                */
/* Two paths: a playful one for events and private celebrations, and  */
/* a strategic one for brands (brand, audience, campaign first).       */
/* ---------------------------------------------------------------- */

type PathId = "event" | "brand";

const PATH_OPTS: { id: PathId; label: string; body: string }[] = [
  { id: "event", label: "Event or Private Celebration", body: "Birthdays, weddings, baby showers and celebrations." },
  { id: "brand", label: "Brand Experience", body: "Launches, campaigns and ways to put your product in people's hands." },
];

// The current offer is the Frozen Experience.
const FROZEN = "The Frozen Experience";

const EVENT_TYPES = ["Birthday", "Wedding", "Baby Shower", "Corporate Celebration", "Other"];

const NOT_SURE = "I’m not sure yet";
// Event flavours for the Frozen Experience.
const FLAVOURS = [
  "Guava",
  "Passion Fruit",
  "Watermelon",
  "Blue Raspberry",
  "Strawberry Cherry",
  "Cherry",
  "Black Cherry",
  "Pink Lemonade",
];
// What they'd like served: plain slushies, mocktails and/or slushie cocktails (with alcohol).
const DRINK_OPTS = ["Slushies", "Mocktails", "Slushie cocktails (with alcohol)"];
const COCKTAILS = DRINK_OPTS[2];
const ALCOHOL_NOTE = "Alcoholic drinks are only served to guests 23 and over. No exceptions.";
const TOPPING_OPTS = ["Yes, I’d like toppings", "Keep it simple", NOT_SURE];
const FROZEN_INTEREST_OPTS = ["Yes", "Maybe, let’s explore it", "I have another idea"];
const CONTACT_PREF_OPTS = ["WhatsApp", "Phone", "Email"];

const CONTACT_FIELDS: FieldConfig[] = [
  { key: "contact", label: "Name *", ph: "Full name" },
  { key: "email", label: "Email *", ph: "you@email.com", type: "email" },
  { key: "phone", label: "Phone / WhatsApp", ph: "+1 868", type: "tel" },
];

const list = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);
const isBrand = (a: Answers) => a.path === "brand";

const EVENT_PAGES = ["plan", "details", "yours", "connect"] as const;
const BRAND_PAGES = ["brand", "audience", "idea", "frozen", "connect"] as const;
type WizardPageId = (typeof EVENT_PAGES)[number] | (typeof BRAND_PAGES)[number];

const visibleWizardPages = (a: Answers): readonly WizardPageId[] => (isBrand(a) ? BRAND_PAGES : EVENT_PAGES);

const filled = (v: unknown) => !!String(v ?? "").trim();

function validateWizardPage(id: WizardPageId, a: Answers): string {
  if (id === "plan") {
    if (!a.planning) return "Pick what you're planning to keep going.";
    if (a.planning === "Other" && !filled(a.planningOther)) return "Tell us what you're planning.";
  }
  if (id === "yours") {
    if (!list(a.drinks).length) return "Pick what you'd like to serve, or choose “I’m not sure yet”.";
    if (!list(a.flavours).length) return "Pick a flavour, or choose “I’m not sure yet”.";
    if (!a.toppings) return "Let us know about toppings.";
  }
  if (id === "brand") {
    if (!filled(a.brandName)) return "Add your brand or company.";
    if (!filled(a.promoting)) return "Tell us what you're promoting or launching.";
  }
  if (id === "audience" && !filled(a.audience)) return "Tell us who you want to reach.";
  if (id === "idea" && !filled(a.idea)) return "Tell us a little about what you'd like people to experience.";
  if (id === "frozen" && !a.frozenInterest) return "Pick one to keep going.";
  if (id === "connect") {
    if (!a.contactPref) return "Pick how you'd like us to contact you.";
    if (!filled(a.contact) || !filled(a.email)) return "Add your name and email so we can reply.";
    if (!/^\S+@\S+\.\S+$/.test(String(a.email))) return "That email looks incomplete.";
    if ((a.contactPref === "WhatsApp" || a.contactPref === "Phone") && !filled(a.phone))
      return `Add your number so we can reach you on ${a.contactPref}.`;
  }
  return "";
}

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

// Short label used in the email subject line, e.g. "Birthday" or "Brand experience".
function wizardOffer(a: Answers): string {
  if (isBrand(a)) return "Brand experience";
  return a.planning === "Other" ? String(a.planningOther || "Event") : String(a.planning || "Event");
}

function buildWizardBrief(a: Answers) {
  const rows: { n: string; tag: string; answer: string }[] = [];
  let n = 1;
  const push = (tag: string, answer: string) => {
    rows.push({ n: String(n++).padStart(2, "0"), tag, answer: answer || "Not answered" });
  };

  if (isBrand(a)) {
    push("Request", "Brand Experience");
    push("Brand / Company", String(a.brandName || ""));
    push("Promoting / launching", String(a.promoting || ""));
    push("Date or campaign period", String(a.campaignPeriod || ""));
    push("Location", String(a.brandLocation || ""));
    push("Who they want to reach", String(a.audience || ""));
    push("What people should experience", String(a.idea || ""));
    push("Interested in a Frozen Experience?", String(a.frozenInterest || ""));
  } else {
    push("Request", `Event or Private Celebration (${FROZEN})`);
    push("Planning", wizardOffer(a));
    push("Date", formatWizardDate(a.eventDate));
    push("Location", String(a.venue || ""));
    push("Guests", a.guestCount ? String(a.guestCount) : "");
    push("Drinks", list(a.drinks).join(", "));
    push("Flavours", list(a.flavours).join(", "));
    push("Toppings", String(a.toppings || ""));
    push("Look / theme", String(a.theme || ""));
    push("Anything else", String(a.notes || ""));
  }
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

type StepIconName = "connect" | "idea" | "look" | "moment" | "buzz" | "local";

const STEP_ICON_PATHS: Record<StepIconName, React.ReactNode> = {
  connect: <path d="M4 5h16v11H9l-5 4V5z" />,
  idea: (
    <>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V17h5v-1.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" />
    </>
  ),
  look: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.7 1.6-1.5 0-.5-.2-.8-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.7-1.6 1.6-1.6H16a5 5 0 0 0 5-5c0-4-4-7.5-9-7.5z" />
      <circle cx="7.5" cy="11" r="1" />
      <circle cx="10" cy="7" r="1" />
      <circle cx="14.5" cy="7" r="1" />
    </>
  ),
  moment: <path d="M12 2.5c.8 5.4 2.3 7.2 8 9.5-5.7 1.6-7.2 3.5-8 9.5-.8-6-2.3-7.9-8-9.5 5.7-2.3 7.2-4.1 8-9.5z" />,
  buzz: (
    <>
      <path d="M3 8a2 2 0 0 1 2-2h2.5L9 4h6l1.5 2H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  local: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
};

function StepIcon({ name }: { name: StepIconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {STEP_ICON_PATHS[name]}
    </svg>
  );
}

// "The RE5 Model": five things that guide every experience.
const MODEL = [
  {
    n: "01",
    title: "Connect",
    icon: "connect" as StepIconName,
    body: "Who is this for, and what matters to them?",
  },
  {
    n: "02",
    title: "Idea",
    icon: "idea" as StepIconName,
    body: "What could we create that they\u2019d want to be part of?",
  },
  {
    n: "03",
    title: "Look",
    icon: "look" as StepIconName,
    body: "We shape the styling, signage and details around you.",
  },
  {
    n: "04",
    title: "Moment",
    icon: "moment" as StepIconName,
    body: "We bring it to life and give people something to be part of.",
  },
  {
    n: "05",
    title: "Buzz",
    icon: "buzz" as StepIconName,
    body: "Give them something worth remembering, sharing and talking about.",
  },
];

// Short answers; most of the detail is worked out together in the consultation.
const FAQS = [
  {
    q: "How does booking work?",
    a: "Tell us what you have in mind through the booking form or on WhatsApp. We’ll get in touch to set up a consultation and talk through your date, guests, flavours and the look you want.",
  },
  {
    q: "How much does it cost?",
    a: "Every experience is shaped around your event or brand, so there’s no one-size price. Once we understand what you have in mind, we’ll put together a quote for you.",
  },
  {
    q: "Where do you set up?",
    a: "We bring the experience to you, across Trinidad & Tobago. Share your venue and we’ll talk through the details.",
  },
  {
    q: "What flavours can we choose?",
    a: "Guava, Passion Fruit, Watermelon, Blue Raspberry, Strawberry Cherry, Cherry, Black Cherry and Pink Lemonade. Not sure yet? We’ll help you choose during the consultation.",
  },
  {
    q: "Do you offer alcoholic drinks?",
    a: "Yes. Alongside our slushies and mocktails, we offer slushie cocktails with alcohol. Alcoholic drinks are only served to guests 23 and over. No exceptions.",
  },
  {
    q: "Can you match my theme or brand?",
    a: "Yes. From the cups to the signage and finishing touches, we make the experience feel like it belongs to your event or brand.",
  },
  {
    q: "What do you need from the venue?",
    a: "We’ll confirm the space and setup needs with you during the consultation, so everything is ready on the day.",
  },
  {
    q: "How far in advance should I reach out?",
    a: "As early as you can. Send us your date and we’ll let you know if we’re available.",
  },
  {
    q: "Do you work with brands and businesses?",
    a: "Yes. We create mobile brand experiences for launches, campaigns and promotions that put your product in people’s hands.",
  },
];

const IMG = {
  toast: "/images/re5/slushie-group-toast.webp",
  kids: "/images/re5/slushie-sweets-kids.webp",
  cups: "/images/re5/candy-slushie-cups.webp",
  brunch: "/images/re5/brunch-frozen-cart.webp",
  spritz: "/images/re5/frozen-spritz-brand-cart.webp",
  hand: "/images/re5/frozen-slushie-in-hand.webp",
  wedding: "/images/re5/wedding-frozen-cart.webp",
};

// Original widths. Each photo also has -480 and -800 copies so phones don't download full size.
const IMG_WIDTH: Record<string, number> = {
  [IMG.toast]: 1122,
  [IMG.kids]: 1200,
  [IMG.cups]: 1086,
  [IMG.brunch]: 1374,
  [IMG.spritz]: 1374,
  [IMG.hand]: 1374,
  [IMG.wedding]: 1122,
};
const srcSet = (src: string) => {
  const base = src.replace(/\.webp$/, "");
  return `${base}-480.webp 480w, ${base}-800.webp 800w, ${src} ${IMG_WIDTH[src]}w`;
};
const SIZES_FEATURE = "(max-width: 900px) 92vw, 50vw";

const STRIP_PHOTOS = [
  { src: IMG.brunch, pos: "62% 50%" },
  { src: IMG.cups, pos: "50% 40%" },
  { src: IMG.wedding, pos: "50% 40%" },
  { src: IMG.kids, pos: "50% 50%" },
  { src: IMG.spritz, pos: "60% 50%" },
  { src: IMG.toast, pos: "50% 40%" },
  { src: IMG.hand, pos: "50% 50%" },
];

const MARQUEE_WORDS = ["Experience It", "Make A Moment", "Make It Yours", "Show Up"];

const CUSTOM_WORDS = [
  { word: "colours", src: IMG.cups, pos: "50% 45%" },
  { word: "style", src: IMG.hand, pos: "50% 50%" },
  { word: "signage", src: IMG.wedding, pos: "50% 70%" },
  { word: "menu", src: IMG.brunch, pos: "88% 45%" },
  { word: "moment", src: IMG.toast, pos: "50% 40%" },
];

// "Explore the Frozen Experience" opens the request form with the frozen option already picked.
const FROZEN_PRESET = { experiences: [FROZEN] };

const WHATSAPP_URL = "https://wa.me/18687177720";

/* ---------------------------------------------------------------- */
/* Paths (for your event / for your brand)                           */
/* ---------------------------------------------------------------- */

type PathDef = {
  id: "event" | "brand";
  n: string;
  eyebrow: string;
  heading: string;
  cta: string;
  includesTitle: string;
  includes: { item: string; sub?: string[] }[];
  images: { src: string; alt: string; pos: string }[];
};

const PATHS: PathDef[] = [
  {
    id: "event",
    n: "01",
    eyebrow: "For Your Event",
    heading: "Give your guests something to enjoy, experience and talk about.",
    cta: "Explore Event Experiences",
    includesTitle: "Your Signature Experience includes",
    includes: [
      { item: "RE5 Signature Cart" },
      { item: "Your chosen experience" },
      { item: "Custom front sign designed for your event" },
      { item: "Custom small sign with your names, message or menu" },
      { item: "Your choice of florals or balloons" },
      { item: "One trained RE5 attendant" },
      { item: "Serving essentials for your chosen experience" },
      { item: "3 hours of service" },
      { item: "Setup and breakdown" },
    ],
    images: [
      { src: IMG.brunch, alt: "Frozen drink cart at a brunch celebration", pos: "62% 50%" },
      { src: IMG.kids, alt: "Kids' birthday slushie cart", pos: "40% 50%" },
    ],
  },
  {
    id: "brand",
    n: "02",
    eyebrow: "For Your Brand",
    heading: "Give people a chance to taste, try and experience your brand in real life.",
    cta: "Explore Brand Experiences",
    includesTitle: "Your Brand Experience includes",
    includes: [
      { item: "RE5 Signature Cart" },
      { item: "Custom front branding" },
      { item: "Custom message sign" },
      { item: "Product or sample display, where applicable" },
      {
        item: "Two trained RE5 attendants",
        sub: [
          "One attendant to manage the cart and customer experience",
          "One attendant to actively invite people over and bring them into the experience",
        ],
      },
      { item: "4 hours of service" },
      { item: "Setup and breakdown" },
    ],
    images: [
      { src: IMG.spritz, alt: "Branded frozen spritz cart at an outdoor event", pos: "65% 50%" },
      { src: IMG.hand, alt: "Frozen drink in a branded cup", pos: "50% 50%" },
    ],
  },
];

/* ---------------------------------------------------------------- */
/* Component                                                          */
/* ---------------------------------------------------------------- */

export default function LandingPage() {
  const [path, setPath] = useState<PathDef["id"]>("event");
  const [way, setWay] = useState(0);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"intro" | "q" | "done">("intro");
  const [idx, setIdx] = useState(0);
  const [err, setErr] = useState("");
  const [answers, setAnswers] = useState<Answers>({});
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const contRef = useRef<HTMLButtonElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  // Spam filter: bots fill the hidden "website" field and submit within seconds of opening.
  const honeypotRef = useRef<HTMLInputElement | null>(null);
  const openedAtRef = useRef(0);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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

  // Accepts a path when opened from an Event/Brand button (then the form starts on that
  // path's first question); the plain CTAs pass a click event, which is ignored.
  const openWizard = useCallback((path?: unknown, preset?: Answers) => {
    const known = path === "event" || path === "brand";
    setAnswers({ ...(known ? { path } : {}), ...preset });
    openedAtRef.current = Date.now();
    setOpen(true);
    setMode(known ? "q" : "intro");
    setIdx(0);
    setErr("");
    setSendError("");
  }, []);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const setA = useCallback((key: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setErr("");
  }, []);

  const toggleA = useCallback((key: string, value: string) => {
    setAnswers((prev) => {
      const cur = list(prev[key]);
      return { ...prev, [key]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] };
    });
    setErr("");
  }, []);

  // Flavours: picking "I'm not sure yet" clears the others, and picking a flavour clears it.
  const toggleFlavour = useCallback((value: string) => {
    setAnswers((prev) => {
      const cur = list(prev.flavours);
      const nextList =
        value === NOT_SURE
          ? cur.includes(NOT_SURE) ? [] : [NOT_SURE]
          : cur.includes(value)
            ? cur.filter((v) => v !== value)
            : [...cur.filter((v) => v !== NOT_SURE), value];
      return { ...prev, flavours: nextList };
    });
    setErr("");
  }, []);

  const choosePath = useCallback((id: PathId) => {
    setAnswers((prev) => ({ ...prev, path: id }));
    setMode("q");
    setIdx(0);
    setErr("");
  }, []);

  const startQuestions = useCallback(() => {
    if (!answers.path) {
      setErr("Pick where you'd like to start.");
      return;
    }
    setMode("q");
    setIdx(0);
    setErr("");
  }, [answers.path]);

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
          offer: wizardOffer(answers),
          contact: answers.contact,
          email: answers.email,
          phone: answers.phone,
          company: isBrand(answers) ? answers.brandName : undefined,
          companyLabel: "Brand / Company",
          brief,
          website: honeypotRef.current?.value ?? "",
          elapsed: Date.now() - openedAtRef.current,
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

  /* ---- render helpers ---- */

  // After a single choice, bring the question it unlocks into view. On phones the next
  // question is often below the fold and people don't realise there's more to answer.
  const revealNext = (el: HTMLElement) => {
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const sc = scrollRef.current;
        const group = el.closest(".wizard-options, .wizard-choice-cards");
        const next = group?.nextElementSibling ?? group?.parentElement?.nextElementSibling;
        if (!sc || !(next instanceof HTMLElement)) return;
        const n = next.getBoundingClientRect();
        const v = sc.getBoundingClientRect();
        // Show as much of the new question as fits, without scrolling its top out of view.
        if (n.bottom > v.bottom)
          sc.scrollBy({ top: Math.min(n.top - v.top - 16, n.bottom - v.bottom + 24), behavior: "smooth" });
      })
    );
  };

  // One answer button; multi-select keys hold a list and toggle.
  const renderOption = (key: string, value: string, i: number, multi = false) => {
    const on = multi ? list(answers[key]).includes(value) : answers[key] === value;
    return (
      <button
        key={value}
        className={`wizard-option ${on ? "wizard-option-active" : ""}`}
        onClick={(e) => {
          if (multi) return toggleA(key, value);
          setA(key, value);
          revealNext(e.currentTarget);
        }}
      >
        <span className="wizard-option-mark">{on ? "✓" : String.fromCharCode(65 + i)}</span>
        {value}
      </button>
    );
  };

  const isIntro = mode === "intro";
  const isQ = mode === "q";
  const isDone = mode === "done";
  const page = visibleWizard[Math.min(idx, visibleWizard.length - 1)] as WizardPageId | undefined;
  const isLastPage = idx >= visibleWizard.length - 1;

  return (
    <>
      <div id="top" className="r5">
        <header className="r5-nav">
          <a href="#top" aria-label="Re5 home" className="r5-nav__logo">
            Re5<span className="r5-dot">.</span>
          </a>
          <nav className="r5-nav__links">
            <a href="#experiences" className="r5-nav__link">Experiences</a>
            <a href="#model" className="r5-nav__link">The RE5 Model</a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener"
              aria-label="Chat on WhatsApp"
              className="r5-nav__wa"
            >
              <WhatsAppIcon />
            </a>
            <button className="r5-btn r5-btn--orange r5-btn--sm" onClick={openWizard}>
              <span className="r5-nav__cta-long">Create Your Experience</span>
              <span className="r5-nav__cta-short">Book</span>
            </button>
          </nav>
        </header>

        <main>
          <section className="r5-hero">
            <h1 className="r5-hero__title">
              <span className="r5-hero__line r5-hero__line--top">Make it</span>
              <span className="r5-hero__strip" aria-hidden="true">
                <span className="r5-roll r5-roll--strip">
                  {[0, 1].map((r) =>
                    STRIP_PHOTOS.map((p, i) => (
                      <span key={`${r}-${i}`} className="r5-strip-card">
                        {/* Only the first two load straight away, so the headline font isn't kept waiting. */}
                        <img
                          src={p.src}
                          srcSet={srcSet(p.src)}
                          sizes="(max-width: 600px) 300px, 480px"
                          alt=""
                          style={{ objectPosition: p.pos }}
                          loading={r === 0 && i < 2 ? undefined : "lazy"}
                          fetchPriority={r === 0 && i < 2 ? "high" : "low"}
                        />
                      </span>
                    ))
                  )}
                </span>
              </span>
              <span className="r5-hero__line r5-hero__line--bottom">
                an <span className="r5-hero__break">experience.</span>
              </span>
            </h1>
            <div className="r5-hero__body">
              <p className="r5-hero__lead">Give people something to be part of.</p>
              <p className="r5-hero__sub">
                We create mobile experiences for events, celebrations and brands across Trinidad &amp; Tobago.
              </p>
              <a href="#experiences" className="r5-btn r5-btn--orange r5-hero__cta">
                See the Experiences <span aria-hidden="true">↓</span>
              </a>
            </div>
          </section>

          <div className="r5-marquee" aria-hidden="true">
            <div className="r5-roll r5-roll--marquee">
              {[0, 1, 2, 3].map((r) =>
                MARQUEE_WORDS.map((w) => (
                  <span key={`${r}-${w}`} className="r5-marquee__item">
                    {w}
                  </span>
                ))
              )}
            </div>
          </div>

          <section id="popups" className="r5-section r5-section--cream">
            <div className="r5-container r5-split">
              <div className="r5-split__head">
                <h2 className="r5-h2">
                  What do you want people to <span className="r5-accent">experience?</span>
                </h2>
              </div>
              <div className="r5-split__cards">
                {PATHS.map((p) => (
                  <a key={p.id} href={`#${p.id}`} className="r5-split__card" data-path={p.id}>
                    <div className="r5-photo r5-split__photo">
                      <img
                        src={p.images[0].src}
                        srcSet={srcSet(p.images[0].src)}
                        sizes="(max-width: 900px) 92vw, 320px"
                        alt={p.images[0].alt}
                        loading="lazy"
                        style={{ objectPosition: p.images[0].pos }}
                      />
                    </div>
                    <span className="r5-showup__num">{p.n}</span>
                    <span className="r5-split__title">
                      {p.eyebrow} <span aria-hidden="true">→</span>
                    </span>
                    <span className="r5-split__line">{p.heading}</span>
                  </a>
                ))}
              </div>
            </div>
          </section>

          <section id="event" className="r5-section r5-section--sand">
            <div className="r5-container r5-feature">
              <div className="r5-photo r5-photo--tall">
                <img
                  src={IMG.kids}
                  srcSet={srcSet(IMG.kids)}
                  sizes={SIZES_FEATURE}
                  alt="Kids' birthday slushie cart"
                  loading="lazy"
                  style={{ objectPosition: "45% 55%" }}
                />
              </div>
              <div className="r5-feature__body">
                <span className="r5-eyebrow">For Your Event</span>
                <h2 className="r5-h2 r5-h2--modak">
                  Give them something to <span className="r5-accent">experience.</span>
                </h2>
                <div className="r5-stack-16">
                  <p className="r5-feature__lead">You&rsquo;ve planned the place, the people and the occasion.</p>
                  <p className="r5-body-soft">Now let&rsquo;s add something your guests can actually be part of.</p>
                  <p className="r5-body-soft">
                    RE5 creates mobile experiences for weddings, birthdays, celebrations and events. Start with one of
                    ours or tell us what you have in mind.
                  </p>
                  <p className="r5-body-soft">We&rsquo;ll make it feel like it belongs there.</p>
                </div>
                <a href="#experiences" className="r5-btn r5-btn--dark">
                  Explore Event Experiences →
                </a>
              </div>
            </div>
          </section>

          <section id="experiences" className="r5-section r5-section--cream">
            <div className="r5-container r5-feature r5-feature--flip">
              <div className="r5-photo r5-photo--tall">
                <img
                  src={IMG.cups}
                  srcSet={srcSet(IMG.cups)}
                  sizes={SIZES_FEATURE}
                  alt="Four colourful slushies topped with gummy sweets"
                  loading="lazy"
                  style={{ objectPosition: "50% 40%" }}
                />
              </div>
              <div className="r5-feature__body">
                <span className="r5-eyebrow">The Frozen Experience</span>
                <h2 className="r5-h2">
                  Start with something <span className="r5-accent">frozen.</span>
                </h2>
                <div className="r5-stack-16">
                  <p className="r5-feature__lead">Cold, fun and made for your moment.</p>
                  <p className="r5-body-soft">Choose from slushies, mocktails and slushie cocktails.</p>
                  <p className="r5-body-soft">
                    Choose your flavours, make it yours and give your guests something they can taste, enjoy and be
                    part of.
                  </p>
                  <p className="r5-body-soft">
                    From the drink to the cups, signage and finishing touches, we shape the experience around your
                    event.
                  </p>
                </div>
                <button className="r5-btn r5-btn--dark" onClick={() => openWizard(undefined, FROZEN_PRESET)}>
                  Explore the Frozen Experience →
                </button>
              </div>
            </div>
          </section>

          <section className="r5-section r5-section--ink">
            <div className="r5-container r5-way">
              <div className="r5-way__main">
                <h2 className="r5-h2">
                  Our signature. <span className="r5-accent">Made yours.</span>
                </h2>
                <div className="r5-stack-16">
                  <p className="r5-muted">The Signature Cart is one way we bring your experience to life.</p>
                  <p className="r5-muted">From there, we make it yours.</p>
                </div>
                <ul className="r5-way__list">
                  {CUSTOM_WORDS.map((w, i) => (
                    <li key={w.word}>
                      <button
                        type="button"
                        className={`r5-way__item ${i === way ? "r5-is-active" : ""}`}
                        aria-pressed={i === way}
                        onMouseEnter={() => setWay(i)}
                        onFocus={() => setWay(i)}
                        onClick={() => setWay(i)}
                      >
                        <span className="r5-way__your">Your</span>
                        <span className="r5-way__word">{w.word}.</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="r5-way__note">
                  <span className="r5-accent">Made to feel like yours.</span>
                </p>
              </div>
              <div className="r5-photo r5-photo--tall r5-way__photo">
                <img
                  key={CUSTOM_WORDS[way].src}
                  src={CUSTOM_WORDS[way].src}
                  srcSet={srcSet(CUSTOM_WORDS[way].src)}
                  sizes={SIZES_FEATURE}
                  alt={`Your ${CUSTOM_WORDS[way].word}`}
                  loading="lazy"
                  style={{ objectPosition: CUSTOM_WORDS[way].pos }}
                />
                <div className="r5-way__tag" aria-live="polite">
                  Your {CUSTOM_WORDS[way].word}.
                </div>
              </div>
            </div>
          </section>

          <section id="brand" className="r5-section r5-section--cream">
            <div className="r5-container r5-feature r5-feature--flip">
              <div className="r5-photo r5-photo--tall">
                <img
                  src={IMG.spritz}
                  srcSet={srcSet(IMG.spritz)}
                  sizes={SIZES_FEATURE}
                  alt="Branded frozen spritz cart at an outdoor event"
                  loading="lazy"
                  style={{ objectPosition: "65% 50%" }}
                />
              </div>
              <div className="r5-feature__body">
                <span className="r5-eyebrow">For Your Brand</span>
                <h2 className="r5-h2 r5-h2--split">
                  <span className="r5-h2__lead">People can see your product.</span>{" "}
                  <span className="r5-h2__modak">But have they experienced it?</span>
                </h2>
                <div className="r5-stack-16">
                  <p className="r5-feature__lead">
                    An ad can introduce it.
                    <br />
                    A shelf can display it.
                  </p>
                  <p className="r5-body-soft">Sometimes people need to experience a product to understand why it&rsquo;s for them.</p>
                  <p className="r5-feature__lead">That&rsquo;s where we come in.</p>
                  <p className="r5-body-soft">
                    RE5 creates mobile brand experiences that bring your product into the real world and closer to
                    the people you want to reach.
                  </p>
                </div>
                <button className="r5-btn r5-btn--dark" onClick={() => openWizard("brand")}>
                  Create a Brand Experience →
                </button>
              </div>
            </div>
          </section>

          <section className="r5-section r5-section--ink">
            <div className="r5-container r5-where">
              <div className="r5-where__head">
                <h2 className="r5-h2">
                  Don&rsquo;t just show up. <span className="r5-accent">Show up where it makes sense.</span>
                </h2>
                <div className="r5-stack-16">
                  <p className="r5-muted">It starts with a simple question:</p>
                  <p className="r5-where__q">Who do you want to reach?</p>
                  <p className="r5-muted">
                    From there, we think about where those people already are, what would get them involved and how
                    the experience can fit into what your brand is already doing.
                  </p>
                </div>
              </div>
              <div className="r5-where__side">
                <p className="r5-where__close">
                  Our current specialty is frozen drink experiences. For beverage brands, that could mean exploring a
                  frozen version of your product. For other brands, it could mean creating something inspired by your
                  campaign.
                </p>
                <button className="r5-btn r5-btn--orange" onClick={() => openWizard("brand")}>
                  Let&rsquo;s Talk About Your Brand →
                </button>
              </div>
            </div>
          </section>

          <section id="model" className="r5-section r5-section--sand">
            <div className="r5-container r5-model">
              <div className="r5-model__head">
                <h2 className="r5-h2">
                  The RE5 <span className="r5-accent">Model</span>
                </h2>
                <p className="r5-model__lead">
                  You bring the reason.
                  <br />
                  We bring the pieces together.
                </p>
                <div className="r5-stack-16">
                  <p className="r5-body-soft">Every experience starts with a question:</p>
                  <p className="r5-model__q">
                    <span className="r5-accent">What do you want people to experience?</span>
                  </p>
                </div>
              </div>
              <ModelCycle />
            </div>
          </section>

          <section id="faq" className="r5-section r5-section--cream">
            <div className="r5-container r5-faq">
              <div className="r5-faq__head">
                <span className="r5-eyebrow">FAQ</span>
                <h2 className="r5-h2">Questions? We&rsquo;ve got you.</h2>
                <p className="r5-body-soft">
                  Most of the details are worked out together in your consultation. Here are a few things people
                  usually ask first.
                </p>
              </div>
              <div className="r5-faq__list">
                {FAQS.map((f) => (
                  <details key={f.q} className="r5-faq__item">
                    <summary className="r5-faq__q">
                      {f.q}
                      <span className="r5-faq__icon" aria-hidden="true" />
                    </summary>
                    <p className="r5-faq__a">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          <section className="r5-final">
            <img src={IMG.toast} srcSet={srcSet(IMG.toast)} sizes="100vw" alt="" loading="lazy" className="r5-final__bg" />
            <div className="r5-final__shade" />
            <div className="r5-final__inner">
              <h2 className="r5-final__title">
                Have a moment <span className="r5-accent">in mind?</span>
              </h2>
              <div className="r5-final__body">
                <p className="r5-final__lines">Let&rsquo;s hear it.</p>
                <p className="r5-final__lead">
                  It doesn&rsquo;t have to start with a package.
                  <br />
                  It can start with an idea.
                </p>
                <p className="r5-final__lead">
                  Tell us what you&rsquo;re celebrating, launching or imagining, and let&rsquo;s see what we can
                  create around it.
                </p>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener" className="r5-btn r5-btn--orange r5-btn--on-photo">
                  Let&rsquo;s Chat →
                </a>
              </div>
            </div>
          </section>
        </main>

        <footer className="r5-footer">
          <div className="r5-footer__inner">
            <div className="r5-footer__grid">
              <div className="r5-footer__brand">
                <div className="r5-footer__logo">
                  Re5<span className="r5-dot">.</span>
                </div>
                <p>Mobile experiences for events, celebrations and brands across Trinidad &amp; Tobago.</p>
              </div>
              <div className="r5-footer__col">
                <span className="r5-footer__label">Explore</span>
                <a href="#experiences">Experiences</a>
                <a href="#event">For Your Event</a>
                <a href="#brand">For Your Brand</a>
                <a href="#model">The RE5 Model</a>
                <a href="#faq">FAQ</a>
              </div>
              <div className="r5-footer__col">
                <span className="r5-footer__label">Create</span>
                <button className="r5-footer__link" onClick={openWizard}>
                  Create Your Experience
                </button>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener">
                  Let&rsquo;s Chat
                </a>
              </div>
              <div className="r5-footer__col">
                <span className="r5-footer__label">Say hello</span>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener">
                  WhatsApp
                </a>
                <span>Serving all of Trinidad &amp; Tobago</span>
              </div>
            </div>
            <div className="r5-footer__base">
              <span>&copy; {new Date().getFullYear()} Re5. Made in Trinidad &amp; Tobago.</span>
              <a href="/privacy">Privacy Policy</a>
            </div>
          </div>
        </footer>
      </div>

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
                  <div className="wizard-choice-cards">
                    {PATH_OPTS.map((p) => (
                      <button
                        key={p.id}
                        className={`wizard-choice-card ${answers.path === p.id ? "wizard-choice-card-active" : ""}`}
                        onClick={() => choosePath(p.id as PathId)}
                      >
                        <span className="wizard-choice-card-label">{p.label}</span>
                        <span className="wizard-choice-card-body">{p.body}</span>
                        <span className="wizard-choice-card-mark">
                          {answers.path === p.id ? "✓ Selected" : "Select"}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {isQ && (page === "plan" || page === "brand") && (
                <div className="wizard-path-picked">
                  <span>✓ {PATH_OPTS.find((p) => p.id === answers.path)?.label}</span>
                  <button type="button" onClick={() => setMode("intro")}>
                    Change
                  </button>
                </div>
              )}

              {isQ && page === "plan" && (
                <>
                  <span className="wizard-tag">
                    <StarIcon className="wizard-tag-star" /> The plan
                  </span>
                  <h2 className="wizard-question">What are you planning?</h2>
                  <div className="wizard-options">
                    {EVENT_TYPES.map((o, i) => renderOption("planning", o, i))}
                  </div>
                  {answers.planning === "Other" && (
                    <label className="wizard-extra-field">
                      <span>Tell us what you&rsquo;re planning</span>
                      <input
                        value={String(answers.planningOther || "")}
                        onChange={(e) => setA("planningOther", e.target.value)}
                        placeholder="e.g. anniversary, gender reveal, engagement"
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
                  <h2 className="wizard-question">Tell us about your event.</h2>
                  <div className="wizard-fields">
                    <label className="wizard-field">
                      <span>Event date</span>
                      <input
                        type="date"
                        value={String(answers.eventDate || "")}
                        onChange={(e) => setA("eventDate", e.target.value)}
                      />
                    </label>
                    <label className="wizard-field">
                      <span>Event location</span>
                      <input
                        value={String(answers.venue || "")}
                        onChange={(e) => setA("venue", e.target.value)}
                        placeholder="Venue / Location"
                      />
                    </label>
                    <label className="wizard-field">
                      <span>Estimated number of guests</span>
                      <input
                        type="number"
                        min="0"
                        value={String(answers.guestCount || "")}
                        onChange={(e) => setA("guestCount", e.target.value)}
                        placeholder="Number"
                      />
                    </label>
                  </div>
                </>
              )}

              {isQ && page === "yours" && (
                <>
                  <span className="wizard-tag">
                    <StarIcon className="wizard-tag-star" /> Make it yours
                  </span>
                  <h2 className="wizard-question">Make it yours.</h2>
                  <p className="wizard-hint">Personalise your Frozen Experience.</p>
                  <div className="wizard-subquestion">
                    <p className="wizard-hint">What would you like to serve? Pick all that apply.</p>
                    <div className="wizard-options">
                      {[...DRINK_OPTS, NOT_SURE].map((o, i) => renderOption("drinks", o, i, true))}
                    </div>
                    {list(answers.drinks).includes(COCKTAILS) && (
                      <p className="wizard-age-note" style={{ marginTop: 12 }}>
                        {ALCOHOL_NOTE}
                      </p>
                    )}
                  </div>
                  <div className="wizard-subquestion">
                    <p className="wizard-hint">What flavours do you have in mind?</p>
                    <div className="wizard-options">
                      {[...FLAVOURS, NOT_SURE].map((f, i) => {
                        const on = list(answers.flavours).includes(f);
                        return (
                          <button
                            key={f}
                            className={`wizard-option ${on ? "wizard-option-active" : ""}`}
                            onClick={() => toggleFlavour(f)}
                          >
                            <span className="wizard-option-mark">{on ? "✓" : String.fromCharCode(65 + i)}</span>
                            {f}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="wizard-subquestion">
                    <p className="wizard-hint">Want to make it a little more fun?</p>
                    <div className="wizard-options">
                      {TOPPING_OPTS.map((o, i) => renderOption("toppings", o, i))}
                    </div>
                  </div>
                  <div className="wizard-subquestion">
                    <p className="wizard-hint">Tell us a little about the look or theme.</p>
                    <textarea
                      className="wizard-textarea"
                      rows={3}
                      value={String(answers.theme || "")}
                      onChange={(e) => setA("theme", e.target.value)}
                      placeholder="Colours, theme, occasion or anything you’d like us to know…"
                    />
                  </div>
                  <div className="wizard-subquestion">
                    <p className="wizard-hint">Anything else?</p>
                    <textarea
                      className="wizard-textarea"
                      rows={3}
                      value={String(answers.notes || "")}
                      onChange={(e) => setA("notes", e.target.value)}
                      placeholder="Tell us anything else you’re imagining for the experience."
                    />
                  </div>
                </>
              )}

              {isQ && page === "brand" && (
                <>
                  <span className="wizard-tag">
                    <StarIcon className="wizard-tag-star" /> Your brand
                  </span>
                  <h2 className="wizard-question">Tell us about your brand.</h2>
                  <div className="wizard-fields">
                    {(
                      [
                        ["brandName", "Brand / Company *", "Brand or company name"],
                        ["promoting", "What are you promoting or launching? *", "Product, service, campaign or launch"],
                        ["campaignPeriod", "Preferred date or campaign period", "e.g. March 2027 or a weekend in May"],
                        ["brandLocation", "Location, if known", "Mall, store, office or event"],
                      ] as const
                    ).map(([key, label, ph]) => (
                      <label key={key} className="wizard-field">
                        <span>{label}</span>
                        <input
                          value={String(answers[key] || "")}
                          onChange={(e) => setA(key, e.target.value)}
                          placeholder={ph}
                        />
                      </label>
                    ))}
                  </div>
                </>
              )}

              {isQ && page === "audience" && (
                <>
                  <span className="wizard-tag">
                    <StarIcon className="wizard-tag-star" /> Your audience
                  </span>
                  <h2 className="wizard-question">Who do you want to reach?</h2>
                  <textarea
                    className="wizard-textarea"
                    rows={3}
                    value={String(answers.audience || "")}
                    onChange={(e) => setA("audience", e.target.value)}
                    placeholder="Tell us about the people you want to reach."
                  />
                </>
              )}

              {isQ && page === "idea" && (
                <>
                  <span className="wizard-tag">
                    <StarIcon className="wizard-tag-star" /> The experience
                  </span>
                  <h2 className="wizard-question">What do you want people to experience?</h2>
                  <textarea
                    className="wizard-textarea"
                    rows={4}
                    value={String(answers.idea || "")}
                    onChange={(e) => setA("idea", e.target.value)}
                    placeholder="Tell us about your product, campaign or idea and what you’d like people to experience."
                  />
                </>
              )}

              {isQ && page === "frozen" && (
                <>
                  <span className="wizard-tag">
                    <StarIcon className="wizard-tag-star" /> The Frozen Experience
                  </span>
                  <h2 className="wizard-question">Interested in exploring a Frozen Experience?</h2>
                  <div className="wizard-options">
                    {FROZEN_INTEREST_OPTS.map((o, i) => renderOption("frozenInterest", o, i))}
                  </div>
                </>
              )}

              {isQ && page === "connect" && (
                <>
                  <span className="wizard-tag">
                    <StarIcon className="wizard-tag-star" /> Let&rsquo;s talk
                  </span>
                  <h2 className="wizard-question">Let&rsquo;s talk.</h2>
                  <div>
                    <p className="wizard-hint">How would you prefer us to contact you?</p>
                    <div className="wizard-options">
                      {CONTACT_PREF_OPTS.map((o, i) => renderOption("contactPref", o, i))}
                    </div>
                  </div>
                  <div className="wizard-subquestion">
                    <div className="wizard-fields">
                      <input
                        ref={honeypotRef}
                        type="text"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                        className="wizard-hp"
                        defaultValue=""
                      />
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
                  </div>
                  <p className="wizard-privacy">
                    We only use these details to reply to your enquiry. See our{" "}
                    <a href="/privacy" target="_blank" rel="noopener">
                      privacy policy
                    </a>
                    .
                  </p>
                </>
              )}

              {isDone && (
                <div className="wizard-done">
                  <h2>
                    Thanks for <span className="wizard-review-brand">reaching out.</span>
                  </h2>
                  <p>
                    We&rsquo;ll take a look at what you have in mind and get in touch to
                    talk through the experience.
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
                {err && <span className="wizard-error">{err}</span>}
                <button ref={contRef} className="wizard-continue" onClick={startQuestions}>
                  Let&rsquo;s start <span className="arrow-circle arrow-circle-dark">&rarr;</span>
                </button>
              </div>
            </div>
          )}

          {isQ && (
            <div className="wizard-footer">
              <button className="wizard-back-btn" style={{ visibility: idx === 0 ? "hidden" : "visible" }} onClick={back}>
                &larr;<span className="wizard-back-label"> Back</span>
              </button>
              <div className="wizard-footer-right">
                {(err || (isLastPage && sendError)) && (
                  <span className="wizard-error">{err || sendError}</span>
                )}
                {isLastPage ? (
                  <button ref={contRef} className="wizard-continue" onClick={submit} disabled={sending}>
                    {sending ? "Sending…" : "Start the conversation"}{" "}
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
    </>
  );
}

/* ---------------------------------------------------------------- */
/* Sub components                                                     */
/* ---------------------------------------------------------------- */

// "The RE5 Model" as a cycle: five steps around a ring, the selected one explained in the centre.
// Advances on its own until someone interacts (and not at all with reduced motion).
function ModelCycle() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setActive((i) => (i + 1) % MODEL.length), 4000);
    return () => window.clearInterval(t);
  }, [auto]);
  const pick = (i: number) => {
    setAuto(false);
    setActive(i);
  };
  const step = MODEL[active];
  return (
    <div className="r5-cycle-wrap">
    <div className="r5-cycle">
      <svg className="r5-cycle__ring" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="40" />
        {MODEL.map((m, i) => {
          const deg = -90 + (i + 0.5) * (360 / MODEL.length);
          const rad = (deg * Math.PI) / 180;
          return (
            <path
              key={m.title}
              d="M -1.4 -1.8 L 1.2 0 L -1.4 1.8"
              transform={`translate(${50 + 40 * Math.cos(rad)} ${50 + 40 * Math.sin(rad)}) rotate(${deg + 90})`}
            />
          );
        })}
      </svg>
      {MODEL.map((m, i) => {
        const angle = (-90 + i * (360 / MODEL.length)) * (Math.PI / 180);
        return (
          <button
            key={m.title}
            type="button"
            className={`r5-cycle__node ${i === active ? "r5-is-active" : ""}`}
            style={{ left: `${50 + 40 * Math.cos(angle)}%`, top: `${50 + 40 * Math.sin(angle)}%` }}
            aria-pressed={i === active}
            aria-label={m.title}
            onClick={() => pick(i)}
            onMouseEnter={() => pick(i)}
          >
            <span className="r5-cycle__icon">
              <StepIcon name={m.icon} />
            </span>
            <span className="r5-cycle__label">{m.title}</span>
          </button>
        );
      })}
      <div className="r5-cycle__center" aria-live="polite">
        <span className="r5-cycle__num">{step.n}</span>
        <h3 className="r5-cycle__title">{step.title}</h3>
        <div className="r5-cycle__detail">
          <p className="r5-cycle__body">{step.body}</p>
        </div>
      </div>
    </div>
      <div className="r5-cycle__below" aria-hidden="true">
        <p className="r5-cycle__body">{step.body}</p>
      </div>
    </div>
  );
}
