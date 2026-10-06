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
/* One form, two paths that mirror "How do you want to show up?"      */
/* ---------------------------------------------------------------- */

type PathId = "event" | "brand";

const PATH_OPTS: { id: PathId; label: string; body: string }[] = [
  { id: "event", label: "For Your Event", body: "Weddings, birthdays, graduations and special celebrations." },
  { id: "brand", label: "For Your Brand", body: "Sampling, showcases, launches, giveaways and promotions." },
];

const EVENT_OCCASIONS = [
  "Wedding",
  "Birthday",
  "Baby shower",
  "Graduation",
  "Private celebration",
  "Corporate event",
  "Other",
];

const BRAND_GOALS = [
  "Product Sampling",
  "Product Showcases",
  "Product Launches",
  "Gifting & Giveaways",
  "Sign-ups & Service Promotions",
  "Branded RE5 Experiences",
];

// Trinidad and Tobago policy: shown wherever alcohol is offered.
const ALCOHOL_NOTE = "Alcoholic drinks are only served to guests 23 and over. No exceptions.";

const EVENT_EXPERIENCES = [
  {
    label: "Slushie",
    body: "Frozen flavours with toppings, with alcoholic options available for adult events.",
    note: ALCOHOL_NOTE,
  },
  { label: "Popcorn", body: "Freshly popped and served with a selection of seasonings." },
  { label: "Cotton Candy", body: "Made fresh for your guests throughout the experience." },
  { label: "Candy & Sweets", body: "A selection of sweets presented and served from our Signature Cart." },
];

const BRANDED_EXPERIENCES = ["Slushies", "Popcorn", "Cotton Candy", "Sweets"];

const FLORAL_OPTS = ["Florals", "Balloons", "Not sure yet"];

const SETTING_OPTS = ["Indoors", "Outdoors", "Not sure yet"];

// Brand path: what the activation should achieve, so the quote is built around the outcome.
const SUCCESS_OPTS = [
  "More people trying the product",
  "Sign-ups or leads",
  "Sales on the day",
  "Social content and followers",
  "Feedback on the product",
  "Getting the name out there",
];
const ACTION_OPTS = ["Taste or try", "Sign up", "Scan a QR code", "Follow or post", "Buy", "Share feedback"];
const FOLLOWUP_OPTS = ["Yes, contact details", "Yes, feedback", "No", "Not sure yet"];

const ADDON_OPTS: Record<PathId, string[]> = {
  event: ["Additional customization", "Personalized packaging", "Extra service time"],
  brand: [
    "Additional branding",
    "Custom packaging",
    "Additional attendants",
    "Extended service time",
    "Other campaign elements",
  ],
};

const CONTACT_FIELDS: FieldConfig[] = [
  { key: "contact", label: "Your name *", ph: "Full name" },
  { key: "email", label: "Email *", ph: "you@email.com", type: "email" },
  { key: "phone", label: "Phone / WhatsApp", ph: "+1 868", type: "tel" },
];

const list = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);
const isBrand = (a: Answers) => a.path === "brand";

// The name we ask for depends on the path, and for events on the occasion.
function nameQuestion(a: Answers): { label: string; ph: string; hint: string } {
  if (isBrand(a)) return { label: "Business / Brand name *", ph: "Your business or brand", hint: "" };
  if (a.occasion === "Corporate event")
    return { label: "Company or event name *", ph: "e.g. Year End Party", hint: "" };
  return {
    label: "Who are we celebrating? *",
    ph: "e.g. Sarah & James, Baby Maya, Zoe's 7th",
    hint: "The name or names we'll build your experience around.",
  };
}

const showsSlushieDetails = (a: Answers) =>
  isBrand(a)
    ? list(a.goals).includes("Branded RE5 Experiences") && list(a.branded).includes("Slushies")
    : list(a.experiences).includes("Slushie");

const WIZARD_PAGE_IDS = ["plan", "when", "experience", "goal", "details", "yours", "look", "extras", "connect"] as const;
type WizardPageId = (typeof WIZARD_PAGE_IDS)[number];

const visibleWizardPages = (a: Answers): WizardPageId[] =>
  WIZARD_PAGE_IDS.filter(
    (id) => (id !== "details" || showsSlushieDetails(a)) && (id !== "goal" || isBrand(a))
  );

function validateWizardPage(id: WizardPageId, a: Answers): string {
  if (id === "plan") {
    if (!a.path) return "Pick For Your Event or For Your Brand to keep going.";
    if (isBrand(a)) {
      if (!list(a.goals).length) return "Pick at least one way to show up.";
    } else {
      if (!a.occasion) return "Pick the occasion to keep going.";
      if (a.occasion === "Other" && !String(a.occasionOther || "").trim())
        return "Tell us what you're celebrating.";
    }
  }
  if (id === "experience") {
    if (isBrand(a)) {
      if (!String(a.products || "").trim()) return "Tell us what you're putting in people's hands.";
      if (list(a.goals).includes("Branded RE5 Experiences") && !list(a.branded).length)
        return "Pick which RE5 experience to brand.";
    } else if (!list(a.experiences).length) return "Pick at least one experience.";
  }
  if (id === "goal" && !list(a.success).length) return "Pick at least one thing that would make this a success.";
  if (id === "details") {
    if (!a.slushieFor) return "Pick one to keep going.";
    if ((a.slushieFor === "Adults" || a.slushieFor === "Both") && !a.alcohol)
      return "Let us know about the alcoholic option.";
  }
  if (id === "yours" && !String(a.name || "").trim())
    return isBrand(a) ? "Add your business or brand name." : "Tell us who we're celebrating.";
  if (id === "connect") {
    if (!a.contactPref) return "Pick how you'd like us to contact you.";
    if (!a.contact || !a.email) return "Add your name and email so we can reply.";
    if (!/^\S+@\S+\.\S+$/.test(String(a.email))) return "That email looks incomplete.";
    if ((a.contactPref === "WhatsApp" || a.contactPref === "Phone") && !String(a.phone || "").trim())
      return `Add your number so we can reach you on ${a.contactPref}.`;
  }
  return "";
}

type Upload = { filename: string; type: string; content: string };

// Vercel rejects request bodies over ~4.5 MB, so keep all attachments under this (base64 size).
const MAX_UPLOAD_CHARS = 4_000_000;
const UPLOAD_KEYS: Record<PathId, string[]> = { event: ["themeUpload"], brand: ["brandLogo", "brandMaterial"] };

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

// Phone photos are often 5-10 MB; scale big images down so they fit in one request.
async function prepareUpload(file: File): Promise<Upload> {
  let blob: Blob = file;
  let filename = file.name;
  if (file.type.startsWith("image/") && file.type !== "image/svg+xml" && file.size > 900_000) {
    // Some formats (e.g. HEIC outside Safari) can't be decoded; then send the original as-is.
    const img = await createImageBitmap(file).catch(() => null);
    if (!img) return readAsDataUrl(file).then((d) => ({ filename, type: file.type, content: d.slice(d.indexOf(",") + 1) }));
    const scale = Math.min(1, 2000 / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
    const keepPng = file.type === "image/png";
    blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("resize failed"))),
        keepPng ? "image/png" : "image/jpeg",
        0.85
      )
    );
    if (!keepPng) filename = filename.replace(/\.[^.]+$/, "") + ".jpg";
  }
  const dataUrl = await readAsDataUrl(blob);
  return { filename, type: blob.type, content: dataUrl.slice(dataUrl.indexOf(",") + 1) };
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

// Short label used in the email subject line, e.g. "Wedding" or "Brand: Product Sampling".
function wizardOffer(a: Answers): string {
  if (isBrand(a)) return `Brand: ${list(a.goals).join(", ")}`;
  return a.occasion === "Other" ? String(a.occasionOther || "Event") : String(a.occasion || "Event");
}

function buildWizardBrief(a: Answers) {
  const rows: { n: string; tag: string; answer: string }[] = [];
  let n = 1;
  const push = (tag: string, answer: string) => {
    rows.push({ n: String(n++).padStart(2, "0"), tag, answer: answer || "Not answered" });
  };
  const brand = isBrand(a);

  push("Request", brand ? "The Brand Experience" : "The Signature Experience");
  if (brand) {
    push("Business / Brand", String(a.name || ""));
    push("How they want to show up", list(a.goals).join(", "));
  } else {
    push(a.occasion === "Corporate event" ? "Company / Event" : "Celebrating", String(a.name || ""));
    push("Occasion", wizardOffer(a));
  }
  push("Date", formatWizardDate(a.eventDate));
  push("Location", [a.venue, a.venueStatus].filter(Boolean).join(" · "));
  push("Indoors / outdoors", String(a.setting || ""));
  push(brand ? "Expected reach" : "Guests", a.guestCount ? String(a.guestCount) : "");

  if (brand) {
    push("Product / service", String(a.products || ""));
    if (list(a.goals).includes("Branded RE5 Experiences")) push("Branded experience", list(a.branded).join(", "));
    push("Goal: success looks like", list(a.success).join(", "));
    push("Goal: people should", list(a.actions).join(", "));
    push("Goal: collect for follow-up", String(a.followup || ""));
    push("Goal: measured by", String(a.measure || ""));
  } else {
    push("Experience", list(a.experiences).join(", "));
  }

  if (showsSlushieDetails(a)) {
    const alcoholNote =
      a.slushieFor === "Adults" || a.slushieFor === "Both" ? ` · Alcohol: ${a.alcohol || ""}` : "";
    push("Slushie details", `${a.slushieFor || ""}${alcoholNote}`);
  }

  if (brand) {
    push(
      "Branding",
      [
        a.brandColours ? `Colours: ${a.brandColours}` : "",
        a.brandLogo ? `Logo: ${a.brandLogo}` : "",
        a.brandMaterial ? `Material: ${a.brandMaterial}` : "",
      ]
        .filter(Boolean)
        .join(" · ")
    );
    push("Message sign", String(a.signText || ""));
  } else {
    push("Small sign", String(a.signText || ""));
    push("Florals or balloons", String(a.florals || ""));
    push(
      "Theme / colours",
      [a.themeNote, a.themeUpload ? `Uploaded: ${a.themeUpload}` : ""].filter(Boolean).join(" · ")
    );
  }

  push("Add-ons", list(a.addons).join(", ") || "None");
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

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="r5-check" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// "The RE5 Model": five things that guide every experience.
const MODEL = [
  {
    n: "01",
    title: "Connect",
    icon: "connect" as StepIconName,
    q: "Who is this for?",
    body: ["We start with the people, the occasion and what you want the experience to do."],
  },
  {
    n: "02",
    title: "Idea",
    icon: "idea" as StepIconName,
    q: "What could we create?",
    body: ["We turn the occasion, audience or brand into an idea people can actually take part in."],
  },
  {
    n: "03",
    title: "Look",
    icon: "look" as StepIconName,
    q: "Now we make it yours.",
    body: ["From the cart to the signage, styling and details, we create a look that belongs to your event or brand."],
  },
  {
    n: "04",
    title: "Moment",
    icon: "moment" as StepIconName,
    q: "This is where it comes to life.",
    body: ["People taste it. Try it. Enjoy it. Interact with it.", "They\u2019re part of the experience now."],
  },
  {
    n: "05",
    title: "Buzz",
    icon: "buzz" as StepIconName,
    q: "A good moment doesn\u2019t always end when the event does.",
    body: ["Give people something worth remembering, sharing and talking about."],
  },
];

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

const MARQUEE_WORDS = ["Experience It", "Make A Moment", "Make It Yours", "Show Up"];

const CUSTOM_WORDS = [
  { word: "colours", src: IMG.kids, pos: "45% 60%" },
  { word: "style", src: IMG.boxes, pos: "50% 60%" },
  { word: "signage", src: IMG.popcorn, pos: "50% 45%" },
  { word: "menu", src: IMG.cocktail, pos: "50% 55%" },
  { word: "moment", src: IMG.toast, pos: "50% 40%" },
];

// "Don't just show up": the kinds of brand experiences, shown as tiles.
const BRAND_WAYS = [
  "A product to taste.",
  "Something new to try.",
  "A launch to introduce.",
  "A pop-up people can step into.",
];

// "Start with an experience": each card opens the request form with that experience picked.
const EXPERIENCES = [
  {
    name: "Slushie",
    tagline: "Frozen, fun and made for your moment.",
    body: "Choose your flavours, finishing touches and styling, then let your guests sip, mix and enjoy.",
    preset: { experiences: ["Slushie"], branded: ["Slushies"] },
  },
  {
    name: "Popcorn",
    tagline: "A classic, with a little more personality.",
    body: "Fresh popcorn, fun flavours and a setup styled to feel right at home at your event.",
    preset: { experiences: ["Popcorn"], branded: ["Popcorn"] },
  },
  {
    name: "Cotton Candy",
    tagline: "A little fun, made right in front of you.",
    body: "Freshly spun and styled for the occasion, giving your guests something to watch, enjoy and, of course, eat.",
    preset: { experiences: ["Cotton Candy"], branded: ["Cotton Candy"] },
  },
  {
    name: "Candy & Sweets",
    tagline: "Pick. Mix. Make it yours.",
    body: "A colourful experience where guests can choose their favourites and create a little something of their own.",
    preset: { experiences: ["Candy & Sweets"], branded: ["Sweets"] },
  },
];

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
      { src: IMG.cocktail, alt: "Bartender serving a slushie at a wedding", pos: "50% 30%" },
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
      { src: IMG.popcorn, alt: "Branded popcorn cart in a mall", pos: "50% 45%" },
      { src: IMG.boxes, alt: "Branded popcorn boxes", pos: "60% 65%" },
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
  // True when the form was opened from a panel, so Event/Brand is already known.
  const [pathPicked, setPathPicked] = useState(false);
  const [uploads, setUploads] = useState<Record<string, Upload>>({});
  const [uploadErr, setUploadErr] = useState("");

  const contRef = useRef<HTMLButtonElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

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

  // Accepts a path when opened from a panel; the plain CTAs pass a click event, which is ignored.
  const openWizard = useCallback((path?: unknown, preset?: Answers) => {
    setAnswers({ ...(path === "event" || path === "brand" ? { path } : {}), ...preset });
    setPathPicked(path === "event" || path === "brand");
    setUploads({});
    setUploadErr("");
    setOpen(true);
    setMode("intro");
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

  const setWizardFile = useCallback(
    async (key: string, e: ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      e.target.value = "";
      if (!f) return;
      setUploadErr("");
      try {
        const up = await prepareUpload(f);
        if (up.content.length > MAX_UPLOAD_CHARS) {
          setUploadErr("That file is too large to send. Please use one under 3 MB.");
          return;
        }
        setUploads((prev) => ({ ...prev, [key]: up }));
        setA(key, up.filename);
      } catch {
        setUploadErr("We couldn't read that file. Try a JPG, PNG or PDF.");
      }
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
    const attachments = UPLOAD_KEYS[isBrand(answers) ? "brand" : "event"]
      .map((k) => uploads[k])
      .filter(Boolean);
    if (attachments.reduce((n, a) => n + a.content.length, 0) > MAX_UPLOAD_CHARS) {
      setSendError("Your files are too large to send together. Remove one and try again.");
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
          company: answers.name,
          companyLabel: isBrand(answers) ? "Business / Brand" : "Celebrating",
          brief,
          attachments,
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
  }, [answers, uploads, visibleWizard, confetti]);

  const finish = useCallback(() => {
    close();
    setMode("intro");
    setIdx(0);
    setAnswers({});
    setUploads({});
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
              <p className="r5-hero__lead">Give people something to taste, try, enjoy and talk about.</p>
              <p className="r5-hero__sub">
                We create mobile experiences for events, celebrations and brands across Trinidad &amp; Tobago,
                made to pop up wherever the moment takes us.
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
                <div className="r5-stack-16">
                  <p className="r5-body-soft">
                    Whether you&rsquo;re planning a celebration or putting your brand in front of people, it
                    starts with the same thing:
                  </p>
                  <p className="r5-split__kicker">
                    <span className="r5-accent">Give them something to be part of.</span>
                  </p>
                </div>
              </div>
              <div className="r5-split__cards">
                {PATHS.map((p) => (
                  <a key={p.id} href={`#${p.id}`} className="r5-split__card" data-path={p.id}>
                    <div className="r5-photo r5-split__photo">
                      <img src={p.images[0].src} alt={p.images[0].alt} loading="lazy" style={{ objectPosition: p.images[0].pos }} />
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
                <img src={IMG.kids} alt="Kids' birthday slushie cart" loading="lazy" style={{ objectPosition: "45% 55%" }} />
              </div>
              <div className="r5-feature__body">
                <span className="r5-eyebrow">For Your Event</span>
                <h2 className="r5-h2">
                  Give them something to <span className="r5-accent">experience.</span>
                </h2>
                <div className="r5-stack-16">
                  <p className="r5-feature__lead">You&rsquo;ve planned the place, the people and the occasion.</p>
                  <p className="r5-body-soft">Now let&rsquo;s add something your guests can actually be part of.</p>
                  <p className="r5-body-soft">
                    RE5 creates mobile experiences for weddings, birthdays, celebrations and events. Start with one of
                    ours or tell us what you have in mind.
                  </p>
                  <p className="r5-body-soft">We&rsquo;ll shape the details around your moment.</p>
                </div>
                <a href="#experiences" className="r5-btn r5-btn--dark">
                  Explore Event Experiences →
                </a>
              </div>
            </div>
          </section>

          <section id="experiences" className="r5-section r5-section--cream">
            <div className="r5-container r5-xp">
              <h2 className="r5-h2">
                Start with an <span className="r5-accent">experience.</span>
              </h2>
              <ul className="r5-xp__grid">
                {EXPERIENCES.map((x, i) => (
                  <li key={x.name} className="r5-xp__card">
                    <span className="r5-xp__num">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="r5-xp__name">{x.name}</h3>
                    <p className="r5-xp__tagline">{x.tagline}</p>
                    <p className="r5-xp__body">{x.body}</p>
                    <button className="r5-xp__btn" onClick={() => openWizard(undefined, x.preset)}>
                      Explore <span aria-hidden="true">→</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="r5-section r5-section--sand r5-else">
            <div className="r5-else__inner">
              <h2 className="r5-h2 r5-balance">Got something else <span className="r5-accent">in mind?</span></h2>
              <div className="r5-else__copy">
                <p className="r5-else__lead">It doesn&rsquo;t have to be on our menu.</p>
                <p className="r5-body-soft">
                  Maybe you&rsquo;ve seen an idea you love.
                  <br />
                  Maybe there&rsquo;s a food or drink you want to turn into an experience.
                  <br />
                  Or maybe you just know how you want the moment to feel.
                </p>
                <p className="r5-else__lead">Tell us.</p>
                <p className="r5-body-soft r5-else__sub">
                  If it fits what we do, we&rsquo;ll figure out the right way, and the right people, to bring it
                  together.
                </p>
              </div>
              <button className="r5-btn r5-btn--dark r5-else__btn" onClick={openWizard}>
                Let&rsquo;s Chat →
              </button>
            </div>
          </section>

          <section className="r5-section r5-section--ink">
            <div className="r5-container r5-way">
              <div className="r5-way__main">
                <h2 className="r5-h2">
                  Our signature. <span className="r5-accent">Made yours.</span>
                </h2>
                <div className="r5-stack-16">
                  <p className="r5-muted">Our Signature Cart is where it starts.</p>
                  <p className="r5-muted">
                    From there, we shape the colours, styling, signage and little details around you.
                  </p>
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
                <img src={IMG.popcorn} alt="Branded popcorn cart in a mall" loading="lazy" style={{ objectPosition: "50% 45%" }} />
              </div>
              <div className="r5-feature__body">
                <span className="r5-eyebrow">For Your Brand</span>
                <h2 className="r5-h2">
                  People can see your product. <span className="r5-accent">But have they experienced it?</span>
                </h2>
                <div className="r5-stack-16">
                  <p className="r5-feature__lead">
                    An ad can introduce it.
                    <br />
                    A shelf can display it.
                  </p>
                  <p className="r5-body-soft">
                    But sometimes people need to taste it, try it, touch it or talk about it to really get it.
                  </p>
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
                    From there, we think about where those people already are, what would get them involved and
                    what kind of experience would make sense for your brand.
                  </p>
                </div>
              </div>
              <div className="r5-where__side">
                <ul className="r5-where__ways">
                  {BRAND_WAYS.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
                <p className="r5-where__close">
                  You bring the product. <span className="r5-accent">We create a way for people to experience it.</span>
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

          <section className="r5-section r5-section--cream">
            <div className="r5-container r5-made">
              <h2 className="r5-h2">
                Made here. <span className="r5-accent">Together.</span>
              </h2>
              <div className="r5-made__copy">
                <p className="r5-made__lead">Some ideas need the right people.</p>
                <p className="r5-body-soft">
                  When your idea calls for something specialized, we collaborate with local makers, bartenders,
                  caterers and businesses across Trinidad &amp; Tobago who know their craft.
                </p>
                <p className="r5-body-soft">We bring the right pieces together around one experience.</p>
                <p className="r5-made__close">
                  <span className="r5-accent">One idea. The right people. Made together.</span>
                </p>
              </div>
            </div>
          </section>

          <section className="r5-final">
            <img src={IMG.toast} alt="" loading="lazy" className="r5-final__bg" />
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
                <button className="r5-btn r5-btn--orange r5-btn--on-photo" onClick={openWizard}>
                  Let&rsquo;s Chat →
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
                <p>Mobile experiences for events, celebrations and brands across Trinidad &amp; Tobago.</p>
              </div>
              <div className="r5-footer__col">
                <span className="r5-footer__label">Explore</span>
                <a href="#experiences">Experiences</a>
                <a href="#event">For Your Event</a>
                <a href="#brand">For Your Brand</a>
                <a href="#model">The RE5 Model</a>
              </div>
              <div className="r5-footer__col">
                <span className="r5-footer__label">Create</span>
                <button className="r5-footer__link" onClick={openWizard}>
                  Create Your Experience
                </button>
                <button className="r5-footer__link" onClick={openWizard}>
                  Let&rsquo;s Chat
                </button>
              </div>
              <div className="r5-footer__col">
                <span className="r5-footer__label">Say hello</span>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener">
                  WhatsApp
                </a>
              </div>
            </div>
            <div className="r5-footer__base">Made in Trinidad &amp; Tobago.</div>
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
                </>
              )}

              {isQ && page === "plan" && (
                <>
                  <span className="wizard-tag">
                    <StarIcon className="wizard-tag-star" /> The plan
                  </span>
                  <h2 className="wizard-question">How do you want to show up?</h2>
                  {pathPicked && answers.path ? (
                    <div className="wizard-path-picked">
                      <span>✓ {PATH_OPTS.find((p) => p.id === answers.path)?.label}</span>
                      <button type="button" onClick={() => setPathPicked(false)}>
                        Change
                      </button>
                    </div>
                  ) : (
                  <div className="wizard-choice-cards">
                    {PATH_OPTS.map((p) => (
                      <button
                        key={p.id}
                        className={`wizard-choice-card ${answers.path === p.id ? "wizard-choice-card-active" : ""}`}
                        onClick={(e) => {
                          setA("path", p.id);
                          revealNext(e.currentTarget);
                        }}
                      >
                        <span className="wizard-choice-card-label">{p.label}</span>
                        <span className="wizard-choice-card-body">{p.body}</span>
                        <span className="wizard-choice-card-mark">
                          {answers.path === p.id ? "✓ Selected" : "Select"}
                        </span>
                      </button>
                    ))}
                  </div>
                  )}

                  {answers.path === "event" && (
                    <div className="wizard-subquestion">
                      <p className="wizard-hint">What&rsquo;s the occasion?</p>
                      <div className="wizard-options">
                        {EVENT_OCCASIONS.map((o, i) => renderOption("occasion", o, i))}
                      </div>
                      {answers.occasion === "Other" && (
                        <label className="wizard-extra-field">
                          <span>Tell us what you&rsquo;re celebrating</span>
                          <input
                            value={String(answers.occasionOther || "")}
                            onChange={(e) => setA("occasionOther", e.target.value)}
                            placeholder="e.g. anniversary, gender reveal, engagement"
                          />
                        </label>
                      )}
                    </div>
                  )}

                  {answers.path === "brand" && (
                    <div className="wizard-subquestion">
                      <p className="wizard-hint">Choose how you show up. Pick all that apply.</p>
                      <div className="wizard-options">
                        {BRAND_GOALS.map((o, i) => renderOption("goals", o, i, true))}
                      </div>
                    </div>
                  )}

                </>
              )}

              {isQ && page === "when" && (
                <>
                  <span className="wizard-tag">
                    <StarIcon className="wizard-tag-star" /> The plan
                  </span>
                  <h2 className="wizard-question">When and where?</h2>
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
                        placeholder={answers.path === "brand" ? "Mall, store, office or event" : "Venue / Location"}
                      />
                    </label>
                  </div>
                  <div className="wizard-subquestion">
                    <div className="wizard-options">
                      {["Location confirmed", "Still deciding"].map((o, i) => renderOption("venueStatus", o, i))}
                    </div>
                  </div>
                  <div className="wizard-subquestion">
                    <p className="wizard-hint">Will it be indoors or outdoors?</p>
                    <div className="wizard-options">
                      {SETTING_OPTS.map((o, i) => renderOption("setting", o, i))}
                    </div>
                  </div>
                  <label className="wizard-extra-field">
                    <span>
                      {answers.path === "brand"
                        ? "Roughly how many people do you want to reach?"
                        : "How many guests are you expecting?"}
                    </span>
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

              {isQ && page === "experience" && !isBrand(answers) && (
                <>
                  <span className="wizard-tag">
                    <StarIcon className="wizard-tag-star" /> The experience
                  </span>
                  <h2 className="wizard-question">Choose your experience.</h2>
                  <p className="wizard-hint">Pick one, or more if you&rsquo;d like to combine them.</p>
                  <div className="wizard-choice-cards">
                    {EVENT_EXPERIENCES.map((c) => {
                      const on = list(answers.experiences).includes(c.label);
                      return (
                        <button
                          key={c.label}
                          className={`wizard-choice-card ${on ? "wizard-choice-card-active" : ""}`}
                          onClick={() => toggleA("experiences", c.label)}
                        >
                          <span className="wizard-choice-card-label">{c.label}</span>
                          <span className="wizard-choice-card-body">{c.body}</span>
                          {"note" in c && <span className="wizard-age-note">{c.note}</span>}
                          <span className="wizard-choice-card-mark">{on ? "✓ Selected" : "Select"}</span>
                        </button>
                      );
                    })}
                  </div>
                  <WizardIncludes path={isBrand(answers) ? "brand" : "event"} />
                </>
              )}

              {isQ && page === "experience" && isBrand(answers) && (
                <>
                  <span className="wizard-tag">
                    <StarIcon className="wizard-tag-star" /> The experience
                  </span>
                  <h2 className="wizard-question">What are you putting in people&rsquo;s hands?</h2>
                  <p className="wizard-hint">Tell us about the product, service or idea we&rsquo;re bringing to people.</p>
                  <textarea
                    className="wizard-textarea"
                    rows={3}
                    placeholder="e.g. our new iced coffee, a phone plan sign-up, a skincare launch"
                    value={String(answers.products || "")}
                    onChange={(e) => setA("products", e.target.value)}
                  />
                  {list(answers.goals).includes("Branded RE5 Experiences") && (
                    <div className="wizard-subquestion">
                      <p className="wizard-hint">Which RE5 experience should we brand for your campaign?</p>
                      <div className="wizard-options">
                        {BRANDED_EXPERIENCES.map((o, i) => renderOption("branded", o, i, true))}
                      </div>
                    </div>
                  )}
                  <WizardIncludes path={isBrand(answers) ? "brand" : "event"} />
                </>
              )}

              {isQ && page === "goal" && (
                <>
                  <span className="wizard-tag">
                    <StarIcon className="wizard-tag-star" /> The goal
                  </span>
                  <h2 className="wizard-question">What would make this a success?</h2>
                  <p className="wizard-hint">Pick all that apply.</p>
                  <div className="wizard-options">
                    {SUCCESS_OPTS.map((o, i) => renderOption("success", o, i, true))}
                  </div>
                  <div className="wizard-subquestion">
                    <p className="wizard-hint">What should people do when they come over? (Optional)</p>
                    <div className="wizard-options">
                      {ACTION_OPTS.map((o, i) => renderOption("actions", o, i, true))}
                    </div>
                  </div>
                  <div className="wizard-subquestion">
                    <p className="wizard-hint">Do you need us to collect anything for follow-up?</p>
                    <div className="wizard-options">
                      {FOLLOWUP_OPTS.map((o, i) => renderOption("followup", o, i))}
                    </div>
                  </div>
                  <label className="wizard-extra-field">
                    <span>How will you measure it? (Optional)</span>
                    <input
                      value={String(answers.measure || "")}
                      onChange={(e) => setA("measure", e.target.value)}
                      placeholder="e.g. samples handed out, sign-ups, QR scans, or not sure yet"
                    />
                  </label>
                </>
              )}

              {isQ && page === "details" && (
                <>
                  <span className="wizard-tag">
                    <StarIcon className="wizard-tag-star" /> The slushies
                  </span>
                  <h2 className="wizard-question">Who are the slushies for?</h2>
                  <div className="wizard-options">
                    {["Children", "Adults", "Both"].map((o, i) => renderOption("slushieFor", o, i))}
                  </div>
                  {(answers.slushieFor === "Adults" || answers.slushieFor === "Both") && (
                    <div className="wizard-subquestion">
                      <p className="wizard-hint">Would you like an alcoholic slushie option?</p>
                      <p className="wizard-age-note">{ALCOHOL_NOTE}</p>
                      <div className="wizard-options">
                        {["Yes", "No", "Not sure yet"].map((o, i) => renderOption("alcohol", o, i))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {isQ && page === "yours" && (
                <>
                  <span className="wizard-tag">
                    <StarIcon className="wizard-tag-star" /> Make it yours
                  </span>
                  <h2 className="wizard-question">Make it yours.</h2>
                  <div className="wizard-fields">
                    <label className="wizard-field">
                      <span>{nameQuestion(answers).label}</span>
                      <input
                        value={String(answers.name || "")}
                        onChange={(e) => setA("name", e.target.value)}
                        placeholder={nameQuestion(answers).ph}
                      />
                    </label>
                  </div>
                  {nameQuestion(answers).hint && <p className="wizard-hint">{nameQuestion(answers).hint}</p>}

                  <label className="wizard-extra-field">
                    <span>
                      {isBrand(answers)
                        ? "What should your message sign say? (Optional)"
                        : "What should your small sign say? (Optional)"}
                    </span>
                    <input
                      value={String(answers.signText || "")}
                      onChange={(e) => setA("signText", e.target.value)}
                      placeholder={
                        isBrand(answers)
                          ? "e.g. Try it free today"
                          : "Your names, a message or your menu"
                      }
                    />
                  </label>

                </>
              )}

              {isQ && page === "look" && (
                <>
                  <span className="wizard-tag">
                    <StarIcon className="wizard-tag-star" /> The look
                  </span>
                  <h2 className="wizard-question">{isBrand(answers) ? "Your branding." : "The finishing touches."}</h2>
                  {isBrand(answers) && (
                    <div className="wizard-fields">
                      <label className="wizard-field">
                        <span>Brand colours</span>
                        <input
                          value={String(answers.brandColours || "")}
                          onChange={(e) => setA("brandColours", e.target.value)}
                          placeholder="e.g. navy and gold"
                        />
                      </label>
                    </div>
                  )}
                  {!isBrand(answers) && (
                    <>
                      <div className="wizard-subquestion">
                        <p className="wizard-hint">Florals or balloons?</p>
                        <div className="wizard-options">
                          {FLORAL_OPTS.map((o, i) => renderOption("florals", o, i))}
                        </div>
                      </div>
                      <label className="wizard-extra-field">
                        <span>Do you have a theme or colours? (Optional)</span>
                        <input
                          value={String(answers.themeNote || "")}
                          onChange={(e) => setA("themeNote", e.target.value)}
                          placeholder="e.g. sage and gold"
                        />
                      </label>
                    </>
                  )}

                  <div className="wizard-uploads">
                    {(isBrand(answers)
                      ? ([
                          ["brandLogo", "Upload your logo"],
                          ["brandMaterial", "Have brand material you’d like us to see? (Optional)"],
                        ] as const)
                      : ([["themeUpload", "Have something you’d like us to see? (Optional)"]] as const)
                    ).map(([key, label]) => (
                      <label className="wizard-upload-row" key={key}>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          hidden
                          onChange={(e) => setWizardFile(key, e)}
                        />
                        <span className="wizard-upload-label">{label}</span>
                        <span className="wizard-upload-status">
                          <span className="wizard-upload-files">{String(answers[key] || "")}</span>
                          <span className={`wizard-upload-btn ${answers[key] ? "wizard-upload-btn-filled" : ""}`}>
                            {answers[key] ? "Replace" : "Upload"}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                  {uploadErr && <p className="wizard-error">{uploadErr}</p>}
                </>
              )}

              {isQ && page === "extras" && (
                <>
                  <span className="wizard-tag">
                    <StarIcon className="wizard-tag-star" /> Last thing
                  </span>
                  <h2 className="wizard-question">
                    {isBrand(answers) ? "Need more?" : "Want to make it even more yours?"}
                  </h2>
                  <p className="wizard-hint">Add anything you&rsquo;d like included. (Optional)</p>
                  <div className="wizard-options">
                    {ADDON_OPTS[isBrand(answers) ? "brand" : "event"].map((o, i) => renderOption("addons", o, i, true))}
                  </div>
                  <div className="wizard-subquestion">
                    <p className="wizard-hint">Anything else we should know? (Optional)</p>
                    <textarea
                      className="wizard-textarea"
                      rows={3}
                      value={String(answers.notes || "")}
                      onChange={(e) => setA("notes", e.target.value)}
                      placeholder="Tell us anything else that would help."
                    />
                  </div>
                </>
              )}

              {isQ && page === "connect" && (
                <>
                  <span className="wizard-tag">
                    <StarIcon className="wizard-tag-star" /> Let&rsquo;s connect
                  </span>
                  <h2 className="wizard-question">Let&rsquo;s connect.</h2>
                  <div>
                    <p className="wizard-hint">How would you prefer us to contact you?</p>
                    <div className="wizard-options">
                      {["WhatsApp", "Phone", "Email"].map((o, i) => renderOption("contactPref", o, i))}
                    </div>
                  </div>
                  <div className="wizard-subquestion">
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
                &larr;<span className="wizard-back-label"> Back</span>
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

/* ---------------------------------------------------------------- */
/* Sub components                                                     */
/* ---------------------------------------------------------------- */

// Full "includes" list, shown in the request form while people choose.
function WizardIncludes({ path }: { path: PathDef["id"] }) {
  const p = PATHS.find((x) => x.id === path)!;
  return (
    <div className="wizard-includes" data-path={path}>
      <span className="wizard-includes-title">{p.includesTitle}</span>
      <ul>
        {p.includes.map((inc) => (
          <li key={inc.item}>
            <CheckIcon />
            <span>
              {inc.item}
              {inc.sub && (
                <ul className="wizard-includes-sub">
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
  );
}

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
          <p className="r5-cycle__q">{step.q}</p>
          {step.body.map((b) => (
            <p key={b} className="r5-cycle__body">{b}</p>
          ))}
        </div>
      </div>
    </div>
      <div className="r5-cycle__below" aria-hidden="true">
        <p className="r5-cycle__q">{step.q}</p>
        {step.body.map((b) => (
          <p key={b} className="r5-cycle__body">{b}</p>
        ))}
      </div>
    </div>
  );
}
