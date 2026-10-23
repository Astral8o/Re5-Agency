import { NextResponse } from "next/server";
import { Resend } from "resend";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}


// Spam filter, layer 3: at most 5 requests per visitor every 10 minutes. Kept in memory,
// so it's per server instance; the honeypot and timing checks below catch most bots anyway.
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const recent = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  if (recent.size > 5000) recent.clear();
  return hits.length > RATE_MAX;
}

export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later, or reach us on WhatsApp." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, company, email, phone, interests, message, website, elapsed, package: pkg } = (body ?? {}) as Record<
    string,
    unknown
  >;

  // Spam filter, layers 1 and 2: the hidden "website" field is only ever filled by bots, and
  // nobody finishes the form in under 4 seconds. Pretend it worked so bots don't adapt.
  if ((typeof website === "string" && website.trim()) || (typeof elapsed === "number" && elapsed < 4000)) {
    return NextResponse.json({ ok: true });
  }

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return NextResponse.json({ error: "Name and a valid email are required." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not configured.");
    return NextResponse.json({ error: "Contact form is not configured yet." }, { status: 500 });
  }

  // Server-side only: never sent to the browser. Override with BOOKING_TO_EMAIL in Vercel.
  // (RESEND_TO_EMAIL is deliberately not read: Vercel still holds an old value pointing at
  // an inbox that doesn't exist.)
  const toEmail = process.env.BOOKING_TO_EMAIL ?? "astral.ochoa@hotmail.com";
  // re5agency.com is verified in Resend, so any address on it can send without a mailbox.
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "RE5 Agency <enquiries@re5agency.com>";

  const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const fields = {
    name: text(name, 200),
    company: text(company, 200),
    email: text(email, 200),
    phone: text(phone, 60),
    interests: (Array.isArray(interests) ? interests : [])
      .filter((i): i is string => typeof i === "string")
      .slice(0, 10)
      .map((i) => i.slice(0, 100)),
    message: text(message, 5000),
    pkg: text(pkg, 200),
  };

  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 16px 6px 0;color:#3A4A41;white-space:nowrap;vertical-align:top">${label}</td><td style="padding:6px 0">${
      value ? escapeHtml(value).replace(/\n/g, "<br>") : "Not provided"
    }</td></tr>`;

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: fields.email,
      subject: `New RE5 Agency enquiry from ${fields.company || fields.name}${fields.pkg ? `: ${fields.pkg.split(" (")[0]}` : ""}`,
      html: `
        <table cellpadding="0" cellspacing="0">
          ${row("Name", fields.name)}
          ${row("Company", fields.company)}
          ${row("Email", fields.email)}
          ${row("Phone / WhatsApp", fields.phone)}
          ${fields.pkg ? row("Package", fields.pkg) : ""}
          ${row("Interested in", fields.interests.join(", "))}
          ${row("Their plans", fields.message)}
        </table>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Booking form send failed:", err);
    return NextResponse.json({ error: "Failed to send." }, { status: 500 });
  }
}
