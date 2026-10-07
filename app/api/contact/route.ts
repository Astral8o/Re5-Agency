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

type BriefRow = { n?: unknown; tag?: unknown; answer?: unknown };

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

  const { offer, contact, email, phone, company, companyLabel, brief, website, elapsed } = (body ?? {}) as Record<
    string,
    unknown
  >;

  // Spam filter, layers 1 and 2: the hidden "website" field is only ever filled by bots, and
  // nobody finishes the form in under 4 seconds. Pretend it worked so bots don't adapt.
  if ((typeof website === "string" && website.trim()) || (typeof elapsed === "number" && elapsed < 4000)) {
    return NextResponse.json({ ok: true });
  }

  if (
    typeof contact !== "string" ||
    !contact.trim() ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return NextResponse.json(
      { error: "Name and email are required." },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not configured.");
    return NextResponse.json(
      { error: "Booking form is not configured yet." },
      { status: 500 }
    );
  }

  // Server-side only: never sent to the browser. Override with BOOKING_TO_EMAIL in Vercel.
  // (RESEND_TO_EMAIL is deliberately not read: Vercel still holds an old value pointing at
  // an inbox that doesn't exist.)
  const toEmail = process.env.BOOKING_TO_EMAIL ?? "astral.ochoa@hotmail.com";
  // re5agency.com is verified in Resend, so any address on it can send without a mailbox.
  const fromEmail =
    process.env.RESEND_FROM_EMAIL ?? "Re5 <bookings@re5agency.com>";

  const fields = {
    offer: typeof offer === "string" ? offer.trim().slice(0, 200) : "",
    contact: String(contact).trim().slice(0, 200),
    email: String(email).trim().slice(0, 200),
    phone: typeof phone === "string" ? phone.trim().slice(0, 60) : "",
    company: typeof company === "string" ? company.trim().slice(0, 200) : "",
    companyLabel:
      typeof companyLabel === "string" && companyLabel.trim()
        ? companyLabel.trim().slice(0, 40)
        : "Business",
  };

  const briefRows = Array.isArray(brief) ? (brief as BriefRow[]).slice(0, 30) : [];
  const briefHtml = briefRows
    .map((row) => {
      const n = typeof row.n === "string" ? row.n.slice(0, 4) : "";
      const tag = typeof row.tag === "string" ? row.tag.slice(0, 80) : "";
      const answer = typeof row.answer === "string" ? row.answer.slice(0, 2000) : "";
      return `<tr><td style="padding:6px 12px 6px 0;color:#6b6358;white-space:nowrap">${escapeHtml(
        n
      )} ${escapeHtml(tag)}</td><td style="padding:6px 0">${escapeHtml(answer)}</td></tr>`;
    })
    .join("");

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: fields.email,
      subject: `New Re5 booking request: ${fields.offer || "General enquiry"} for ${
        fields.company || fields.contact
      }`,
      html: `
        <p><strong>Name:</strong> ${escapeHtml(fields.contact)}</p>
        <p><strong>${escapeHtml(fields.companyLabel)}:</strong> ${escapeHtml(fields.company || "Not provided")}</p>
        <p><strong>Email:</strong> ${escapeHtml(fields.email)}</p>
        <p><strong>Phone / WhatsApp:</strong> ${escapeHtml(fields.phone || "Not provided")}</p>
        <table cellpadding="0" cellspacing="0">${briefHtml}</table>
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
