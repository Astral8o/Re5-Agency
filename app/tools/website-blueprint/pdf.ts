// Builds "My Website Blueprint" as a PDF in the visitor's browser.
import { jsPDF } from "jspdf";
import {
  type Blueprint,
  type UploadedImage,
  DIRECTIONS,
  ROLE_LABELS,
  promptA,
  promptB,
  promptC,
  t,
} from "./blueprint";
import { toPdfImage, type PdfImage } from "./images";

const INK: [number, number, number] = [13, 20, 16];
const MUTED: [number, number, number] = [58, 74, 65];
const GREEN: [number, number, number] = [0, 119, 80];
const LINE: [number, number, number] = [201, 197, 187];

// The built-in PDF fonts only cover Western European characters. Map the common
// typographic ones and drop anything else (emoji etc.) so text never turns to gibberish.
function clean(s: string): string {
  return (s || "")
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/ /g, " ")
    .replace(/[^\x09\x0A\x0D\x20-\x7E¡-ÿ€]/g, "");
}

export async function buildBlueprintPdf(b: Blueprint, images: UploadedImage[]): Promise<Blob> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 54;
  const CW = W - M * 2;
  const BOTTOM = H - 64;
  let y = M;

  const cache = new Map<string, PdfImage>();
  const pdfImg = async (img: UploadedImage) => {
    if (!cache.has(img.id)) cache.set(img.id, await toPdfImage(img.file));
    return cache.get(img.id)!;
  };

  const newPage = () => {
    doc.addPage();
    y = M;
  };
  const ensure = (h: number) => {
    if (y + h > BOTTOM) newPage();
  };

  const heading = (text: string, num?: string) => {
    ensure(130); // keep a heading with its first few lines
    if (y > M) y += 18;
    if (num) {
      doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(...GREEN);
      doc.text(num, M, y);
      y += 14;
    }
    doc.setFont("helvetica", "bold").setFontSize(20).setTextColor(...INK);
    const lines = doc.splitTextToSize(clean(text), CW);
    doc.text(lines, M, y + 4);
    y += lines.length * 24 + 6;
    doc.setDrawColor(...LINE).setLineWidth(0.6).line(M, y - 8, M + CW, y - 8);
    y += 6;
  };

  const sub = (text: string) => {
    ensure(40);
    y += 6;
    doc.setFont("helvetica", "bold").setFontSize(12.5).setTextColor(...INK);
    const lines = doc.splitTextToSize(clean(text), CW);
    doc.text(lines, M, y);
    y += lines.length * 16 + 2;
  };

  const para = (text: string, opts: { size?: number; color?: [number, number, number]; font?: string; indent?: number } = {}) => {
    const v = clean(t(text));
    if (!v) return;
    const size = opts.size ?? 10.5;
    const lh = size * 1.45;
    const x = M + (opts.indent ?? 0);
    doc.setFont(opts.font ?? "helvetica", "normal").setFontSize(size).setTextColor(...(opts.color ?? INK));
    for (const block of v.split(/\n/)) {
      const lines: string[] = block ? doc.splitTextToSize(block, CW - (opts.indent ?? 0)) : [""];
      for (const line of lines) {
        ensure(lh);
        doc.text(line, x, y);
        y += lh;
      }
    }
    y += 6;
  };

  const field = (label: string, value: string) => {
    if (!t(value)) return;
    ensure(34);
    doc.setFont("helvetica", "bold").setFontSize(8.5).setTextColor(...MUTED);
    doc.text(clean(label).toUpperCase(), M, y);
    y += 13;
    para(value);
  };

  const missing = (label: string) => {
    ensure(20);
    doc.setFont("helvetica", "italic").setFontSize(10).setTextColor(150, 140, 125);
    doc.text(clean(`${label}: not provided yet.`), M, y);
    y += 18;
  };

  const image = async (img: UploadedImage, maxW = CW, maxH = 300) => {
    let p: PdfImage;
    try {
      p = await pdfImg(img);
    } catch {
      para(`(The image "${img.file.name}" couldn't be added.)`, { color: MUTED });
      return;
    }
    const scale = Math.min(maxW / p.w, maxH / p.h, 1.5);
    const w = p.w * scale;
    const h = p.h * scale;
    const capLines = t(img.caption) ? doc.splitTextToSize(clean(img.caption), CW) : [];
    ensure(h + 10 + capLines.length * 13);
    doc.addImage(p.data, "JPEG", M, y, w, h, undefined, "FAST");
    y += h + 8;
    if (capLines.length) {
      doc.setFont("helvetica", "italic").setFontSize(9).setTextColor(...MUTED);
      doc.text(capLines, M, y + 2);
      y += capLines.length * 13;
    }
    y += 10;
  };

  const byRole = (role: UploadedImage["role"]) => images.filter((i) => i.role === role);
  const a = b.about;

  /* 1. Cover */
  y = 170;
  const logo = byRole("logo")[0];
  if (logo) {
    try {
      const p = await pdfImg(logo);
      const s = Math.min(160 / p.w, 110 / p.h);
      doc.addImage(p.data, "JPEG", M, 70, p.w * s, p.h * s, undefined, "FAST");
      y = Math.max(y, 70 + p.h * s + 50);
    } catch {
      /* logo is optional on the cover */
    }
  }
  doc.setFont("helvetica", "bold").setFontSize(40).setTextColor(...INK);
  doc.text("My Website Blueprint", M, y);
  y += 30;
  doc.setFont("helvetica", "normal").setFontSize(15).setTextColor(...GREEN);
  doc.text("Prepared with RE5 Agency", M, y);
  y += 60;
  if (t(a.name)) {
    doc.setFont("helvetica", "bold").setFontSize(22).setTextColor(...INK);
    doc.text(doc.splitTextToSize(clean(a.name), CW), M, y);
    y += 28;
  }
  if (t(a.what)) para(a.what, { size: 13, color: MUTED });
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(...MUTED);
  doc.text(
    clean(`Created ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`),
    M,
    BOTTOM - 20
  );

  /* 2. About */
  newPage();
  heading("About me and my work", "01");
  field("Name or business name", a.name);
  field("What I do", a.what);
  field("Who I usually work with", a.who);
  field("Services or expertise", a.services);
  field("What I enjoy most about my work", a.enjoy);
  field("What makes my approach personal or distinctive", a.distinctive);
  field("Location I serve", a.location);
  const photo = byRole("photo")[0];
  if (photo) await image(photo, 220, 260);

  /* 3. Brand voice */
  heading("Brand voice and communication guidelines", "02");
  if (b.voice.traits.length) field("Personality", b.voice.traits.join(", "));
  if (t(b.voice.summary)) field("Brand voice summary", b.voice.summary);
  else missing("Brand voice summary");
  field("How I explain what I do", b.voice.explain);
  field("Sounds like", b.voice.soundLike);
  field("Avoid", b.voice.avoid);
  field("Words I like", b.voice.love);
  field("Words to avoid", b.voice.dislike);

  /* 4. Goals and audience */
  heading("Website goals and audience", "03");
  field("Who the website is for", a.who);
  field("What visitors should do after viewing the website", a.action);
  const feel = [...b.voice.feel, ...(t(b.voice.feelOther) ? [b.voice.feelOther] : [])];
  if (feel.length) field("How visitors should feel", feel.join(", "));

  /* 5. Sections and copy */
  heading("Website sections and copy", "04");
  para("A one-page website with these sections, in this order. Use the wording below as written.", { color: MUTED });
  sub("Hero");
  if (t(b.hero.headline)) field("Headline", b.hero.headline);
  else missing("Headline");
  field("Introduction", b.hero.intro);
  field("Main button", b.hero.cta);
  for (const img of byRole("hero")) await image(img, CW, 260);
  sub("Services");
  if (t(b.services.description)) field("Services description", b.services.description);
  else if (!t(b.services.what)) missing("Services");
  field("Services offered", b.services.what);
  field("Who they're for", b.services.forWho);
  field("What the client receives", b.services.receive);
  sub("About");
  const ab = b.aboutSection;
  if (![ab.background, ab.interests, ab.approach, ab.experience].some(t)) missing("About section");
  field("Background", ab.background);
  field("Interests", ab.interests);
  field("Professional approach", ab.approach);
  field("Relevant experience", ab.experience);
  if (b.credibility.some((c) => t(c.text))) {
    sub("Credibility");
    for (const c of b.credibility) field(c.type, c.text);
  }
  sub("Contact");
  const c = b.contact;
  field("Email", c.email);
  field("WhatsApp", c.whatsapp);
  field("Instagram", c.instagram);
  field("LinkedIn", c.linkedin);
  field("Other links", c.other);
  field("Contact button", c.cta);
  if (![c.email, c.whatsapp, c.instagram, c.linkedin, c.other].some(t)) missing("Contact details");

  /* 6 + 7. Portfolio */
  heading("Portfolio projects", "05");
  const projects = b.projects.filter((p) => [p.title, p.forWho, p.contribution, p.description, p.outcome].some(t));
  if (!projects.length) missing("Portfolio projects");
  for (const [i, p] of projects.entries()) {
    sub(`Project ${i + 1}${t(p.title) ? `: ${p.title}` : ""}`);
    field("Who or what it was for", p.forWho);
    field("What I contributed", p.contribution);
    field("Description", p.description);
    field("Outcome", p.outcome);
    for (const img of images.filter((im) => im.role === "portfolio" && im.projectId === p.id)) await image(img, CW, 280);
  }
  const loose = images.filter((im) => im.role === "portfolio" && !projects.some((p) => p.id === im.projectId));
  if (loose.length) {
    sub("Other portfolio images");
    for (const img of loose) await image(img, CW, 280);
  }

  /* 8. Design */
  heading("Design preferences", "06");
  const dir = DIRECTIONS.find((d) => d.id === b.style.direction);
  if (dir) field("Visual direction", `${dir.name}: ${dir.body}`);
  else missing("Visual direction");
  if (b.style.primary || b.style.secondary) {
    ensure(50);
    doc.setFont("helvetica", "bold").setFontSize(8.5).setTextColor(...MUTED);
    doc.text("COLOURS", M, y);
    y += 10;
    let x = M;
    for (const [label, hex] of [["Primary", b.style.primary], ["Secondary", b.style.secondary]] as const) {
      if (!/^#[0-9a-f]{6}$/i.test(hex)) continue;
      doc.setFillColor(hex).roundedRect(x, y, 28, 28, 4, 4, "F");
      doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(...INK);
      doc.text(`${label} ${hex.toUpperCase()}`, x + 36, y + 18);
      x += 170;
    }
    y += 44;
  }
  field("Typography", b.style.typography);
  for (const img of byRole("background")) await image(img, CW, 200);

  /* 9. Inspiration */
  const insp = byRole("inspiration");
  const urls = b.style.inspirations.filter((i) => t(i.url));
  if (insp.length || urls.length || t(b.style.likes)) {
    heading("Inspiration", "07");
    para("Use these for ideas about layout, photos and headings. Don't copy another website's content or design.", { color: MUTED });
    field("What I like about these references", b.style.likes);
    for (const u of urls) field(u.url, u.note || "No notes added.");
    for (const img of insp) await image(img, CW, 300);
  }

  /* 10-11. Prompts */
  heading("Prompt A: Generate my website", "08");
  para("Paste this into your AI website builder to create the first version.", { color: MUTED });
  para(promptA(b), { font: "courier", size: 9.5 });
  heading("Prompt B: Personalise my website using my blueprint", "09");
  para("Use this when the builder lets you attach files or add more instructions. Attach this PDF with it.", { color: MUTED });
  para(promptB(b), { font: "courier", size: 9.5 });
  heading("Prompt C: Improve my existing website", "10");
  para("Use this to change one part of your website without changing the rest. Fill in the brackets.", { color: MUTED });
  para(promptC(), { font: "courier", size: 9.5 });

  /* 12. Next steps */
  heading("Next steps", "11");
  [
    "1. Choose an AI website builder, such as Wix, Claude or Lovable.",
    "2. Start a new website project.",
    "3. Use Prompt A to generate the first design.",
    "4. Upload this Website Blueprint if the platform supports attachments.",
    "5. Upload your original photographs separately if needed.",
    "6. Use Prompt B to personalise the website.",
    "7. Review the wording, the mobile layout and every link before publishing.",
  ].forEach((s) => para(s));
  para(
    "Free publishing and file uploads vary by platform and plan. AI builders may not follow every instruction perfectly, so review the result carefully.",
    { color: MUTED }
  );

  /* footer on every page */
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(...MUTED);
    doc.text("Created with the RE5 Free Website Blueprint Planner.", M, H - 30);
    doc.text(`${i} / ${pages}`, W - M, H - 30, { align: "right" });
  }

  return doc.output("blob");
}

export const ROLE_FILE_PREFIX = ROLE_LABELS;
