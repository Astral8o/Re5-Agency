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

type StepIconName = "idea" | "look" | "taste" | "people" | "setup" | "local";

const STEP_ICON_PATHS: Record<StepIconName, React.ReactNode> = {
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
  taste: (
    <>
      <path d="M6 8h12l-1.5 12.2a1 1 0 0 1-1 .8h-7a1 1 0 0 1-1-.8L6 8z" />
      <path d="M4.5 8h15M12 8l3-6h3" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M16.5 14.2c2.6.4 4.5 2.7 4.5 5.8" />
    </>
  ),
  setup: (
    <>
      <path d="M2.5 4h2.2l2.5 10.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 7H5.5" />
      <circle cx="9" cy="19" r="1.5" />
      <circle cx="17" cy="19" r="1.5" />
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

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="r5-check" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const PILLARS = [
  {
    n: "01",
    title: "The Idea",
    icon: "idea" as StepIconName,
    body: "We shape the idea with you, thinking about the moment, the people and what you want them to experience.",
  },
  {
    n: "02",
    title: "The Look",
    icon: "look" as StepIconName,
    body: "From the cart to the signage and everything around it, we bring the look together around your event, idea or brand.",
  },
  {
    n: "03",
    title: "The Taste",
    icon: "taste" as StepIconName,
    body: "From drinks and treats to something created for your moment, we work with you to bring the right tastes into your experience.",
  },
  {
    n: "04",
    title: "The People",
    icon: "people" as StepIconName,
    body: "From serving and mixing to sampling and interacting with guests, we bring in the right people for your experience.",
  },
  {
    n: "05",
    title: "The Setup",
    icon: "setup" as StepIconName,
    body: "We bring everything together, get it there, set it up and make sure it's ready for your moment.",
  },
];

const LOCAL_NOTE =
  "Part of our mission is to bring local businesses into the experiences we create. Depending on the experience, we collaborate with small businesses, caterers and makers across Trinidad & Tobago, bringing their tastes to your moment while creating more opportunities for local businesses to grow.";

const IMG = {
  toast: "/images/re5/slushie-group-toast.webp",
  kids: "/images/re5/slushie-sweets-kids.webp",
  cocktail: "/images/re5/signature-slushie-cocktail.webp",
  popcorn: "/images/re5/hero-popcorn-serving.webp",
  boxes: "/images/re5/popcorn-boxes.webp",
};

const STRIP_PHOTOS = [
  { src: IMG.popcorn, pos: "50% 50%" },
  { src: IMG.kids, pos: "50% 50%" },
  { src: IMG.cocktail, pos: "50% 28%" },
  { src: IMG.toast, pos: "50% 40%" },
  { src: IMG.boxes, pos: "50% 60%" },
];

const MARQUEE_WORDS = ["Experiences", "Stand Out", "Make A Moment", "Make It Pop"];

const CUSTOM_WORDS = [
  { word: "branding", src: IMG.boxes, pos: "50% 60%" },
  { word: "colours", src: IMG.toast, pos: "50% 40%" },
  { word: "menu", src: IMG.cocktail, pos: "50% 55%" },
  { word: "signage", src: IMG.kids, pos: "45% 70%" },
  { word: "experience", src: IMG.popcorn, pos: "50% 50%" },
];

const WHATSAPP_URL = "https://wa.me/18687177720";

// TODO(Re5): swap in your real Google Calendar appointment scheduling link.
const CONSULTATION_BOOKING_URL = "https://calendar.google.com/calendar/u/0/appointments";

/* ---------------------------------------------------------------- */
/* Paths (for your event / for your brand)                           */
/* ---------------------------------------------------------------- */

type PathCta = "builder" | "wizard";

type PathDef = {
  id: "event" | "brand";
  n: string;
  eyebrow: string;
  kicker: string;
  heading: string;
  body: string;
  chooseTitle: React.ReactNode;
  options: { name: string; body: string }[];
  includesTitle: string;
  includes: { item: string; sub?: string[] }[];
  more: string;
  price: string;
  images: { src: string; alt: string; pos: string }[];
  ctaLabel: string;
  cta: PathCta;
};

const PATHS: PathDef[] = [
  {
    id: "event",
    n: "01",
    eyebrow: "For Your Event",
    kicker: "The Signature Experience",
    heading: "Give your guests something more to enjoy.",
    body: "From weddings and birthdays to graduations and special celebrations, we create an experience that becomes part of the moment. Something your guests can walk up to, enjoy and share, designed around your event and served by us.",
    chooseTitle: "Choose your experience",
    options: [
      { name: "Slushie", body: "Frozen flavours with toppings, with alcoholic options available for adult events." },
      { name: "Popcorn", body: "Freshly popped and served with a selection of seasonings." },
      { name: "Cotton Candy", body: "Made fresh for your guests throughout the experience." },
      { name: "Candy & Sweets", body: "A selection of sweets presented and served from our Signature Cart." },
    ],
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
    more: "Want to make it even more yours? Additional customization, personalized packaging and extra service time can be added to your experience.",
    price: "TT$2,800",
    images: [
      { src: IMG.cocktail, alt: "Bartender serving a slushie at a wedding", pos: "50% 30%" },
      { src: IMG.kids, alt: "Kids' birthday slushie cart", pos: "40% 50%" },
    ],
    ctaLabel: "Create Your Experience",
    cta: "wizard",
  },
  {
    id: "brand",
    n: "02",
    eyebrow: "For Your Brand",
    kicker: "The Brand Experience",
    heading: "Give people a reason to come over.",
    body: "Whether you're launching something new, putting your product into people's hands or creating a different way for customers to interact with your brand, we create a space that brings your brand and the people you want to reach together.",
    chooseTitle: (
      <>
        Choose how you <span className="r5-accent">show up</span>
      </>
    ),
    options: [
      { name: "Product Sampling", body: "Put your product directly into people's hands." },
      { name: "Product Showcases", body: "Give people a place to discover and interact with what you offer." },
      { name: "Product Launches", body: "Bring something new directly to the people you want to reach." },
      { name: "Gifting & Giveaways", body: "Turn giving something away into part of the experience." },
      { name: "Sign-ups & Service Promotions", body: "Create a place for discovery, conversations and action." },
      { name: "Branded RE5 Experiences", body: "Make Slushies, Popcorn, Cotton Candy or Sweets part of your campaign." },
    ],
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
    more: "Need more? Additional branding, custom packaging, additional attendants, extended service time and other campaign elements can be added based on what you're creating.",
    price: "TT$3,500",
    images: [
      { src: IMG.popcorn, alt: "Branded popcorn cart in a mall", pos: "50% 45%" },
      { src: IMG.boxes, alt: "Branded popcorn boxes", pos: "60% 65%" },
    ],
    ctaLabel: "Make Your Brand Show Up",
    cta: "builder",
  },
];

const DECORATION_OPTS = ["Minimal & clean", "Bold & colourful", "Themed to my event", "Let us surprise you"];

const BUILDER_STEP_COUNT = 6;

/* ---------------------------------------------------------------- */
/* Component                                                          */
/* ---------------------------------------------------------------- */

export default function LandingPage() {
  const [path, setPath] = useState<PathDef["id"]>("event");
  const [way, setWay] = useState(0);
  const [option, setOption] = useState<Record<PathDef["id"], number>>({ event: 0, brand: 0 });

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
    <>
      <div id="top" className="r5">
        <header className="r5-nav">
          <a href="#top" aria-label="Re5 home" className="r5-nav__logo">
            Re5<span className="r5-dot">.</span>
          </a>
          <nav className="r5-nav__links">
            <a href="#popups" className="r5-nav__link">Experiences</a>
            <a href="#how" className="r5-nav__link">How It Works</a>
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
              <span className="r5-hero__line r5-hero__line--top">MAKE IT</span>
              <span className="r5-hero__strip" aria-hidden="true">
                <span className="r5-roll r5-roll--strip">
                  {[0, 1].map((r) =>
                    STRIP_PHOTOS.map((p, i) => (
                      <span key={`${r}-${i}`} className="r5-strip-card">
                        <img
                          src={p.src}
                          alt=""
                          style={{ objectPosition: p.pos }}
                          fetchPriority={r === 0 && i < 3 ? "high" : undefined}
                        />
                      </span>
                    ))
                  )}
                </span>
              </span>
              <span className="r5-hero__line r5-hero__line--bottom">
                AN <span className="r5-hero__break">EXPERIENCE.</span>
              </span>
            </h1>
            <div className="r5-hero__body">
              <p className="r5-hero__lead">Mobile experiences for events, celebrations and brands.</p>
              <a href="#popups" className="r5-btn r5-btn--orange r5-hero__cta">
                See what we offer <span aria-hidden="true">↓</span>
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
            <div className="r5-container r5-showup">
              <div className="r5-showup__aside">
                <h2 className="r5-h2 r5-showup__title">How do you want to show up?</h2>
                <div role="tablist" aria-label="How do you want to show up?" className="r5-showup__tabs">
                  {PATHS.map((p, i) => {
                    const selected = path === p.id;
                    return (
                      <button
                        key={p.id}
                        role="tab"
                        id={`tab-${p.id}`}
                        aria-controls={`panel-${p.id}`}
                        aria-selected={selected}
                        tabIndex={selected ? 0 : -1}
                        className="r5-showup__tab"
                        onClick={() => setPath(p.id)}
                        onMouseEnter={() => setPath(p.id)}
                        onKeyDown={(e) => {
                          if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
                          e.preventDefault();
                          const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
                          const next = PATHS[(i + dir + PATHS.length) % PATHS.length];
                          setPath(next.id);
                          document.getElementById(`tab-${next.id}`)?.focus();
                        }}
                      >
                        <span className="r5-showup__num">{p.n}</span>
                        <span className="r5-showup__label">{p.eyebrow}</span>
                        <span className="r5-showup__arrow" aria-hidden="true">→</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                {PATHS.filter((p) => p.id === path).map((p) => (
                  <div
                    key={p.id}
                    role="tabpanel"
                    id={`panel-${p.id}`}
                    aria-labelledby={`tab-${p.id}`}
                    className="r5-panel"
                  >
                    <div className="r5-panel__photos">
                      {p.images.map((img) => (
                        <div key={img.src} className="r5-photo">
                          <img src={img.src} alt={img.alt} loading="lazy" style={{ objectPosition: img.pos }} />
                        </div>
                      ))}
                    </div>
                    <div className="r5-panel__body">
                      <div className="r5-panel__top">
                        <div className="r5-panel__head">
                          <span className="r5-eyebrow">{p.eyebrow}</span>
                          <span className="r5-panel__kicker">{p.kicker}</span>
                        </div>
                        <h3 className="r5-h3">{p.heading}</h3>
                        <p className="r5-panel__intro">{p.body}</p>
                      </div>

                      <div className="r5-panel__block">
                        <h4 className="r5-panel__subhead">{p.chooseTitle}</h4>
                        <div className="r5-chips">
                          {p.options.map((o, i) => (
                            <button
                              key={o.name}
                              type="button"
                              className="r5-chip"
                              aria-pressed={option[p.id] === i}
                              onClick={() => setOption((prev) => ({ ...prev, [p.id]: i }))}
                            >
                              {o.name}
                            </button>
                          ))}
                        </div>
                        <p key={option[p.id]} className="r5-chip-detail" aria-live="polite">
                          {p.options[option[p.id]].body}
                        </p>
                      </div>

                      <div className="r5-panel__block">
                        <h4 className="r5-panel__label">{p.includesTitle}</h4>
                        <ul className="r5-includes">
                          {p.includes.map((inc) => (
                            <li key={inc.item} className={inc.sub ? "r5-includes__wide" : undefined}>
                              <CheckIcon />
                              <span>
                                {inc.item}
                                {inc.sub && (
                                  <ul className="r5-includes__sub">
                                    {inc.sub.map((s) => (
                                      <li key={s}>{s}</li>
                                    ))}
                                  </ul>
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="r5-offer">
                        <div className="r5-offer__row">
                          <div className="r5-price">
                            <span className="r5-price__label">Starting at</span>
                            <span className="r5-price__value">{p.price}</span>
                          </div>
                          <button
                            className="r5-btn r5-btn--orange"
                            onClick={() => (p.cta === "builder" ? openBuilder() : openWizard())}
                          >
                            {p.ctaLabel} →
                          </button>
                        </div>
                        <p className="r5-offer__more">{p.more}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="r5-section r5-section--ink">
            <div className="r5-container r5-yourway">
              <div className="r5-signature">
                <div className="r5-photo r5-photo--tall">
                  <img
                    src={IMG.cocktail}
                    alt="Re5 signature mobile cart at a wedding"
                    loading="lazy"
                    style={{ objectPosition: "50% 62%" }}
                  />
                </div>
                <div className="r5-signature__body">
                  <h2 className="r5-h2">
                    Our signature. <span className="r5-accent">Your experience.</span>
                  </h2>
                  <p className="r5-muted">
                    Our signature mobile carts are where it starts. From there, we work with you to
                    build the experience around your event, idea or brand, from the styling and
                    signage to the tastes and people that bring it to life.
                  </p>
                </div>
              </div>
              <div className="r5-way">
                <div className="r5-way__main">
                  <h2 className="r5-h2">
                    Your experience. <span className="r5-accent">Your way.</span>
                  </h2>
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
                          <span className="r5-way__word">
                            {w.word}
                            <span className="r5-accent">.</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <p className="r5-muted r5-way__note">
                    We work with you to bring every detail together around the experience you have
                    in mind.
                  </p>
                </div>
                <div className="r5-photo r5-photo--tall r5-way__photo">
                  <img
                    key={CUSTOM_WORDS[way].src}
                    src={CUSTOM_WORDS[way].src}
                    alt={`Your ${CUSTOM_WORDS[way].word}`}
                    loading="lazy"
                    style={{ objectPosition: CUSTOM_WORDS[way].pos }}
                  />
                  <div className="r5-way__tag" aria-live="polite">
                    Your {CUSTOM_WORDS[way].word}.
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="how" className="r5-section r5-section--sand">
            <div className="r5-container r5-how">
              <div className="r5-how__head">
                <h2 className="r5-h2">
                  How it works<span className="r5-accent">.</span>
                </h2>
                <div className="r5-how__intro">
                  <p className="r5-body-soft">
                    It starts with a conversation. We get to know your idea, your moment and how
                    you want people to experience it. Then we work with you to bring it to life.
                  </p>
                  <button className="r5-btn r5-btn--dark" onClick={openWizard}>
                    Let&rsquo;s create it together →
                  </button>
                </div>
              </div>
              <ol className="r5-steps">
                {PILLARS.map((p) => (
                  <li key={p.n} className="r5-step">
                    <div className="r5-step__top">
                      <span className="r5-step__icon">
                        <StepIcon name={p.icon} />
                      </span>
                      <span className="r5-step__num">{p.n}</span>
                    </div>
                    <h3 className="r5-step__title">{p.title}</h3>
                    <p className="r5-step__body">{p.body}</p>
                  </li>
                ))}
              </ol>
              <div className="r5-local">
                <span className="r5-local__icon">
                  <StepIcon name="local" />
                </span>
                <p>{LOCAL_NOTE}</p>
              </div>
            </div>
          </section>

          <section className="r5-section r5-section--cream r5-else">
            <div className="r5-else__inner">
              <h2 className="r5-h2 r5-balance">Have something else in mind?</h2>
              <div className="r5-else__copy">
                <p className="r5-else__lead">Have an idea we haven&rsquo;t mentioned? Tell us.</p>
                <p className="r5-body-soft r5-else__sub">
                  We love seeing where an idea can go and finding a way to make it show up.
                </p>
              </div>
              <button className="r5-btn r5-btn--dark r5-else__btn" onClick={openWizard}>
                Tell us your idea →
              </button>
            </div>
          </section>

          <section className="r5-final">
            <img src={IMG.toast} alt="" loading="lazy" className="r5-final__bg" />
            <div className="r5-final__shade" />
            <div className="r5-final__inner">
              <h2 className="r5-final__title">
                Make your moment <span className="r5-final__accent">show up.</span>
              </h2>
              <div className="r5-final__body">
                <p className="r5-final__lead">
                  Your event. Your brand. Your idea. Let&rsquo;s create an experience people want
                  to be part of.
                </p>
                <button className="r5-btn r5-btn--orange r5-btn--on-photo" onClick={openWizard}>
                  Create Your Experience →
                </button>
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
                <p>Mobile experiences for brands, events and celebrations across Trinidad and Tobago.</p>
              </div>
              <div className="r5-footer__col">
                <span className="r5-footer__label">Explore</span>
                <a href="#popups">Experiences</a>
                <button className="r5-footer__link" onClick={openWizard}>
                  Create Your Experience
                </button>
                <a href="#how">How It Works</a>
              </div>
              <div className="r5-footer__col">
                <span className="r5-footer__label">Say hello</span>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener">
                  WhatsApp
                </a>
              </div>
            </div>
            <div className="r5-footer__base">Made in Trinidad and Tobago.</div>
          </div>
        </footer>
      </div>

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
    </>
  );
}
