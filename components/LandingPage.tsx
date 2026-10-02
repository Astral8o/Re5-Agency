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

const WIZARD_PAGE_IDS = ["plan", "when", "experience", "details", "yours", "look", "extras", "connect"] as const;
type WizardPageId = (typeof WIZARD_PAGE_IDS)[number];

const visibleWizardPages = (a: Answers): WizardPageId[] =>
  WIZARD_PAGE_IDS.filter((id) => id !== "details" || showsSlushieDetails(a));

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
  push(brand ? "Expected reach" : "Guests", a.guestCount ? String(a.guestCount) : "");

  if (brand) {
    push("Product / service", String(a.products || ""));
    if (list(a.goals).includes("Branded RE5 Experiences")) push("Branded experience", list(a.branded).join(", "));
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

/* ---------------------------------------------------------------- */
/* Paths (for your event / for your brand)                           */
/* ---------------------------------------------------------------- */

type PathDef = {
  id: "event" | "brand";
  n: string;
  eyebrow: string;
  kicker: string;
  heading: string;
  body: string;
  chooseTitle: React.ReactNode;
  options: { name: string; body: string; note?: string }[];
  includesTitle: string;
  includes: { item: string; sub?: string[] }[];
  more: string;
  images: { src: string; alt: string; pos: string }[];
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
      {
        name: "Slushie",
        body: "Frozen flavours with toppings, with alcoholic options available for adult events.",
        note: ALCOHOL_NOTE,
      },
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
    images: [
      { src: IMG.cocktail, alt: "Bartender serving a slushie at a wedding", pos: "50% 30%" },
      { src: IMG.kids, alt: "Kids' birthday slushie cart", pos: "40% 50%" },
    ],
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
  const [option, setOption] = useState<Record<PathDef["id"], number>>({ event: 0, brand: 0 });

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"intro" | "q" | "done">("intro");
  const [idx, setIdx] = useState(0);
  const [err, setErr] = useState("");
  const [answers, setAnswers] = useState<Answers>({});
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
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
  const openWizard = useCallback((path?: unknown) => {
    setAnswers(path === "event" || path === "brand" ? { path } : {});
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
                        data-path={p.id}
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
                    data-path={p.id}
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
                        <div className="r5-chip-details" aria-live="polite">
                          {p.options.map((o, i) => (
                            <p
                              key={o.name}
                              className={`r5-chip-detail ${option[p.id] === i ? "r5-is-active" : ""}`}
                              aria-hidden={option[p.id] !== i}
                            >
                              {o.body}
                              {o.note && <span className="r5-age-note">{o.note}</span>}
                            </p>
                          ))}
                        </div>
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
                        <p className="r5-offer__more">{p.more}</p>
                        <button
                          className="r5-btn r5-btn--path"
                          onClick={() => openWizard(p.id)}
                        >
                          Request a Quote →
                        </button>
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
