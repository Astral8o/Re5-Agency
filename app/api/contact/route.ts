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

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { offer, contact, email, phone, company, brief } = (body ?? {}) as Record<
    string,
    unknown
  >;

  if (typeof contact !== "string" || !contact.trim() || typeof email !== "string" || !email.trim()) {
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

  const toEmail = process.env.RESEND_TO_EMAIL ?? "hello@re5agency.com";
  const fromEmail =
    process.env.RESEND_FROM_EMAIL ?? "Re5 <onboarding@resend.dev>";

  const fields = {
    offer: typeof offer === "string" ? offer.trim().slice(0, 200) : "",
    contact: String(contact).trim().slice(0, 200),
    email: String(email).trim().slice(0, 200),
    phone: typeof phone === "string" ? phone.trim().slice(0, 60) : "",
    company: typeof company === "string" ? company.trim().slice(0, 200) : "",
  };

  const briefRows = Array.isArray(brief) ? (brief as BriefRow[]) : [];
  const briefHtml = briefRows
    .map((row) => {
      const n = typeof row.n === "string" ? row.n : "";
      const tag = typeof row.tag === "string" ? row.tag : "";
      const answer = typeof row.answer === "string" ? row.answer : "";
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
        <p><strong>Business:</strong> ${escapeHtml(fields.company || "Not provided")}</p>
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
