"use client";

import { useEffect, useRef } from "react";
import type { Package, PackageSet } from "./packages";

// Native <dialog>: traps focus, closes on Esc, and is announced as a dialog by screen readers.
export default function PackagesModal({
  set,
  focus,
  onClose,
  onChoose,
}: {
  set: PackageSet | null;
  focus?: string; // package id to scroll to when the pop-up opens
  onClose: () => void;
  onChoose: (set: PackageSet, pkg: Package) => void;
}) {
  const ref = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (set && !d.open) {
      d.showModal();
      d.scrollTop = 0;
      document.documentElement.style.overflow = "hidden";
      if (focus) {
        const el = d.querySelector<HTMLElement>(`#pk-${focus}`);
        if (el) {
          el.scrollIntoView({ block: "start" });
          el.classList.add("is-focus");
          setTimeout(() => el.classList.remove("is-focus"), 1600);
        }
      }
    }
    if (!set && d.open) d.close();
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [set, focus]);

  const card = (set: PackageSet, p: Package, label: string) => (
              <article key={p.id} id={`pk-${p.id}`} className={`pk-card ${p.wide ? "pk-card--wide" : ""}`}>
                <span className="h-mono pk-num">{label}</span>
                <h3>{p.name}</h3>
                <p className="pk-price">{p.price}</p>
                <p className="pk-tagline">{p.tagline}</p>
                {p.intro.map((t) => (
                  <p key={t} className="pk-text">
                    {t}
                  </p>
                ))}
                <div className={p.wide ? "pk-groups pk-groups--wide" : "pk-groups"}>
                  {p.groups.map((g) => (
                    <div key={g.title ?? g.items[0]} className="pk-group">
                      {g.title && <h4>{g.title}</h4>}
                      <ul>
                        {g.items.map((it) => (
                          <li key={it}>{it}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                {p.note && (
                  <p className="pk-note">
                    <strong>{p.note.label}:</strong> {p.note.text}
                  </p>
                )}
                {p.after?.map((a) => (
                  <div key={a.text} className="pk-after">
                    {a.title && <h4>{a.title}</h4>}
                    <p>{a.text}</p>
                  </div>
                ))}
                <div className="pk-actions">
                  <button type="button" className="h-btn pk-cta" onClick={() => onChoose(set, p)}>
                    {p.cta} <span aria-hidden="true">→</span>
                  </button>
                  {p.demo && (
                    <a href={p.demo} target="_blank" rel="noopener" className="pk-demo">
                      See a live demo ↗
                    </a>
                  )}
                </div>
              </article>
  );

  return (
    <dialog
      ref={ref}
      className="pk"
      aria-labelledby="pk-title"
      onClose={() => {
        document.documentElement.style.overflow = "";
        onClose();
      }}
      onClick={(e) => {
        // Clicking the dimmed backdrop (outside the panel) closes it.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {set && (
        <div className="pk-panel">
          <div className="pk-top">
            <span className="h-mono">Packages · {set.title}</span>
            <button type="button" className="pk-close" onClick={onClose} aria-label="Close packages">
              ✕
            </button>
          </div>
          <div className="pk-head">
            <h2 id="pk-title">{set.title}</h2>
            <p className="pk-headline">{set.headline}</p>
            {set.intro.map((t) => (
              <p key={t} className="pk-intro">
                {t}
              </p>
            ))}
          </div>
          <div className="pk-grid">{set.packages.map((p, i) => card(set, p, String(i + 1).padStart(2, "0") + "."))}</div>
          <p className="pk-foot">{set.footnote}</p>
        </div>
      )}
    </dialog>
  );
}
