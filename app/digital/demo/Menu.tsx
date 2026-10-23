"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { BANK, BUSINESS, MENU, tt, type Item } from "./menu";

type Line = { item: Item; qty: number; note: string };

/* ---------- bottom sheet built on <dialog> (focus trap + Esc for free) ---------- */
function Sheet({ open, onClose, label, children }: { open: boolean; onClose: () => void; label: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement | null>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="m-sheet"
      aria-label={label}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {open && (
        <div className="m-sheet-inner">
          <button type="button" className="m-sheet-x" onClick={onClose} aria-label="Close">
            ✕
          </button>
          {children}
        </div>
      )}
    </dialog>
  );
}

type Mode = "Dine-in" | "Pickup" | "Delivery";
type Pay = "Cash on delivery" | "Card on delivery" | "Pay in store" | "Bank deposit";
const PAYMENTS: Record<Mode, Pay[]> = {
  "Dine-in": ["Pay in store", "Bank deposit"],
  Pickup: ["Pay in store", "Bank deposit"],
  Delivery: ["Cash on delivery", "Card on delivery", "Bank deposit"],
};

const WA = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`;

export default function Menu() {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(MENU[0].id);
  const [lines, setLines] = useState<Line[]>([]);
  const [detail, setDetail] = useState<Item | null>(null);
  const [detailQty, setDetailQty] = useState(1);
  const [detailNote, setDetailNote] = useState("");
  const [sheet, setSheet] = useState<"" | "basket" | "info" | "share">("");
  const [mode, setMode] = useState<Mode>("Dine-in");
  const [table, setTable] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pay, setPay] = useState<Pay>("Pay in store");
  const [tried, setTried] = useState(false);
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("https://www.re5agency.com/digital/demo");
  const tabsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setUrl(`${window.location.origin}/digital/demo`);
  }, []);

  /* ---------- search + scroll spy ---------- */
  const term = q.trim().toLowerCase();
  const shown = useMemo(
    () =>
      MENU.map((c) => ({
        ...c,
        items: term ? c.items.filter((i) => `${i.name} ${i.desc} ${(i.tags ?? []).join(" ")}`.toLowerCase().includes(term)) : c.items,
      })).filter((c) => c.items.length),
    [term]
  );
  useEffect(() => {
    const els = MENU.map((c) => document.getElementById(`cat-${c.id}`)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id.replace("cat-", ""));
      },
      { rootMargin: "-120px 0px -60% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [shown]);
  useEffect(() => {
    tabsRef.current?.querySelector(`[data-cat="${active}"]`)?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [active]);
  const jump = (id: string) => {
    const el = document.getElementById(`cat-${id}`);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 112, behavior: "smooth" });
  };

  /* ---------- basket ---------- */
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const total = lines.reduce((n, l) => n + l.qty * l.item.price, 0);
  const add = (item: Item, qty = 1, note = "") =>
    setLines((ls) => {
      const i = ls.findIndex((l) => l.item.id === item.id && l.note === note);
      if (i >= 0) return ls.map((l, j) => (j === i ? { ...l, qty: l.qty + qty } : l));
      return [...ls, { item, qty, note }];
    });
  const change = (idx: number, d: number) =>
    setLines((ls) => ls.map((l, j) => (j === idx ? { ...l, qty: l.qty + d } : l)).filter((l) => l.qty > 0));
  const removeOne = (id: string) =>
    setLines((ls) => {
      const idx = ls.map((l) => l.item.id).lastIndexOf(id);
      if (idx < 0) return ls;
      return ls.map((l, j) => (j === idx ? { ...l, qty: l.qty - 1 } : l)).filter((l) => l.qty > 0);
    });
  const qtyOf = (id: string) => lines.filter((l) => l.item.id === id).reduce((n, l) => n + l.qty, 0);

  const openDetail = (item: Item) => {
    setDetail(item);
    setDetailQty(1);
    setDetailNote("");
  };

  const orderText = () =>
    [
      `Hi ${BUSINESS.name}! I'd like to place an order:`,
      "",
      ...lines.flatMap((l) => [`${l.qty} x ${l.item.name}  ${tt(l.qty * l.item.price)}`, ...(l.note.trim() ? [`   Note: ${l.note.trim()}`] : [])]),
      "",
      `Total: ${tt(total)}`,
      `Order type: ${mode}${mode === "Dine-in" && table.trim() ? `, table ${table.trim()}` : ""}`,
      ...(mode === "Delivery" ? [`Deliver to: ${address.trim()}`] : []),
      `Payment: ${pay}${pay === "Bank deposit" ? " (I'll send proof of payment here)" : ""}`,
      ...(name.trim() ? [`Name: ${name.trim()}`] : []),
      ...(phone.trim() ? [`Phone: ${phone.trim()}`] : []),
      "",
      "(Sent from the RE5 Digital demo menu. This is a fictional business.)",
    ].join("\n");

  const pickMode = (m: Mode) => {
    setMode(m);
    if (!PAYMENTS[m].includes(pay)) setPay(PAYMENTS[m][0]);
  };
  const missing = {
    name: tried && mode !== "Dine-in" && !name.trim(),
    phone: tried && mode !== "Dine-in" && phone.replace(/\D/g, "").length < 7,
    address: tried && mode === "Delivery" && address.trim().length < 6,
  };
  const send = () => {
    const bad = mode !== "Dine-in" && (!name.trim() || phone.replace(/\D/g, "").length < 7 || (mode === "Delivery" && address.trim().length < 6));
    setTried(true);
    if (bad) return;
    window.open(WA(orderText()), "_blank", "noopener");
  };

  const shareText = `Check out the menu at ${BUSINESS.name} 🐦🍹\n${url}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="m">
      {/* ---------- demo bar ---------- */}
      <div className="m-demobar">
        <span>
          <strong>Demo</strong> · Fictional business · Made with RE5 Digital
        </span>
        <a href="/#services">Get yours →</a>
      </div>

      {/* ---------- header ---------- */}
      <header className="m-head">
        <div className="m-cover" aria-hidden="true">
          <span>🌴</span>
          <span>🍹</span>
          <span>🌊</span>
        </div>
        <div className="m-brand">
          <div className="m-logo">
            <img src="/digital/kiskadee-logo.webp" alt={`${BUSINESS.name} logo`} width={360} height={360} />
          </div>
          <h1>{BUSINESS.name}</h1>
          <p>{BUSINESS.tagline}</p>
          <div className="m-meta">
            <span>📍 Chaguaramas</span>
          </div>
          <div className="m-actions">
            <a className="m-btn m-btn--wa" href={WA(shareText)} target="_blank" rel="noopener">
              <WaIcon /> Share on WhatsApp
            </a>
            <button type="button" className="m-btn" onClick={() => setSheet("share")}>
              Link &amp; QR
            </button>
            <button type="button" className="m-btn" onClick={() => setSheet("info")}>
              Info
            </button>
          </div>
        </div>
      </header>

      {/* ---------- search + tabs ---------- */}
      <div className="m-sticky">
        <label className="m-search">
          <span aria-hidden="true">🔍</span>
          <input type="search" placeholder="Search the menu" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search the menu" />
        </label>
        {!term && (
          <div className="m-tabs" ref={tabsRef} role="tablist" aria-label="Menu categories">
            {MENU.map((c) => (
              <button
                key={c.id}
                type="button"
                data-cat={c.id}
                role="tab"
                aria-selected={active === c.id}
                className={active === c.id ? "is-on" : ""}
                onClick={() => jump(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ---------- menu ---------- */}
      <main className="m-list">
        {shown.length === 0 && <p className="m-empty">Nothing matches &ldquo;{q}&rdquo;. Try another search.</p>}
        {shown.map((c) => (
          <section key={c.id} id={`cat-${c.id}`} className="m-cat" aria-labelledby={`h-${c.id}`}>
            <h2 id={`h-${c.id}`}>{c.name}</h2>
            {c.items.map((it) => {
              const n = qtyOf(it.id);
              return (
                <article key={it.id} className={`m-item ${it.soldOut ? "is-out" : ""}`}>
                  <button type="button" className="m-item-main" onClick={() => !it.soldOut && openDetail(it)} disabled={it.soldOut}>
                    <span className="m-item-text">
                      <span className="m-item-name">{it.name}</span>
                      <span className="m-item-desc">{it.desc}</span>
                      <span className="m-item-foot">
                        <strong>{tt(it.price)}</strong>
                        {it.soldOut && <span className="m-tag m-tag--out">Sold out</span>}
                        {it.tags?.map((t) => (
                          <span key={t} className={`m-tag m-tag--${t.split(" ")[0].toLowerCase()}`}>
                            {t === "Spicy" ? "🌶️ " : t === "Vegetarian" ? "🌱 " : ""}
                            {t}
                          </span>
                        ))}
                      </span>
                    </span>
                    <span className="m-item-img" aria-hidden="true">
                      {it.photo ? <img src={`/digital/menu/${it.id}-sm.webp`} alt="" width={240} height={240} loading="lazy" decoding="async" /> : it.emoji}
                    </span>
                  </button>
                  {!it.soldOut &&
                    (n ? (
                      <div className="m-step" role="group" aria-label={`${it.name} quantity`}>
                        <button type="button" onClick={() => removeOne(it.id)} aria-label={`One less ${it.name}`}>
                          −
                        </button>
                        <span aria-live="polite">{n}</span>
                        <button type="button" onClick={() => add(it)} aria-label={`One more ${it.name}`}>
                          +
                        </button>
                      </div>
                    ) : (
                      <button type="button" className="m-add" onClick={() => add(it)} aria-label={`Add ${it.name} to order`}>
                        <span aria-hidden="true">+</span> Add
                      </button>
                    ))}
                </article>
              );
            })}
          </section>
        ))}
        <footer className="m-foot">
          <p>Prices in Trinidad &amp; Tobago dollars and include VAT. Please tell staff about any allergies.</p>
          <p className="m-made">
            Menu by <a href="/">RE5 Digital</a> · Want one for your business? <a href="/#services">See packages</a>
          </p>
        </footer>
      </main>

      {/* ---------- basket bar ---------- */}
      {count > 0 && (
        <button type="button" className="m-basketbar" onClick={() => setSheet("basket")}>
          <span className="m-basketbar-n">{count}</span>
          <span>View order</span>
          <strong>{tt(total)}</strong>
        </button>
      )}

      {/* ---------- item detail ---------- */}
      <Sheet open={!!detail} onClose={() => setDetail(null)} label={detail?.name ?? "Item"}>
        {detail && (
          <div className="m-detail">
            <div className="m-detail-img" aria-hidden="true">
              {detail.photo ? <img src={`/digital/menu/${detail.id}.webp`} alt="" width={800} height={600} /> : detail.emoji}
            </div>
            <h2>{detail.name}</h2>
            <p>{detail.desc}</p>
            <strong className="m-detail-price">{tt(detail.price)}</strong>
            <label className="m-field">
              Any special requests?
              <input value={detailNote} onChange={(e) => setDetailNote(e.target.value)} placeholder="e.g. no pepper, extra chutney" maxLength={120} />
            </label>
            <div className="m-detail-row">
              <div className="m-qty" aria-label="Quantity">
                <button type="button" onClick={() => setDetailQty((n) => Math.max(1, n - 1))} aria-label="Less">
                  −
                </button>
                <span>{detailQty}</span>
                <button type="button" onClick={() => setDetailQty((n) => Math.min(20, n + 1))} aria-label="More">
                  +
                </button>
              </div>
              <button
                type="button"
                className="m-btn m-btn--primary m-grow"
                onClick={() => {
                  add(detail, detailQty, detailNote.trim());
                  setDetail(null);
                }}
              >
                Add to order · {tt(detail.price * detailQty)}
              </button>
            </div>
          </div>
        )}
      </Sheet>

      {/* ---------- basket ---------- */}
      <Sheet open={sheet === "basket"} onClose={() => setSheet("")} label="Your order">
        <div className="m-basket">
          <h2>Your order</h2>
          {lines.length === 0 ? (
            <p className="m-empty">Your order is empty.</p>
          ) : (
            <>
              <ul>
                {lines.map((l, i) => (
                  <li key={`${l.item.id}-${l.note}`}>
                    <div>
                      <strong>{l.item.name}</strong>
                      {l.note && <span className="m-note">Note: {l.note}</span>}
                      <span>{tt(l.item.price * l.qty)}</span>
                    </div>
                    <div className="m-qty m-qty--sm">
                      <button type="button" onClick={() => change(i, -1)} aria-label={`One less ${l.item.name}`}>
                        −
                      </button>
                      <span>{l.qty}</span>
                      <button type="button" onClick={() => change(i, 1)} aria-label={`One more ${l.item.name}`}>
                        +
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="m-total">
                <span>Total</span>
                <strong>{tt(total)}</strong>
              </div>
              <div className="m-mode" role="radiogroup" aria-label="Order type">
                {(["Dine-in", "Pickup", "Delivery"] as const).map((m) => (
                  <button key={m} type="button" role="radio" aria-checked={mode === m} className={mode === m ? "is-on" : ""} onClick={() => pickMode(m)}>
                    {m === "Pickup" ? "Pick up" : m}
                  </button>
                ))}
              </div>
              {mode === "Dine-in" && (
                <label className="m-field">
                  Table number (optional)
                  <input value={table} onChange={(e) => setTable(e.target.value)} inputMode="numeric" maxLength={4} />
                </label>
              )}
              {mode === "Pickup" && <p className="m-small m-hint">Pick up at {BUSINESS.area}. We&apos;ll message you when it&apos;s ready.</p>}
              <label className="m-field">
                Your name{mode === "Dine-in" ? " (optional)" : ""}
                <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="name" aria-invalid={!!missing.name} />
                {missing.name && <span className="m-err">Please add your name</span>}
              </label>
              <label className="m-field">
                Phone number{mode === "Dine-in" ? " (optional)" : ""}
                <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" placeholder="e.g. 868 123 4567" maxLength={20} autoComplete="tel" aria-invalid={!!missing.phone} />
                {missing.phone && <span className="m-err">Please add a number we can reach you on</span>}
              </label>
              {mode === "Delivery" && (
                <label className="m-field">
                  Delivery address
                  <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} placeholder="House number, street, area and a landmark" maxLength={200} autoComplete="street-address" aria-invalid={!!missing.address} />
                  {missing.address && <span className="m-err">Please add your delivery address</span>}
                  <span className="m-small">Delivery fee is confirmed on WhatsApp before your order is made.</span>
                </label>
              )}
              <fieldset className="m-pay">
                <legend>Payment method</legend>
                {PAYMENTS[mode].map((p) => (
                  <label key={p} className={pay === p ? "is-on" : ""}>
                    <input type="radio" name="pay" checked={pay === p} onChange={() => setPay(p)} />
                    {p}
                  </label>
                ))}
              </fieldset>
              {pay === "Bank deposit" && (
                <div className="m-bank">
                  <strong>Bank details</strong>
                  <dl>
                    <dt>Bank</dt>
                    <dd>{BANK.bank}</dd>
                    <dt>Account name</dt>
                    <dd>{BANK.accountName}</dd>
                    <dt>Account no.</dt>
                    <dd>{BANK.accountNo}</dd>
                    <dt>Branch</dt>
                    <dd>{BANK.branch}</dd>
                    <dt>Amount</dt>
                    <dd>{tt(total)}{mode === "Delivery" ? " + delivery" : ""}</dd>
                  </dl>
                  <p>Send a photo of your deposit slip or transfer in the WhatsApp chat. We start your order once payment is confirmed.</p>
                </div>
              )}
              <button type="button" className="m-btn m-btn--wa m-btn--block" onClick={send}>
                <WaIcon /> Send order on WhatsApp
              </button>
              <p className="m-small">
                Demo: WhatsApp opens with your order typed out so you can see how it looks. Choose any chat (even
                yourself). Nothing is sent to a real business.
              </p>
            </>
          )}
        </div>
      </Sheet>

      {/* ---------- share ---------- */}
      <Sheet open={sheet === "share"} onClose={() => setSheet("")} label="Share this menu">
        <div className="m-share">
          <h2>Share this menu</h2>
          <p>Every RE5 Digital menu comes with its own link and a QR code that opens the same page.</p>
          <div className="m-linkbox">
            <span>{url.replace(/^https?:\/\//, "")}</span>
            <button type="button" className="m-btn" onClick={copy}>
              {copied ? "✓ Copied" : "Copy link"}
            </button>
          </div>
          <a className="m-btn m-btn--wa m-btn--block" href={WA(shareText)} target="_blank" rel="noopener">
            <WaIcon /> Share on WhatsApp
          </a>
          <div className="m-qr">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/digital/demo-qr.png" alt="QR code that opens this menu" width={180} height={180} />
            <p>Scan to open this menu on your phone. Print it on table cards, flyers or packaging.</p>
          </div>
        </div>
      </Sheet>

      {/* ---------- info ---------- */}
      <Sheet open={sheet === "info"} onClose={() => setSheet("")} label="Opening hours and info">
        <div className="m-info">
          <h2>{BUSINESS.name}</h2>
          <p>📍 {BUSINESS.area}</p>
          <h3>Opening hours</h3>
          <dl>
            {BUSINESS.hours.map(([d, h]) => (
              <div key={d}>
                <dt>{d}</dt>
                <dd>{h}</dd>
              </div>
            ))}
          </dl>
          <p className="m-small">
            This is a fictional business created to demonstrate RE5 Digital. The address and phone number are not real.
          </p>
        </div>
      </Sheet>
    </div>
  );
}

function WaIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.85 9.85 0 0 0 12.04 2Zm5.8 14.13c-.24.68-1.42 1.31-1.96 1.36-.5.05-1.13.07-1.83-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.79-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-3 0-1.43.75-2.13 1.02-2.42.26-.29.58-.36.77-.36h.55c.18 0 .42-.07.65.5.24.58.82 2.01.89 2.16.07.14.12.31.02.5-.1.19-.14.31-.29.48-.14.17-.3.38-.43.51-.14.14-.29.3-.13.59.17.29.74 1.22 1.58 1.97 1.09.97 2.01 1.27 2.3 1.41.29.14.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.38-.24.65-.14.26.1 1.68.79 1.97.94.29.14.48.22.55.34.07.12.07.7-.17 1.38Z" />
    </svg>
  );
}
