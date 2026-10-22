import { NextResponse } from "next/server";
import { Resend } from "resend";

// Records a Website Blueprint Planner sign-up: first name, email, marketing consent and the
// time consent was given. Workbook answers and photos never reach this endpoint.
//
// Each sign-up is:
//  1. saved as a contact in Resend (unsubscribed unless they ticked the marketing box), and
//  2. emailed to the RE5 inbox as a backup record.
// The request succeeds if at least one of the two worked.

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

// Abuse prevention: at most 5 sign-ups per visitor every 10 minutes (per server instance).
const WINDOW_MS = 10 * 60 * 1000;
const MAX = 5;
const recent = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((x) => now - x < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  if (recent.size > 5000) recent.clear();
  return hits.length > MAX;
}

export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many attempts. Please wait a few minutes and try again." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) ?? {};
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Bots fill the hidden "website" field or submit instantly: pretend it worked.
  const { website, elapsed } = body;
  if ((typeof website === "string" && website.trim()) || (typeof elapsed === "number" && elapsed < 5000)) {
    return NextResponse.json({ ok: true });
  }

  const firstName = typeof body.firstName === "string" ? body.firstName.trim().slice(0, 80) : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 200) : "";
  const consent = body.marketingConsent === true;
  if (!firstName) return NextResponse.json({ error: "Please enter your first name." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not configured.");
    return NextResponse.json({ error: "Sign-up isn't available right now. Please try again later." }, { status: 500 });
  }
  const resend = new Resend(apiKey);
  const at = new Date().toISOString();

  // 1. Contact list
  let savedContact = false;
  try {
    // "Website Blueprint Planner" segment in Resend (not a secret). Override with RESEND_BLUEPRINT_SEGMENT_ID.
    const segment = process.env.RESEND_BLUEPRINT_SEGMENT_ID ?? "c91ae713-3d3e-4440-9df3-d2d7d1ea43ab";
    let { error } = await resend.contacts.create({
      email,
      firstName,
      unsubscribed: !consent,
      segments: [{ id: segment }],
    });
    if (error && !/already exists/i.test(error.message ?? "")) {
      // If the segment can't be used, still save the contact itself.
      ({ error } = await resend.contacts.create({ email, firstName, unsubscribed: !consent }));
    }
    savedContact = !error || /already exists/i.test(error.message ?? "");
    if (error && !savedContact) console.error("Resend contact error:", error);
  } catch (err) {
    console.error("Resend contact failed:", err);
  }

  // 2. Backup record to the RE5 inbox (server-side only, never shown on the site)
  let emailed = false;
  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "RE5 Agency <enquiries@re5agency.com>",
      to: process.env.BOOKING_TO_EMAIL ?? "astral.ochoa@hotmail.com",
      subject: `New Website Blueprint sign-up: ${firstName}${consent ? " (opted in to updates)" : ""}`,
      html: `
        <p>Someone downloaded the free Website Blueprint.</p>
        <table cellpadding="0" cellspacing="0">
          <tr><td style="padding:4px 16px 4px 0;color:#3A4A41">First name</td><td>${escapeHtml(firstName)}</td></tr>
          <tr><td style="padding:4px 16px 4px 0;color:#3A4A41">Email</td><td>${escapeHtml(email)}</td></tr>
          <tr><td style="padding:4px 16px 4px 0;color:#3A4A41">Marketing consent</td><td>${consent ? `Yes, given ${at}` : "No"}</td></tr>
          <tr><td style="padding:4px 16px 4px 0;color:#3A4A41">Signed up</td><td>${at}</td></tr>
          <tr><td style="padding:4px 16px 4px 0;color:#3A4A41">Saved to contacts</td><td>${savedContact ? "Yes" : "No (check Resend)"}</td></tr>
        </table>
      `,
    });
    emailed = !error;
    if (error) console.error("Resend email error:", error);
  } catch (err) {
    console.error("Resend email failed:", err);
  }

  if (!savedContact && !emailed) {
    return NextResponse.json({ error: "We couldn't save your details just now. Please try again." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
