// Data model, defaults and text templates for the Website Blueprint Planner.
// Everything here works only from the visitor's own answers: no AI calls, nothing invented.

export type ImageRole = "logo" | "photo" | "hero" | "portfolio" | "background" | "inspiration";

export type UploadedImage = {
  id: string;
  file: File;
  url: string; // object URL for previews
  role: ImageRole;
  projectId?: string;
  caption: string;
};

export type Project = {
  id: string;
  title: string;
  forWho: string;
  contribution: string;
  description: string;
  outcome: string;
};

export type Credential = { id: string; type: string; text: string };
export type Inspiration = { id: string; url: string; note: string };

export type Blueprint = {
  about: {
    name: string;
    what: string;
    who: string;
    services: string;
    enjoy: string;
    distinctive: string;
    action: string;
    location: string;
  };
  voice: {
    traits: string[];
    explain: string;
    feel: string[];
    feelOther: string;
    soundLike: string;
    avoid: string;
    love: string;
    dislike: string;
    summary: string;
    approved: boolean;
  };
  hero: { headline: string; intro: string; cta: string };
  projects: Project[];
  services: { what: string; forWho: string; receive: string; description: string };
  aboutSection: { background: string; interests: string; approach: string; experience: string };
  credibility: Credential[];
  contact: { email: string; whatsapp: string; instagram: string; linkedin: string; other: string; cta: string };
  style: {
    direction: string;
    primary: string;
    secondary: string;
    typography: string;
    inspirations: Inspiration[];
    likes: string;
  };
};

export const TRAITS = ["Friendly", "Professional", "Warm", "Confident", "Playful", "Calm", "Creative", "Direct", "Thoughtful", "Relaxed"];
export const FEELINGS = ["Welcome", "Confident in my skills", "Inspired", "Understood", "Relaxed", "Excited to work with me", "Informed"];
export const CTA_OPTIONS = ["View My Work", "Contact Me", "Book a Call", "Send Me a Message", "Request a Quote", "Follow My Work"];
export const CREDIBILITY_TYPES = ["Testimonial", "Credential or qualification", "Achievement or award", "Relevant experience", "Completed project"];
export const TYPOGRAPHY = [
  "Clean and modern (simple sans-serif)",
  "Classic and elegant (serif headings)",
  "Bold and graphic (big, heavy headings)",
  "Friendly and rounded",
  "No preference",
];
export const DIRECTIONS = [
  {
    id: "minimal",
    name: "Minimal and clean",
    body: "Lots of white space, simple layouts and calm colours. Your work does the talking.",
  },
  {
    id: "bold",
    name: "Bold and expressive",
    body: "Big headlines, strong colour and confident layouts that are hard to forget.",
  },
  {
    id: "editorial",
    name: "Editorial and elegant",
    body: "Magazine-style layouts, refined type and generous images.",
  },
  {
    id: "warm",
    name: "Warm and personal",
    body: "Soft colours, friendly type and photos that show the person behind the work.",
  },
];

export const ROLE_LABELS: Record<ImageRole, string> = {
  logo: "My logo",
  photo: "A photo of me",
  hero: "My main hero image",
  portfolio: "A portfolio project",
  background: "A background image",
  inspiration: "Website inspiration screenshot",
};

export const uid = () => Math.random().toString(36).slice(2, 10);

export const emptyProject = (): Project => ({ id: uid(), title: "", forWho: "", contribution: "", description: "", outcome: "" });

export const EMPTY: Blueprint = {
  about: { name: "", what: "", who: "", services: "", enjoy: "", distinctive: "", action: "", location: "" },
  voice: { traits: [], explain: "", feel: [], feelOther: "", soundLike: "", avoid: "", love: "", dislike: "", summary: "", approved: false },
  hero: { headline: "", intro: "", cta: "" },
  projects: [emptyProject()],
  services: { what: "", forWho: "", receive: "", description: "" },
  aboutSection: { background: "", interests: "", approach: "", experience: "" },
  credibility: [],
  contact: { email: "", whatsapp: "", instagram: "", linkedin: "", other: "", cta: "" },
  style: { direction: "", primary: "#007750", secondary: "#B99ABE", typography: "", inspirations: [], likes: "" },
};

/* ---------- small text helpers ---------- */
export const t = (s: string) => s.trim();
const listJoin = (items: string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
const lower = (s: string) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
const stripEnd = (s: string) => t(s).replace(/[.!?\s]+$/, "");
const sentence = (s: string) => {
  const v = t(s);
  if (!v) return "";
  const c = v.charAt(0).toUpperCase() + v.slice(1);
  return /[.!?]$/.test(c) ? c : `${c}.`;
};

/* ---------- brand voice summary ---------- */
export function voiceSummary(b: Blueprint): string {
  const v = b.voice;
  const parts: string[] = [];
  if (v.traits.length) parts.push(`My brand voice is ${listJoin(v.traits.map((x) => x.toLowerCase()))}.`);
  if (t(v.explain)) parts.push(`This is how I explain what I do, in my own words: "${t(v.explain)}"`);
  const feel = [...v.feel.map((f) => lower(f)), ...(t(v.feelOther) ? [stripEnd(v.feelOther)] : [])];
  if (feel.length) parts.push(`When people read my website, I want them to feel ${listJoin(feel)}.`);
  if (t(v.soundLike)) parts.push(`My writing should sound ${lower(stripEnd(v.soundLike))}.`);
  if (t(v.avoid)) parts.push(`It should avoid ${lower(stripEnd(v.avoid))}.`);
  if (t(v.love)) parts.push(`Words and phrases I like: ${stripEnd(v.love)}.`);
  if (t(v.dislike)) parts.push(`Words and phrases to avoid: ${stripEnd(v.dislike)}.`);
  return parts.join("\n\n");
}

/* ---------- headline ideas (built only from their words) ---------- */
export function headlineIdeas(b: Blueprint): { label: string; text: string }[] {
  const a = b.about;
  const ideas: { label: string; text: string }[] = [];
  if (t(a.what)) ideas.push({ label: "Direct", text: sentence(a.what) });
  if (t(a.name) && t(a.what)) ideas.push({ label: "Personal", text: `Hi, I'm ${t(a.name)}. ${sentence(a.what)}` });
  if (t(a.services) && t(a.who)) ideas.push({ label: "Audience-focused", text: `${sentence(stripEnd(a.services) + " for " + lower(stripEnd(a.who)))}` });
  return ideas;
}

/* ---------- services description ---------- */
export function servicesDescription(b: Blueprint): string {
  const s = b.services;
  const parts: string[] = [];
  if (t(s.what) && t(s.forWho)) parts.push(sentence(`${stripEnd(s.what)} for ${lower(stripEnd(s.forWho))}`));
  else if (t(s.what)) parts.push(sentence(s.what));
  if (t(s.receive)) parts.push(`What you receive: ${lower(stripEnd(s.receive))}.`);
  return parts.join(" ");
}

/* ---------- what's missing (shown, never filled in) ---------- */
export function missingItems(b: Blueprint, images: UploadedImage[]): string[] {
  const m: string[] = [];
  if (!t(b.about.name)) m.push("Your name or business name");
  if (!t(b.about.what)) m.push("What you do");
  if (!t(b.hero.headline)) m.push("A website headline");
  if (!t(b.hero.intro)) m.push("A short introduction");
  if (!b.projects.some((p) => t(p.title))) m.push("At least one portfolio project");
  if (!t(b.services.description) && !t(b.services.what)) m.push("Your services");
  const c = b.contact;
  if (![c.email, c.whatsapp, c.instagram, c.linkedin, c.other].some((x) => t(x))) m.push("At least one contact method");
  if (!images.some((i) => i.role === "hero" || i.role === "photo")) m.push("A hero image or a photo of you");
  if (!b.style.direction) m.push("A visual style");
  return m;
}

/* ---------- AI prompts ---------- */
const directionName = (id: string) => DIRECTIONS.find((d) => d.id === id)?.name ?? "";

function sectionsList(b: Blueprint): string[] {
  const s = ["Hero (headline, short introduction and a main button)", "Portfolio", "Services", "About"];
  if (b.credibility.length) s.push("Credibility (testimonials, credentials or achievements I supply)");
  s.push("Contact");
  return s;
}

export function promptA(b: Blueprint): string {
  const a = b.about;
  const lines = [
    `Create a simple, responsive, one-page portfolio website${t(a.name) ? ` for ${t(a.name)}` : ""}.`,
    "",
    t(a.what) ? `What I do: ${t(a.what)}` : "",
    t(a.who) ? `Who I work with: ${t(a.who)}` : "",
    t(a.location) ? `Location I serve: ${t(a.location)}` : "",
    t(a.action) ? `Website purpose: after viewing the site, visitors should ${lower(stripEnd(a.action))}.` : "",
    b.style.direction ? `Visual style: ${directionName(b.style.direction)}.` : "",
    b.style.primary ? `Colours: primary ${b.style.primary}${b.style.secondary ? `, secondary ${b.style.secondary}` : ""}.` : "",
    b.style.typography && b.style.typography !== "No preference" ? `Typography: ${b.style.typography}.` : "",
    "",
    `Sections, in this order: ${sectionsList(b).join("; ")}.`,
    "",
    "Keep it to a single scrolling page with a simple menu that jumps to each section.",
    "Use placeholder boxes where my photos will go. I will add my own images.",
    "Do not invent any information: no made-up clients, testimonials, results, experience, prices or services. If something is missing, leave a clearly marked placeholder instead.",
  ];
  return lines.filter((l, i, arr) => l !== "" || (arr[i - 1] ?? "") !== "").join("\n").trim();
}

export function promptB(b: Blueprint): string {
  return [
    "I've attached my Website Blueprint (a PDF). Use it to personalise my one-page portfolio website.",
    "",
    "Please:",
    "1. Read the whole Website Blueprint before making changes.",
    "2. Follow the brand voice described in it. Keep my natural way of speaking and my personality.",
    "3. Use the exact website copy supplied in the blueprint. Don't rewrite it unless I ask you to.",
    "4. Place my uploaded photographs in the sections they are assigned to in the blueprint, with their captions where given.",
    `5. Follow the visual direction${b.style.direction ? ` (${directionName(b.style.direction)})` : ""}, colours, typography and inspiration notes in the blueprint, without copying anyone else's website.`,
    "6. Keep the website fully responsive on mobile, tablet and desktop.",
    "7. Make the portfolio easy to explore, with clear project titles and descriptions.",
    "8. Keep it a simple one-page website. Avoid unnecessary complex features.",
    "9. Do not add fictional testimonials, clients, experience, services, achievements or results. If information is missing, leave a clearly marked placeholder.",
    "",
    "When you're done, list anything from the blueprint you could not include so I can review it.",
  ].join("\n");
}

export function promptC(): string {
  return [
    "Please make one change to my website and leave everything else exactly as it is.",
    "",
    "Section to change: [for example, the About section]",
    "What to change: [describe the change, for example, replace the second paragraph with the text below]",
    "New text or details: [paste the exact wording, if any]",
    "",
    "Don't change the layout, colours, fonts, images or wording of any other section. Keep the website responsive and keep my brand voice. Don't add any information I haven't provided.",
  ].join("\n");
}
