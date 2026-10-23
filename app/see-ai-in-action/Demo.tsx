"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CUSTOMERS, PRODUCTS, SHOP, draftMessage, forecast, isOverdue, type Settings } from "./data";

const STEPS = ["Reading 8 weeks of sales", "Spotting trends", "Forecasting demand", "Checking supplier delivery times"];
const STATUS_LABEL = { now: "Reorder now", soon: "Reorder soon", ok: "Stock OK" } as const;

function Bars({ weekly }: { weekly: number[] }) {
  const max = Math.max(...weekly);
  return (
    <div className="d-bars" aria-hidden="true">
      {weekly.map((v, i) => (
        <span key={i} style={{ height: `${Math.max(8, (v / max) * 100)}%` }} />
      ))}
    </div>
  );
}

export default function Demo() {
  /* ---------- stock forecast ---------- */
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [step, setStep] = useState(0);
  const [settings, setSettings] = useState<Settings>({ coverWeeks: 3, buffer: 15, busyWeek: false });
  const timers = useRef<number[]>([]);

  const results = useMemo(() => {
    const order = { now: 0, soon: 1, ok: 2 };
    return PRODUCTS.map((p) => forecast(p, settings)).sort(
      (a, b) => order[a.status] - order[b.status] || a.daysLeft - b.daysLeft
    );
  }, [settings]);
  const counts = useMemo(
    () => ({
      now: results.filter((r) => r.status === "now").length,
      soon: results.filter((r) => r.status === "soon").length,
      cases: results.reduce((n, r) => n + r.cases, 0),
    }),
    [results]
  );

  const run = () => {
    timers.current.forEach(clearTimeout);
    const fast = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ms = fast ? 120 : 520;
    setPhase("running");
    setStep(0);
    STEPS.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setStep(i + 1), ms * (i + 1)));
    });
    timers.current.push(window.setTimeout(() => setPhase("done"), ms * (STEPS.length + 1)));
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /* ---------- follow-ups ---------- */
  const overdue = CUSTOMERS.filter(isOverdue);
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(overdue.map((c) => [c.id, draftMessage(c)]))
  );
  const [queued, setQueued] = useState<Record<string, boolean>>({});
  const [autoRule, setAutoRule] = useState(false);

  return (
    <div className="d">
      {/* ---------------- Intro ---------------- */}
      <section className="d-intro h-pattern">
        <div className="h-panel d-intro-panel">
          <span className="h-mono d-rule">See AI in Action · Business Dashboard</span>
          <h1>Know what&rsquo;s running low before your customers do.</h1>
          <p className="d-lead">
            Try it with {SHOP}, a sample shop. See how smart forecasting can flag products that are about to run out,
            suggest how much to reorder, and draft customer follow-ups for you to approve.
          </p>
          <p className="d-note">
            This is an interactive demo using sample data for a fictional business. Nothing you do here is saved or sent.
          </p>
          <a href="#stock" className="h-btn h-btn--lg">
            Try the demo <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      {/* ---------------- 1. Stock forecast ---------------- */}
      <section id="stock" className="d-section">
        <div className="h-head">
          <span className="h-mono">01. Stock forecast</span>
          <h2 className="h-h2">Which products will run out?</h2>
          <p className="d-sub">
            {SHOP} sells 8 products. Each one has 8 weeks of sales history, current stock and a supplier delivery time.
            Run the analysis to see what needs reordering.
          </p>
        </div>

        <div className="h-panel d-controls">
          <label className="d-control">
            <span>
              Weeks of stock to order <strong>{settings.coverWeeks}</strong>
            </span>
            <input
              type="range"
              min={1}
              max={8}
              value={settings.coverWeeks}
              onChange={(e) => setSettings((s) => ({ ...s, coverWeeks: +e.target.value }))}
            />
          </label>
          <label className="d-control">
            <span>
              Safety buffer <strong>{settings.buffer}%</strong>
            </span>
            <input
              type="range"
              min={0}
              max={40}
              step={5}
              value={settings.buffer}
              onChange={(e) => setSettings((s) => ({ ...s, buffer: +e.target.value }))}
            />
          </label>
          <label className="d-toggle">
            <input
              type="checkbox"
              checked={settings.busyWeek}
              onChange={(e) => setSettings((s) => ({ ...s, busyWeek: e.target.checked }))}
            />
            <span className="d-switch" aria-hidden="true" />
            <span>Plan for a busy week (e.g. Carnival)</span>
          </label>
          <button type="button" className="h-btn h-btn--lg d-run" onClick={run} disabled={phase === "running"}>
            {phase === "done" ? "Run it again" : phase === "running" ? "Analysing…" : "Run the analysis"}{" "}
            <span aria-hidden="true">→</span>
          </button>
        </div>

        {phase === "running" && (
          <div className="h-panel d-steps" role="status" aria-live="polite">
            {STEPS.map((s, i) => (
              <div key={s} className={`d-step ${i < step ? "is-done" : i === step ? "is-now" : ""}`}>
                <span className="d-step-dot">{i < step ? "✓" : ""}</span>
                {s}
                {i === step && "…"}
              </div>
            ))}
          </div>
        )}

        {phase === "idle" && (
          <div className="d-empty">Press &ldquo;Run the analysis&rdquo; to see the results.</div>
        )}

        {phase === "done" && (
          <>
            <div className="d-summary" role="status" aria-live="polite">
              <div className="h-panel d-stat d-stat--now">
                <strong>{counts.now}</strong>
                <span>to reorder now</span>
              </div>
              <div className="h-panel d-stat d-stat--soon">
                <strong>{counts.soon}</strong>
                <span>to reorder soon</span>
              </div>
              <div className="h-panel d-stat">
                <strong>{counts.cases}</strong>
                <span>cases in the suggested order</span>
              </div>
            </div>

            <div className="d-products">
              {results.map((r) => (
                <article key={r.product.id} className={`h-panel d-product d-product--${r.status}`}>
                  <div className="d-product-head">
                    <div>
                      <h3>{r.product.name}</h3>
                      <span className="h-mono">{r.product.unit}</span>
                    </div>
                    <span className={`d-badge d-badge--${r.status}`}>{STATUS_LABEL[r.status]}</span>
                  </div>
                  <div className="d-product-mid">
                    <div>
                      <span className="h-mono">Last 8 weeks</span>
                      <Bars weekly={r.product.weekly} />
                    </div>
                    <dl className="d-facts">
                      <div>
                        <dt>In stock</dt>
                        <dd>{r.product.stock}</dd>
                      </div>
                      <div>
                        <dt>Lasts about</dt>
                        <dd>{Math.floor(r.daysLeft)} days</dd>
                      </div>
                      <div>
                        <dt>Delivery</dt>
                        <dd>{r.product.leadDays} days</dd>
                      </div>
                    </dl>
                  </div>
                  <p className="d-reason">{r.reason}</p>
                  <div className="d-order">
                    {r.order > 0 ? (
                      <>
                        <span className="h-mono">Suggested order</span>
                        <strong>
                          {r.order} {r.product.short}
                        </strong>
                        <span className="d-order-cases">
                          {r.cases} case{r.cases === 1 ? "" : "s"} of {r.product.caseSize}
                        </span>
                      </>
                    ) : (
                      <span className="h-mono">No order needed</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
            <p className="d-note d-how">
              How it works: recent weeks count more than older ones, a clear upward or downward trend is carried forward,
              and the suggested order covers the supplier&rsquo;s delivery time plus the weeks of stock you chose, rounded
              up to full cases. Try the sliders and the busy-week switch to see the suggestions change.
            </p>
          </>
        )}
      </section>

      {/* ---------------- 2. Follow-ups ---------------- */}
      <section className="d-section d-section--rule">
        <div className="h-head">
          <span className="h-mono">02. Customer follow-ups</span>
          <h2 className="h-h2">Who hasn&rsquo;t ordered in a while?</h2>
          <p className="d-sub">
            {SHOP} has {CUSTOMERS.length} regular customers. Each one usually orders on a rhythm. When someone is
            overdue, a personalised message is drafted for you to check and approve.
          </p>
        </div>

        <div className="d-customers">
          {CUSTOMERS.map((c) => {
            const due = isOverdue(c);
            return (
              <div key={c.id} className={`d-customer ${due ? "is-due" : ""}`}>
                <span className="d-avatar" aria-hidden="true">
                  {c.name[0]}
                </span>
                <div>
                  <strong>{c.name}</strong>
                  <span>
                    {c.usual}, usually every {c.everyDays} days
                  </span>
                </div>
                <span className={`d-badge ${due ? "d-badge--now" : "d-badge--ok"}`}>
                  {due ? `Overdue · ${c.lastDaysAgo} days` : `On track · ${c.lastDaysAgo} days`}
                </span>
              </div>
            );
          })}
        </div>

        <h3 className="d-h3">Drafted messages ({overdue.length})</h3>
        <div className="d-drafts">
          {overdue.map((c) => (
            <div key={c.id} className="h-panel d-draft">
              <div className="d-draft-head">
                <strong>To {c.name}</strong>
                <span className="h-mono">{c.channel}</span>
              </div>
              <textarea
                aria-label={`Message to ${c.name}`}
                rows={c.channel === "Email" ? 9 : 5}
                value={drafts[c.id]}
                disabled={queued[c.id]}
                onChange={(e) => setDrafts((d) => ({ ...d, [c.id]: e.target.value }))}
              />
              {queued[c.id] ? (
                <div className="d-queued" role="status">
                  ✓ Approved. In a real setup this would be sent on {c.channel}. (Demo: nothing was sent.)
                  <button type="button" className="d-link" onClick={() => setQueued((q) => ({ ...q, [c.id]: false }))}>
                    Undo
                  </button>
                </div>
              ) : (
                <button type="button" className="h-btn h-btn--sm" onClick={() => setQueued((q) => ({ ...q, [c.id]: true }))}>
                  Approve message
                </button>
              )}
            </div>
          ))}
        </div>

        <label className="h-panel d-rulebox">
          <input type="checkbox" checked={autoRule} onChange={(e) => setAutoRule(e.target.checked)} />
          <span className="d-switch" aria-hidden="true" />
          <span>
            <strong>Automation rule:</strong> every morning, check for overdue customers and draft their messages.
            {autoRule && (
              <em> On. You&rsquo;d get a short list to approve each day, instead of remembering who to contact.</em>
            )}
          </span>
        </label>
      </section>

      {/* ---------------- Real business ---------------- */}
      <section className="d-close h-pattern">
        <div className="h-panel d-close-panel">
          <span className="h-mono d-rule">On your real business</span>
          <h2>Smarter Systems. Better Business Decisions.</h2>
          <p>
            With your own data, from your point-of-sale system, online store or spreadsheets, the same ideas can run
            every day: flag low stock, suggest orders and draft follow-ups, with you approving what goes out. We
            implement business software, CRM, inventory management, and AI-powered automation to reduce manual work,
            anticipate stock needs, and make everyday operations easier.
          </p>
          <a href="/?interest=automation#contact" className="h-btn h-btn--lg">
            Let&rsquo;s Talk Business <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>
    </div>
  );
}
