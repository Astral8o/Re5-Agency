"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  type Blueprint,
  type ImageRole,
  type UploadedImage,
  CREDIBILITY_TYPES,
  CTA_OPTIONS,
  DIRECTIONS,
  EMPTY,
  FEELINGS,
  ROLE_LABELS,
  TRAITS,
  TYPOGRAPHY,
  emptyProject,
  headlineIdeas,
  missingItems,
  promptA,
  promptB,
  promptC,
  servicesDescription,
  t,
  uid,
  voiceSummary,
} from "./blueprint";
import { ACCEPTED, MAX_FILE_MB, MAX_IMAGES, checkFile } from "./images";

const PAGES = [
  "welcome",
  "about",
  "voice",
  "hero",
  "portfolio",
  "services",
  "aboutme",
  "credibility",
  "contact",
  "uploads",
  "style",
  "review",
  "prompts",
  "get",
  "done",
] as const;
type Page = (typeof PAGES)[number];

const GROUPS: { label: string; pages: Page[] }[] = [
  { label: "About you", pages: ["about"] },
  { label: "Brand voice", pages: ["voice"] },
  { label: "Website sections", pages: ["hero", "portfolio", "services", "aboutme", "credibility", "contact"] },
  { label: "Photos & logo", pages: ["uploads"] },
  { label: "Visual style", pages: ["style"] },
  { label: "Review", pages: ["review", "prompts", "get"] },
];

const SECTION_NAMES: Partial<Record<Page, string>> = {
  hero: "Hero",
  portfolio: "Portfolio",
  services: "Services",
  aboutme: "About",
  credibility: "Credibility",
  contact: "Contact",
};

/* ---------------------------------------------------------------- */
/* Small building blocks                                              */
/* ---------------------------------------------------------------- */

function Field({
  label,
  hint,
  example,
  value,
  onChange,
  multiline,
  optional,
  placeholder,
  type = "text",
  rows = 3,
}: {
  label: string;
  hint?: string;
  example?: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  optional?: boolean;
  placeholder?: string;
  type?: string;
  rows?: number;
}) {
  const id = useMemo(() => `f-${uid()}`, []);
  return (
    <div className="bp-field">
      <label htmlFor={id}>
        {label}
        {optional && <span className="bp-opt"> (optional)</span>}
      </label>
      {hint && <p className="bp-hint">{hint}</p>}
      {multiline ? (
        <textarea id={id} rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input id={id} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
      {example && (
        <p className="bp-example">
          <span>Example:</span> {example}
        </p>
      )}
    </div>
  );
}

function Chips({
  options,
  selected,
  onToggle,
  max,
  label,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  max?: number;
  label: string;
}) {
  return (
    <div className="bp-chips" role="group" aria-label={label}>
      {options.map((o) => {
        const on = selected.includes(o);
        const blocked = !on && max !== undefined && selected.length >= max;
        return (
          <button
            key={o}
            type="button"
            className={`bp-chip ${on ? "is-on" : ""}`}
            aria-pressed={on}
            disabled={blocked}
            onClick={() => onToggle(o)}
          >
            {on ? "✓ " : ""}
            {o}
          </button>
        );
      })}
    </div>
  );
}

function Why({ children }: { children: ReactNode }) {
  return (
    <div className="bp-why">
      <strong>Why this matters</strong>
      <p>{children}</p>
    </div>
  );
}

function CopyButton({ text, label = "Copy prompt" }: { text: string; label?: string }) {
  const [state, setState] = useState<"idle" | "done" | "fail">("idle");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("done");
    } catch {
      // Clipboard can be blocked inside embeds: fall back to a hidden textarea.
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        ta.remove();
        setState(ok ? "done" : "fail");
      } catch {
        setState("fail");
      }
    }
    setTimeout(() => setState("idle"), 2500);
  };
  return (
    <button type="button" className="bp-btn bp-btn--small" onClick={copy}>
      {state === "done" ? "✓ Copied" : state === "fail" ? "Select and copy it manually" : label}
    </button>
  );
}

/* ---------------------------------------------------------------- */
/* Planner                                                            */
/* ---------------------------------------------------------------- */

export default function Planner({ embed = false }: { embed?: boolean }) {
  const [page, setPage] = useState<Page>("welcome");
  const [b, setB] = useState<Blueprint>(EMPTY);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploadErr, setUploadErr] = useState<string[]>([]);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const openedAt = useRef(Date.now());

  // Sign-up + download state
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const honeypot = useRef<HTMLInputElement | null>(null);
  const [formErr, setFormErr] = useState("");
  const [busy, setBusy] = useState<"" | "saving" | "building">("");
  const [signedUp, setSignedUp] = useState(false);
  const [pdf, setPdf] = useState<Blob | null>(null);
  const [zipBusy, setZipBusy] = useState(false);
  const [zipErr, setZipErr] = useState("");

  const idx = PAGES.indexOf(page);
  const dirty = useMemo(() => JSON.stringify(b) !== JSON.stringify(EMPTY) || images.length > 0, [b, images.length]);

  /* ---- updaters ---- */
  type ObjKeys = "about" | "voice" | "hero" | "services" | "aboutSection" | "contact" | "style";
  const up = useCallback(<K extends ObjKeys>(k: K, v: Partial<Blueprint[K]>) => {
    setB((p) => ({ ...p, [k]: { ...p[k], ...v } }));
  }, []);
  const toggleIn = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  /* ---- navigation ---- */
  const go = (p: Page) => {
    setPage(p);
    requestAnimationFrame(() => {
      if (embed) window.scrollTo({ top: 0 });
      else rootRef.current?.scrollIntoView({ block: "start" });
      headingRef.current?.focus({ preventScroll: true });
    });
  };
  const next = () => go(PAGES[Math.min(idx + 1, PAGES.length - 1)]);
  const back = () => go(PAGES[Math.max(idx - 1, 0)]);

  /* ---- warn before leaving with unsaved work ---- */
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (dirty && page !== "done") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty, page]);

  /* ---- tell a parent page our height when embedded in an iframe ---- */
  useEffect(() => {
    if (!embed || window.parent === window) return;
    const send = () =>
      window.parent.postMessage({ type: "re5-blueprint-height", height: document.documentElement.scrollHeight }, "*");
    const ro = new ResizeObserver(send);
    ro.observe(document.body);
    send();
    return () => ro.disconnect();
  }, [embed]);

  /* ---- free object URLs when leaving the page ---- */
  const imagesRef = useRef(images);
  imagesRef.current = images;
  useEffect(() => () => imagesRef.current.forEach((i) => URL.revokeObjectURL(i.url)), []);

  /* ---- images ---- */
  const addFiles = (files: FileList | null, role: ImageRole, projectId?: string, single = false) => {
    if (!files || !files.length) return;
    const errs: string[] = [];
    const added: UploadedImage[] = [];
    const room = MAX_IMAGES - images.length + (single ? images.filter((i) => i.role === role).length : 0);
    for (const f of Array.from(files)) {
      const e = checkFile(f);
      if (e) errs.push(e);
      else if (added.length >= room) errs.push(`You can add up to ${MAX_IMAGES} images in total.`);
      else added.push({ id: uid(), file: f, url: URL.createObjectURL(f), role, projectId, caption: "" });
      if (single && added.length) break;
    }
    setUploadErr(errs.filter((v, i, a) => a.indexOf(v) === i));
    if (!added.length) return;
    setImages((prev) => {
      if (single) {
        prev.filter((i) => i.role === role).forEach((i) => URL.revokeObjectURL(i.url));
        return [...prev.filter((i) => i.role !== role), ...added];
      }
      return [...prev, ...added];
    });
  };
  const updateImage = (id: string, v: Partial<UploadedImage>) =>
    setImages((prev) => prev.map((i) => (i.id === id ? { ...i, ...v } : i)));
  const replaceImage = (id: string, files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    const e = checkFile(f);
    if (e) return setUploadErr([e]);
    setUploadErr([]);
    setImages((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        URL.revokeObjectURL(i.url);
        return { ...i, file: f, url: URL.createObjectURL(f) };
      })
    );
  };
  const removeImage = (id: string) =>
    setImages((prev) => {
      const gone = prev.find((i) => i.id === id);
      if (gone) URL.revokeObjectURL(gone.url);
      return prev.filter((i) => i.id !== id);
    });
  const moveImage = (id: string, dir: -1 | 1) =>
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (!img) return prev;
      const group = prev.filter((i) => i.role === img.role && i.projectId === img.projectId);
      const gi = group.indexOf(img);
      const swap = group[gi + dir];
      if (!swap) return prev;
      const a = prev.indexOf(img);
      const c = prev.indexOf(swap);
      const out = [...prev];
      [out[a], out[c]] = [out[c], out[a]];
      return out;
    });

  /* ---- sign-up, PDF and downloads ---- */
  const fileName = () => {
    const n = t(b.about.name)
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    return `My-Website-Blueprint${n ? `-${n}` : ""}.pdf`;
  };
  const download = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const buildAndDownload = async () => {
    setBusy("building");
    setFormErr("");
    try {
      const { buildBlueprintPdf } = await import("./pdf");
      const blob = await buildBlueprintPdf(b, images);
      setPdf(blob);
      download(blob, fileName());
      go("done");
    } catch (err) {
      console.error(err);
      setFormErr(
        "We couldn't create your PDF. Try again, or remove very large images and try once more. If it keeps failing, open the planner in a full browser tab."
      );
    } finally {
      setBusy("");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setFormErr("");
    if (!t(firstName)) return setFormErr("Please enter your first name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t(email))) return setFormErr("Please enter a valid email address.");
    if (!signedUp) {
      setBusy("saving");
      try {
        const res = await fetch("/api/blueprint-signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: t(firstName),
            email: t(email),
            marketingConsent: consent,
            website: honeypot.current?.value ?? "",
            elapsed: Date.now() - openedAt.current,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "failed");
        }
        setSignedUp(true);
      } catch (err) {
        setBusy("");
        const msg = err instanceof Error && err.message !== "failed" ? err.message : "";
        return setFormErr(msg || "We couldn't save your details just now. Please check your connection and try again.");
      }
    }
    await buildAndDownload();
  };

  const downloadZip = async () => {
    if (!pdf) return;
    setZipBusy(true);
    setZipErr("");
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      zip.file(fileName(), pdf);
      const folder = zip.folder("my-images")!;
      const counts: Record<string, number> = {};
      for (const img of images) {
        const ext = img.file.name.split(".").pop()?.toLowerCase() || "jpg";
        const base =
          img.role === "portfolio"
            ? `portfolio-project-${Math.max(1, b.projects.findIndex((p) => p.id === img.projectId) + 1)}`
            : img.role;
        counts[base] = (counts[base] ?? 0) + 1;
        folder.file(`${base}-${counts[base]}.${ext}`, img.file);
      }
      download(await zip.generateAsync({ type: "blob" }), fileName().replace(/\.pdf$/, ".zip"));
    } catch (err) {
      console.error(err);
      setZipErr("We couldn't create the ZIP file. Your PDF download above still works.");
    } finally {
      setZipBusy(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /* Rendering helpers                                                  */
  /* ---------------------------------------------------------------- */

  const imageCard = (img: UploadedImage) => {
    const group = images.filter((i) => i.role === img.role && i.projectId === img.projectId);
    const gi = group.indexOf(img);
    return (
      <div className="bp-img" key={img.id}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img.url} alt={img.caption || img.file.name} />
        <div className="bp-img-body">
          <span className="bp-img-name">{img.file.name}</span>
          <label className="bp-mini">
            Where should this appear?
            <select value={img.role} onChange={(e) => updateImage(img.id, { role: e.target.value as ImageRole })}>
              {(Object.keys(ROLE_LABELS) as ImageRole[]).map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </label>
          {img.role === "portfolio" && (
            <label className="bp-mini">
              Which project?
              <select value={img.projectId ?? ""} onChange={(e) => updateImage(img.id, { projectId: e.target.value || undefined })}>
                <option value="">Not assigned yet</option>
                {b.projects.map((p, i) => (
                  <option key={p.id} value={p.id}>
                    Project {i + 1}
                    {t(p.title) ? `: ${t(p.title)}` : ""}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="bp-mini">
            Caption (optional)
            <input value={img.caption} onChange={(e) => updateImage(img.id, { caption: e.target.value })} />
          </label>
          <div className="bp-img-actions">
            <label className="bp-btn bp-btn--small bp-btn--ghost">
              Replace
              <input type="file" accept={ACCEPTED.join(",")} hidden onChange={(e) => replaceImage(img.id, e.target.files)} />
            </label>
            <button type="button" className="bp-btn bp-btn--small bp-btn--ghost" onClick={() => removeImage(img.id)}>
              Remove
            </button>
            {group.length > 1 && (
              <>
                <button type="button" className="bp-btn bp-btn--small bp-btn--ghost" disabled={gi === 0} onClick={() => moveImage(img.id, -1)} aria-label="Move earlier">
                  ↑
                </button>
                <button type="button" className="bp-btn bp-btn--small bp-btn--ghost" disabled={gi === group.length - 1} onClick={() => moveImage(img.id, 1)} aria-label="Move later">
                  ↓
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const uploadZone = ({
    role,
    title,
    hint,
    single,
    projectId,
  }: {
    role: ImageRole;
    title: string;
    hint: string;
    single?: boolean;
    projectId?: string;
  }) => {
    const list = images.filter((i) => i.role === role && (projectId === undefined || i.projectId === projectId));
    return (
      <div className="bp-zone" key={`${role}-${projectId ?? ""}`}>
        <div className="bp-zone-head">
          <div>
            <h3>{title}</h3>
            <p className="bp-hint">{hint}</p>
          </div>
          <label className="bp-btn bp-btn--small">
            {single && list.length ? "Replace" : "Add image" + (single ? "" : "s")}
            <input
              type="file"
              accept={ACCEPTED.join(",")}
              multiple={!single}
              hidden
              onChange={(e) => {
                addFiles(e.target.files, role, projectId, single);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        {list.length > 0 && (
          <div className="bp-imgs">
            {list.map((img) => imageCard(img))}
          </div>
        )}
      </div>
    );
  };

  const nav = ({ nextLabel = "Next", canSkip }: { nextLabel?: string; canSkip?: boolean } = {}) => (
    <div className="bp-nav">
      <button type="button" className="bp-btn bp-btn--ghost" onClick={back}>
        ← Back
      </button>
      <div className="bp-nav-right">
        {canSkip && (
          <button type="button" className="bp-link" onClick={next}>
            Skip this step
          </button>
        )}
        <button type="button" className="bp-btn" onClick={next}>
          {nextLabel} →
        </button>
      </div>
    </div>
  );

  const groupIdx = GROUPS.findIndex((g) => g.pages.includes(page));
  const showProgress = groupIdx >= 0;
  const missing = missingItems(b, images);
  const ideas = headlineIdeas(b);
  const a = b.about;

  const heading = (children: ReactNode, eyebrow?: string) => (
    <>
      {eyebrow && <span className="bp-eyebrow">{eyebrow}</span>}
      <h2 ref={headingRef} tabIndex={-1} className="bp-h2">
        {children}
      </h2>
    </>
  );

  /* ---------------------------------------------------------------- */
  return (
    <div className={`bp ${embed ? "bp--embed" : ""}`} ref={rootRef}>
      {embed && (
        <div className="bp-embedbar">
          <span>RE5 Free Website Blueprint Planner</span>
          <a href="/tools/website-blueprint" target="_blank" rel="noopener">
            Open in a full tab ↗
          </a>
        </div>
      )}

      {showProgress && (
        <div className="bp-progress" aria-label="Progress">
          <ol>
            {GROUPS.map((g, i) => (
              <li key={g.label} className={i < groupIdx ? "is-done" : i === groupIdx ? "is-now" : ""} aria-current={i === groupIdx ? "step" : undefined}>
                <span className="bp-progress-n">{i < groupIdx ? "✓" : i + 1}</span>
                <span className="bp-progress-l">{g.label}</span>
              </li>
            ))}
          </ol>
          <div className="bp-progress-bar">
            <span style={{ width: `${((idx - 1) / (PAGES.length - 3)) * 100}%` }} />
          </div>
        </div>
      )}

      <div className="bp-card">
        {/* ---------------- Welcome ---------------- */}
        {page === "welcome" && (
          <div className="bp-welcome">
            <span className="bp-eyebrow">RE5 Free Website Blueprint Planner</span>
            <h1 ref={headingRef} tabIndex={-1} className="bp-h1">
              Your Website Starts Here.
            </h1>
            <p className="bp-lead">
              Want to create your own website with AI? Let&rsquo;s get everything ready first. We&rsquo;ll help you find
              your brand voice, write your website content, organize your photos, and prepare instructions for your AI
              website builder.
            </p>
            <button type="button" className="bp-btn bp-btn--big" onClick={next}>
              Start My Free Website Blueprint →
            </button>
            <ol className="bp-how">
              <li>
                <strong>Answer simple questions</strong> about you, your work and who you help. Skip anything that
                doesn&rsquo;t apply.
              </li>
              <li>
                <strong>Find your brand voice</strong> and plan each section of a one-page portfolio website.
              </li>
              <li>
                <strong>Add your photos and logo</strong>, and choose the look you want.
              </li>
              <li>
                <strong>Download your Website Blueprint</strong>: a PDF with your content, images and ready-to-use AI
                prompts.
              </li>
            </ol>
            <ul className="bp-facts">
              <li>✓ No coding experience required</li>
              <li>✓ Free to use, no payment and no account</li>
              <li>✓ Your answers and photos stay in your browser</li>
            </ul>
            <p className="bp-note">
              Takes about 20 to 30 minutes. AI website platforms have their own publishing and subscription rules, and
              some features may need a paid plan.
            </p>
          </div>
        )}

        {/* ---------------- Step 1 ---------------- */}
        {page === "about" && (
          <>
            {heading(<>Tell us about yourself.</>, "Step 1 of 6")}
            <p className="bp-lead">Explain your work the way you&rsquo;d explain it to a friend. Plain words are perfect.</p>
            <Why>Your answers become the raw material for your website. We only use what you write, so nothing about you is made up.</Why>
            <Field label="1. What is your name or business name?" value={a.name} onChange={(v) => up("about", { name: v })} example="Maya Ramdial Photography" />
            <Field label="2. What do you do?" hint="Start with: I help… / I create… / I design…" value={a.what} onChange={(v) => up("about", { what: v })} multiline example="I photograph weddings and family celebrations across Trinidad." />
            <Field label="3. Who do you usually work with?" value={a.who} onChange={(v) => up("about", { who: v })} multiline example="Couples planning relaxed, outdoor weddings, and families celebrating milestones." />
            <Field label="4. What services or expertise do you offer?" value={a.services} onChange={(v) => up("about", { services: v })} multiline example="Wedding photography, engagement shoots and family portraits." />
            <Field label="5. What do you enjoy most about your work?" optional hint="Start with: My favourite part is…" value={a.enjoy} onChange={(v) => up("about", { enjoy: v })} multiline />
            <Field label="6. What makes your approach personal or distinctive?" optional hint="Start with: Unlike…, I… / People tell me I…" value={a.distinctive} onChange={(v) => up("about", { distinctive: v })} multiline />
            <Field label="7. What would you like visitors to do after viewing your website?" value={a.action} onChange={(v) => up("about", { action: v })} example="Send me a WhatsApp message to check my availability." />
            <Field label="8. What location do you serve?" optional value={a.location} onChange={(v) => up("about", { location: v })} example="Trinidad and Tobago, and destination weddings across the Caribbean." />
            {nav()}
          </>
        )}

        {/* ---------------- Step 2 ---------------- */}
        {page === "voice" && (
          <>
            {heading(<>Find your brand voice.</>, "Step 2 of 6")}
            <p className="bp-lead">
              Your brand voice is how your personality comes through in your words. Your website should sound like you,
              not like a template.
            </p>
            <div className="bp-field">
              <span className="bp-label">Choose up to three words that describe your personality at work.</span>
              <Chips label="Personality traits" options={TRAITS} selected={b.voice.traits} max={3} onToggle={(v) => up("voice", { traits: toggleIn(b.voice.traits, v) })} />
              <p className="bp-hint">{b.voice.traits.length}/3 selected</p>
            </div>
            <Field label="A. How would you explain what you do to someone you just met?" hint="Write it the way you'd say it out loud. Don't polish it." value={b.voice.explain} onChange={(v) => up("voice", { explain: v })} multiline rows={5} />
            <div className="bp-field">
              <span className="bp-label">B. How do you want people to feel when they read your website?</span>
              <Chips label="Feelings" options={FEELINGS} selected={b.voice.feel} onToggle={(v) => up("voice", { feel: toggleIn(b.voice.feel, v) })} />
            </div>
            <Field label="Anything else about how they should feel?" optional value={b.voice.feelOther} onChange={(v) => up("voice", { feelOther: v })} />
            <Field label="C. What should your writing sound like?" value={b.voice.soundLike} onChange={(v) => up("voice", { soundLike: v })} example="Friendly but not overly casual." />
            <Field label="What should it avoid?" optional value={b.voice.avoid} onChange={(v) => up("voice", { avoid: v })} example="Jargon, exclamation marks and sounding salesy." />
            <Field label="D. Words or phrases you love" optional value={b.voice.love} onChange={(v) => up("voice", { love: v })} example="Real moments, relaxed, honest" />
            <Field label="Words or phrases you dislike" optional value={b.voice.dislike} onChange={(v) => up("voice", { dislike: v })} example="Stunning, world-class, passionate" />

            <div className="bp-summary">
              <div className="bp-summary-head">
                <h3>Your brand voice summary</h3>
                <button type="button" className="bp-btn bp-btn--small" onClick={() => up("voice", { summary: voiceSummary(b), approved: false })}>
                  {t(b.voice.summary) ? "Rebuild from my answers" : "Create my summary"}
                </button>
              </div>
              <p className="bp-hint">Built only from your answers above. Edit it until it sounds right, then approve it.</p>
              <textarea
                aria-label="Brand voice summary"
                rows={7}
                value={b.voice.summary}
                onChange={(e) => up("voice", { summary: e.target.value, approved: false })}
                placeholder="Press “Create my summary” once you've answered a few questions."
              />
              <label className="bp-check">
                <input type="checkbox" checked={b.voice.approved} disabled={!t(b.voice.summary)} onChange={(e) => up("voice", { approved: e.target.checked })} />
                This sounds like me
              </label>
            </div>
            {nav()}
          </>
        )}

        {/* ---------------- Step 3: sections ---------------- */}
        {SECTION_NAMES[page] && (
          <div className="bp-sectionmap" aria-label="Your one-page website">
            {(["hero", "portfolio", "services", "aboutme", "credibility", "contact"] as Page[]).map((p) => (
              <button key={p} type="button" className={p === page ? "is-now" : ""} onClick={() => go(p)}>
                {SECTION_NAMES[p]}
              </button>
            ))}
          </div>
        )}

        {page === "hero" && (
          <>
            {heading(<>The hero section</>, "Step 3 of 6 · Website sections")}
            <p className="bp-lead">This is the first big section people see. In a few seconds it should tell them what you do and what to do next.</p>
            {ideas.length > 0 && (
              <div className="bp-ideas">
                <span className="bp-label">Headline ideas from your answers</span>
                {ideas.map((i) => (
                  <div key={i.label} className="bp-idea">
                    <span className="bp-idea-tag">{i.label}</span>
                    <p>{i.text}</p>
                    <button type="button" className="bp-btn bp-btn--small bp-btn--ghost" onClick={() => up("hero", { headline: i.text })}>
                      Use this
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="bp-tips">
              <p><strong>Direct:</strong> say exactly what you do. &ldquo;Wedding photography in Trinidad.&rdquo;</p>
              <p><strong>Personal:</strong> lead with you. &ldquo;Hi, I&rsquo;m Maya. I photograph real moments.&rdquo;</p>
              <p><strong>Audience-focused:</strong> lead with who you help. &ldquo;Photos for couples who want a relaxed wedding.&rdquo;</p>
            </div>
            <Field label="Your headline" value={b.hero.headline} onChange={(v) => up("hero", { headline: v })} />
            <Field label="A short introduction" hint="One or two sentences under the headline." value={b.hero.intro} onChange={(v) => up("hero", { intro: v })} multiline />
            <div className="bp-field">
              <span className="bp-label">Main button</span>
              <Chips label="Main button" options={CTA_OPTIONS} selected={[b.hero.cta]} onToggle={(v) => up("hero", { cta: b.hero.cta === v ? "" : v })} />
            </div>
            {nav()}
          </>
        )}

        {page === "portfolio" && (
          <>
            {heading(<>Your portfolio</>, "Step 3 of 6 · Website sections")}
            <p className="bp-lead">Show your real work. Add up to five projects. One or two strong projects is plenty to start.</p>
            <Why>Only describe what actually happened. If you don&rsquo;t know the outcome, leave it blank. You&rsquo;ll add photos in step 4.</Why>
            {b.projects.map((p, i) => {
              const setP = (v: Partial<typeof p>) => setB((prev) => ({ ...prev, projects: prev.projects.map((x) => (x.id === p.id ? { ...x, ...v } : x)) }));
              return (
                <fieldset key={p.id} className="bp-project">
                  <legend>Project {i + 1}</legend>
                  <Field label="Project title" value={p.title} onChange={(v) => setP({ title: v })} example="Sunrise wedding at Maracas Bay" />
                  <Field label="Who or what was it for?" value={p.forWho} onChange={(v) => setP({ forWho: v })} />
                  <Field label="What did you personally contribute?" value={p.contribution} onChange={(v) => setP({ contribution: v })} multiline />
                  <Field label="Brief description" value={p.description} onChange={(v) => setP({ description: v })} multiline />
                  <Field label="Actual outcome, where known" optional value={p.outcome} onChange={(v) => setP({ outcome: v })} multiline />
                  {b.projects.length > 1 && (
                    <button
                      type="button"
                      className="bp-link"
                      onClick={() => {
                        setB((prev) => ({ ...prev, projects: prev.projects.filter((x) => x.id !== p.id) }));
                        setImages((prev) => prev.map((im) => (im.projectId === p.id ? { ...im, projectId: undefined } : im)));
                      }}
                    >
                      Remove this project
                    </button>
                  )}
                </fieldset>
              );
            })}
            {b.projects.length < 5 && (
              <button type="button" className="bp-btn bp-btn--ghost" onClick={() => setB((prev) => ({ ...prev, projects: [...prev.projects, emptyProject()] }))}>
                + Add another project
              </button>
            )}
            {nav()}
          </>
        )}

        {page === "services" && (
          <>
            {heading(<>Your services</>, "Step 3 of 6 · Website sections")}
            <p className="bp-lead">Tell visitors what you offer, who it&rsquo;s for and what they get.</p>
            <Field label="What services do you offer?" value={b.services.what} onChange={(v) => up("services", { what: v })} multiline example="Full-day wedding coverage and engagement shoots" />
            <Field label="Who are they for?" value={b.services.forWho} onChange={(v) => up("services", { forWho: v })} example="Couples getting married in Trinidad and Tobago" />
            <Field label="What does the client receive?" value={b.services.receive} onChange={(v) => up("services", { receive: v })} multiline example="An online gallery of edited photos within four weeks" />
            <div className="bp-summary">
              <div className="bp-summary-head">
                <h3>Services description</h3>
                <button type="button" className="bp-btn bp-btn--small" onClick={() => up("services", { description: servicesDescription(b) })}>
                  Write it from my answers
                </button>
              </div>
              <p className="bp-hint">Uses only what you wrote above. Edit freely.</p>
              <textarea aria-label="Services description" rows={4} value={b.services.description} onChange={(e) => up("services", { description: e.target.value })} />
            </div>
            {nav()}
          </>
        )}

        {page === "aboutme" && (
          <>
            {heading(<>Your About section</>, "Step 3 of 6 · Website sections")}
            <p className="bp-lead">Introduce yourself the way you would in person. Short and honest beats long and polished.</p>
            <Field label="Your background" hint="Start with: I started… / I grew up…" value={b.aboutSection.background} onChange={(v) => up("aboutSection", { background: v })} multiline />
            <Field label="Your interests" optional hint="Start with: Outside of work, I…" value={b.aboutSection.interests} onChange={(v) => up("aboutSection", { interests: v })} multiline />
            <Field label="Your professional approach" hint="Start with: When I work with someone, I…" value={b.aboutSection.approach} onChange={(v) => up("aboutSection", { approach: v })} multiline />
            <Field label="Relevant experience" optional hint="Only real experience. Years, training or projects you've done." value={b.aboutSection.experience} onChange={(v) => up("aboutSection", { experience: v })} multiline />
            {nav()}
          </>
        )}

        {page === "credibility" && (
          <>
            {heading(<>Credibility (optional)</>, "Step 3 of 6 · Website sections")}
            <p className="bp-lead">Add real testimonials, credentials, achievements or experience. If you&rsquo;re just starting out, it&rsquo;s fine to skip this.</p>
            <Why>Never include anything that isn&rsquo;t true. A short, real testimonial is worth far more than an impressive made-up one.</Why>
            {b.credibility.map((c) => (
              <fieldset key={c.id} className="bp-project">
                <label className="bp-mini">
                  Type
                  <select value={c.type} onChange={(e) => setB((p) => ({ ...p, credibility: p.credibility.map((x) => (x.id === c.id ? { ...x, type: e.target.value } : x)) }))}>
                    {CREDIBILITY_TYPES.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </label>
                <Field
                  label="Details"
                  hint={c.type === "Testimonial" ? "Paste their exact words and who said them (with their permission)." : undefined}
                  value={c.text}
                  onChange={(v) => setB((p) => ({ ...p, credibility: p.credibility.map((x) => (x.id === c.id ? { ...x, text: v } : x)) }))}
                  multiline
                />
                <button type="button" className="bp-link" onClick={() => setB((p) => ({ ...p, credibility: p.credibility.filter((x) => x.id !== c.id) }))}>
                  Remove
                </button>
              </fieldset>
            ))}
            <button type="button" className="bp-btn bp-btn--ghost" onClick={() => setB((p) => ({ ...p, credibility: [...p.credibility, { id: uid(), type: CREDIBILITY_TYPES[0], text: "" }] }))}>
              + Add an item
            </button>
            {nav({ canSkip: true })}
          </>
        )}

        {page === "contact" && (
          <>
            {heading(<>Your contact section</>, "Step 3 of 6 · Website sections")}
            <p className="bp-lead">Only add the contact details you&rsquo;re happy to show publicly.</p>
            <Field label="Email" optional type="email" value={b.contact.email} onChange={(v) => up("contact", { email: v })} />
            <Field label="WhatsApp" optional type="tel" value={b.contact.whatsapp} onChange={(v) => up("contact", { whatsapp: v })} placeholder="+1 868" />
            <Field label="Instagram" optional value={b.contact.instagram} onChange={(v) => up("contact", { instagram: v })} placeholder="@yourname" />
            <Field label="LinkedIn" optional value={b.contact.linkedin} onChange={(v) => up("contact", { linkedin: v })} />
            <Field label="Other website or social links" optional value={b.contact.other} onChange={(v) => up("contact", { other: v })} multiline rows={2} />
            <div className="bp-field">
              <span className="bp-label">Contact button</span>
              <Chips label="Contact button" options={CTA_OPTIONS} selected={[b.contact.cta]} onToggle={(v) => up("contact", { cta: b.contact.cta === v ? "" : v })} />
            </div>
            <div className="bp-wire" aria-label="How your one-page website fits together">
              <span className="bp-label">How your one-page website fits together</span>
              {[
                ["Hero", t(b.hero.headline) || "Headline + introduction + button"],
                ["Portfolio", `${b.projects.filter((p) => t(p.title)).length} project(s)`],
                ["Services", t(b.services.description) ? "Ready" : "What you offer"],
                ["About", t(b.aboutSection.background) || t(b.aboutSection.approach) ? "Ready" : "Your story"],
                ...(b.credibility.length ? [["Credibility", `${b.credibility.length} item(s)`]] : []),
                ["Contact", [b.contact.email, b.contact.whatsapp, b.contact.instagram, b.contact.linkedin].filter(t).length + " method(s)"],
              ].map(([n, d]) => (
                <div key={n} className="bp-wire-row">
                  <strong>{n}</strong>
                  <span>{d}</span>
                </div>
              ))}
            </div>
            {nav()}
          </>
        )}

        {/* ---------------- Step 4 ---------------- */}
        {page === "uploads" && (
          <>
            {heading(<>Upload your photos and logo.</>, "Step 4 of 6")}
            <p className="bp-lead">
              Add your own images and tell us where each one belongs. They&rsquo;ll be placed in your Website Blueprint
              PDF. Nothing is uploaded to a server.
            </p>
            <p className="bp-hint">
              JPG, PNG or WebP, up to {MAX_FILE_MB} MB each and {MAX_IMAGES} images in total. Use only photos you own or
              have permission to use.
            </p>
            {uploadErr.length > 0 && (
              <div className="bp-error" role="alert">
                {uploadErr.map((e) => (
                  <p key={e}>{e}</p>
                ))}
              </div>
            )}
            {uploadZone({ role: "logo", title: "Your logo", hint: "Optional. A PNG with a transparent background works best.", single: true })}
            {uploadZone({ role: "photo", title: "A photo of you", hint: "A friendly, professional photo for your About section.", single: true })}
            {uploadZone({ role: "hero", title: "Your main hero image", hint: "The big image at the top of your website.", single: true })}
            <div className="bp-zone">
              <h3>Portfolio images</h3>
              <p className="bp-hint">Add images to each project. Use the arrows to change their order.</p>
              {b.projects.map((p, i) =>
                uploadZone({ role: "portfolio", projectId: p.id, title: `Project ${i + 1}${t(p.title) ? `: ${t(p.title)}` : ""}`, hint: "Photos or samples of this work." })
              )}
              {images.some((im) => im.role === "portfolio" && !b.projects.some((p) => p.id === im.projectId)) && (
                <div className="bp-imgs">
                  <p className="bp-hint">Not assigned to a project yet:</p>
                  {images
                    .filter((im) => im.role === "portfolio" && !b.projects.some((p) => p.id === im.projectId))
                    .map((img) => imageCard(img))}
                </div>
              )}
            </div>
            {uploadZone({ role: "background", title: "Background images", hint: "Optional. Textures or scenes you'd like behind sections." })}
            {nav({ canSkip: true })}
          </>
        )}

        {/* ---------------- Step 5 ---------------- */}
        {page === "style" && (
          <>
            {heading(<>Choose your website&rsquo;s visual style.</>, "Step 5 of 6")}
            <p className="bp-lead">Pick the direction that feels most like you. You can describe the details below.</p>
            <div className="bp-dirs" role="radiogroup" aria-label="Visual direction">
              {DIRECTIONS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  role="radio"
                  aria-checked={b.style.direction === d.id}
                  className={`bp-dir ${b.style.direction === d.id ? "is-on" : ""}`}
                  onClick={() => up("style", { direction: d.id })}
                >
                  <span className={`bp-dir-prev bp-dir-prev--${d.id}`} aria-hidden="true">
                    <i />
                    <b />
                    <em />
                    <u />
                  </span>
                  <strong>{d.name}</strong>
                  <span>{d.body}</span>
                </button>
              ))}
            </div>
            <div className="bp-colors">
              {(["primary", "secondary"] as const).map((k) => (
                <div key={k} className="bp-color">
                  <label htmlFor={`c-${k}`}>{k === "primary" ? "Primary colour" : "Secondary colour"}</label>
                  <div>
                    <input id={`c-${k}`} type="color" value={/^#[0-9a-f]{6}$/i.test(b.style[k]) ? b.style[k] : "#000000"} onChange={(e) => up("style", { [k]: e.target.value })} />
                    <input aria-label={`${k} colour HEX code`} value={b.style[k]} maxLength={7} onChange={(e) => up("style", { [k]: e.target.value })} placeholder="#007750" />
                  </div>
                </div>
              ))}
            </div>
            <div className="bp-field">
              <span className="bp-label">Typography</span>
              <Chips label="Typography" options={TYPOGRAPHY} selected={[b.style.typography]} onToggle={(v) => up("style", { typography: b.style.typography === v ? "" : v })} />
            </div>
            <div className="bp-zone">
              <h3>Websites you like</h3>
              <p className="bp-hint">
                Look at how the website arranges photos, uses headings, and organizes content. You can use these ideas
                without copying someone else&rsquo;s work.
              </p>
              {b.style.inspirations.map((ins) => {
                const setI = (v: Partial<typeof ins>) => setB((p) => ({ ...p, style: { ...p.style, inspirations: p.style.inspirations.map((x) => (x.id === ins.id ? { ...x, ...v } : x)) } }));
                return (
                  <fieldset key={ins.id} className="bp-project">
                    <Field label="Website address" type="url" value={ins.url} onChange={(v) => setI({ url: v })} placeholder="https://" />
                    <Field label="What do you like about it?" value={ins.note} onChange={(v) => setI({ note: v })} multiline rows={2} />
                    <button type="button" className="bp-link" onClick={() => setB((p) => ({ ...p, style: { ...p.style, inspirations: p.style.inspirations.filter((x) => x.id !== ins.id) } }))}>
                      Remove
                    </button>
                  </fieldset>
                );
              })}
              <button type="button" className="bp-btn bp-btn--ghost bp-btn--small" onClick={() => setB((p) => ({ ...p, style: { ...p.style, inspirations: [...p.style.inspirations, { id: uid(), url: "", note: "" }] } }))}>
                + Add a website link
              </button>
            </div>
            {uploadZone({ role: "inspiration", title: "Screenshots of websites you like", hint: "Optional. These go into your blueprint as visual references." })}
            <Field label="Anything else you like about these references?" optional value={b.style.likes} onChange={(v) => up("style", { likes: v })} multiline />
            {nav()}
          </>
        )}

        {/* ---------------- Step 6: review ---------------- */}
        {page === "review" && (
          <>
            {heading(<>Review your website plan.</>, "Step 6 of 6")}
            <p className="bp-lead">Here&rsquo;s everything in one place. Use Edit to change anything before you create your blueprint.</p>
            {missing.length > 0 && (
              <div className="bp-missing">
                <strong>Still missing</strong>
                <p>Not everything is required. Anything missing will be marked as missing in your blueprint, never filled in for you.</p>
                <ul>
                  {missing.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            )}
            <ReviewBlock title="About you" onEdit={() => go("about")}>
              <RV label="Name" v={a.name} />
              <RV label="What you do" v={a.what} />
              <RV label="Who you work with" v={a.who} />
              <RV label="Location" v={a.location} />
            </ReviewBlock>
            <ReviewBlock title="Brand voice" onEdit={() => go("voice")}>
              <RV label="Traits" v={b.voice.traits.join(", ")} />
              <RV label="Summary" v={b.voice.summary} note={t(b.voice.summary) && !b.voice.approved ? "Not approved yet" : undefined} />
            </ReviewBlock>
            <ReviewBlock title="Hero" onEdit={() => go("hero")}>
              <RV label="Headline" v={b.hero.headline} />
              <RV label="Introduction" v={b.hero.intro} />
              <RV label="Button" v={b.hero.cta} />
              <Thumbs list={images.filter((i) => i.role === "hero")} />
            </ReviewBlock>
            <ReviewBlock title="Portfolio" onEdit={() => go("portfolio")}>
              {b.projects.filter((p) => t(p.title)).length === 0 && <p className="bp-none">No projects yet</p>}
              {b.projects
                .filter((p) => t(p.title))
                .map((p) => (
                  <div key={p.id} className="bp-rv-proj">
                    <RV label="Project" v={p.title} />
                    <RV label="Description" v={p.description} />
                    <Thumbs list={images.filter((i) => i.role === "portfolio" && i.projectId === p.id)} />
                  </div>
                ))}
            </ReviewBlock>
            <ReviewBlock title="Services" onEdit={() => go("services")}>
              <RV label="Description" v={b.services.description || b.services.what} />
            </ReviewBlock>
            <ReviewBlock title="About section" onEdit={() => go("aboutme")}>
              <RV label="Background" v={b.aboutSection.background} />
              <RV label="Approach" v={b.aboutSection.approach} />
              <Thumbs list={images.filter((i) => i.role === "photo")} />
            </ReviewBlock>
            {b.credibility.length > 0 && (
              <ReviewBlock title="Credibility" onEdit={() => go("credibility")}>
                {b.credibility.map((c) => (
                  <RV key={c.id} label={c.type} v={c.text} />
                ))}
              </ReviewBlock>
            )}
            <ReviewBlock title="Contact" onEdit={() => go("contact")}>
              <RV label="Email" v={b.contact.email} />
              <RV label="WhatsApp" v={b.contact.whatsapp} />
              <RV label="Instagram" v={b.contact.instagram} />
              <RV label="LinkedIn" v={b.contact.linkedin} />
              <RV label="Other" v={b.contact.other} />
              <RV label="Button" v={b.contact.cta} />
            </ReviewBlock>
            <ReviewBlock title="Logo and images" onEdit={() => go("uploads")}>
              <Thumbs list={images.filter((i) => i.role === "logo" || i.role === "background")} />
              <p className="bp-hint">{images.length} image(s) in total</p>
            </ReviewBlock>
            <ReviewBlock title="Design" onEdit={() => go("style")}>
              <RV label="Direction" v={DIRECTIONS.find((d) => d.id === b.style.direction)?.name ?? ""} />
              <div className="bp-swatches">
                {[b.style.primary, b.style.secondary].filter((c) => /^#[0-9a-f]{6}$/i.test(c)).map((c) => (
                  <span key={c} style={{ background: c }} title={c} />
                ))}
              </div>
              <RV label="Typography" v={b.style.typography} />
              <RV label="Inspiration links" v={b.style.inspirations.filter((i) => t(i.url)).map((i) => i.url).join("\n")} />
              <Thumbs list={images.filter((i) => i.role === "inspiration")} />
            </ReviewBlock>
            {nav({ nextLabel: "See my AI prompts" })}
          </>
        )}

        {page === "prompts" && (
          <>
            {heading(<>Your personalised AI prompts.</>, "Step 6 of 6")}
            <p className="bp-lead">These are built from your answers and are also included in your PDF. Copy them now or later from the PDF.</p>
            {[
              ["Prompt A: Generate my website", "Paste this into your AI website builder to create the first version.", promptA(b)],
              ["Prompt B: Personalise my website using my blueprint", "Use this when the builder lets you attach files or add more instructions. Attach your Website Blueprint PDF with it.", promptB(b)],
              ["Prompt C: Improve my existing website", "Use this after your website is created to change one part without changing the rest. Fill in the brackets.", promptC()],
            ].map(([title, hint, text]) => (
              <div key={title} className="bp-prompt">
                <div className="bp-summary-head">
                  <h3>{title}</h3>
                  <CopyButton text={text} />
                </div>
                <p className="bp-hint">{hint}</p>
                <pre tabIndex={0}>{text}</pre>
              </div>
            ))}
            {nav({ nextLabel: "Get my blueprint" })}
          </>
        )}

        {/* ---------------- Email + download ---------------- */}
        {page === "get" && (
          <>
            {heading(<>Your Website Blueprint Is Ready!</>)}
            <p className="bp-lead">Enter your details to get your personalized website plan and start building with AI.</p>
            <form className="bp-form" onSubmit={submit} noValidate>
              <Field label="First name" value={firstName} onChange={setFirstName} />
              <Field label="Email address" type="email" value={email} onChange={setEmail} />
              <input ref={honeypot} name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="bp-hp" />
              <label className="bp-check">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                I&rsquo;d also like to receive free website tips, business resources, and updates from RE5 Agency.
              </label>
              <p className="bp-hint">
                Optional. Your download doesn&rsquo;t depend on it. We save your name, email and this choice. Your
                answers and photos stay in your browser. See our{" "}
                <a href="/privacy" target="_blank" rel="noopener">
                  privacy policy
                </a>
                .
              </p>
              {formErr && (
                <div className="bp-error" role="alert">
                  <p>{formErr}</p>
                </div>
              )}
              <div className="bp-nav">
                <button type="button" className="bp-btn bp-btn--ghost" onClick={back} disabled={!!busy}>
                  ← Back
                </button>
                <button type="submit" className="bp-btn bp-btn--big" disabled={!!busy}>
                  {busy === "saving" ? "Saving your details…" : busy === "building" ? "Creating your PDF…" : "Get My Free Website Blueprint"}
                </button>
              </div>
            </form>
          </>
        )}

        {page === "done" && (
          <div className="bp-done">
            <span className="bp-done-tick" aria-hidden="true">✓</span>
            {heading(<>Your Website Blueprint Is Ready. Let&rsquo;s Build!</>)}
            <p className="bp-lead">Your download should have started. If it didn&rsquo;t, use the button below.</p>
            <div className="bp-done-actions">
              <button type="button" className="bp-btn" onClick={() => pdf && download(pdf, fileName())} disabled={!pdf}>
                Download Again
              </button>
              {images.length > 0 && (
                <button type="button" className="bp-btn bp-btn--ghost" onClick={downloadZip} disabled={zipBusy || !pdf}>
                  {zipBusy ? "Preparing ZIP…" : "Download PDF + my original images (ZIP)"}
                </button>
              )}
            </div>
            {zipErr && (
              <div className="bp-error" role="alert">
                <p>{zipErr}</p>
              </div>
            )}
            {embed && (
              <p className="bp-hint">
                Download blocked? <a href="/tools/website-blueprint" target="_blank" rel="noopener">Open the planner in a full tab</a>.
              </p>
            )}
            <h3>How to use your blueprint</h3>
            <ol className="bp-steps">
              <li>Choose an AI website builder.</li>
              <li>Start a new website project.</li>
              <li>Use the first prompt (Prompt A) to generate the initial design.</li>
              <li>Upload your Website Blueprint when the platform supports attachments.</li>
              <li>Upload your original photographs separately if needed.</li>
              <li>Use your personalisation prompt (Prompt B) to improve the website.</li>
              <li>Review the content, mobile layout, and links before publishing.</li>
            </ol>
            <div className="bp-builders">
              <a href="https://www.wix.com" target="_blank" rel="noopener">Wix ↗</a>
              <a href="https://claude.ai" target="_blank" rel="noopener">Claude ↗</a>
              <a href="https://lovable.dev" target="_blank" rel="noopener">Lovable ↗</a>
            </div>
            <p className="bp-note">
              Free publishing and file uploads vary by platform and plan. AI builders may not interpret every part of
              your blueprint perfectly, so review the result carefully.
            </p>
            <div className="bp-re5">
              <p>Want help turning your blueprint into a website?</p>
              <a href="/#contact" className="bp-btn bp-btn--ghost" target={embed ? "_top" : undefined}>
                Let&rsquo;s Talk Business →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Review helpers                                                     */
/* ---------------------------------------------------------------- */

function ReviewBlock({ title, onEdit, children }: { title: string; onEdit: () => void; children: ReactNode }) {
  return (
    <section className="bp-rv">
      <div className="bp-rv-head">
        <h3>{title}</h3>
        <button type="button" className="bp-link" onClick={onEdit}>
          Edit
        </button>
      </div>
      {children}
    </section>
  );
}

function RV({ label, v, note }: { label: string; v: string; note?: string }) {
  return (
    <div className="bp-rv-row">
      <span>{label}</span>
      {t(v) ? <p>{v}</p> : <p className="bp-none">Not provided</p>}
      {note && <em>{note}</em>}
    </div>
  );
}

function Thumbs({ list }: { list: UploadedImage[] }) {
  if (!list.length) return null;
  return (
    <div className="bp-thumbs">
      {list.map((i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i.id} src={i.url} alt={i.caption || i.file.name} />
      ))}
    </div>
  );
}
