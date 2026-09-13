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

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, business, email, whatsapp, message } = (body ?? {}) as Record<
    string,
    unknown
  >;

  if (typeof name !== "string" || !name.trim() || typeof email !== "string" || !email.trim()) {
    return NextResponse.json(
      { error: "Name and email are required." },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not configured.");
    return NextResponse.json(
      { error: "Contact form is not configured yet." },
      { status: 500 }
    );
  }

  const toEmail = process.env.RESEND_TO_EMAIL ?? "hello@re5agency.com";
  const fromEmail =
    process.env.RESEND_FROM_EMAIL ?? "RE5 Agency <onboarding@resend.dev>";

  const fields = {
    name: String(name).trim().slice(0, 200),
    business: typeof business === "string" ? business.trim().slice(0, 200) : "",
    email: String(email).trim().slice(0, 200),
    whatsapp: typeof whatsapp === "string" ? whatsapp.trim().slice(0, 60) : "",
    message: typeof message === "string" ? message.trim().slice(0, 4000) : "",
  };

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: fields.email,
      subject: `New spotlight inquiry: ${fields.business || fields.name}`,
      html: `
        <p><strong>Name:</strong> ${escapeHtml(fields.name)}</p>
        <p><strong>Business:</strong> ${escapeHtml(fields.business || "—")}</p>
        <p><strong>Email:</strong> ${escapeHtml(fields.email)}</p>
        <p><strong>WhatsApp:</strong> ${escapeHtml(fields.whatsapp || "—")}</p>
        <p><strong>What they need:</strong></p>
        <p>${escapeHtml(fields.message || "—").replace(/\n/g, "<br />")}</p>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form send failed:", err);
    return NextResponse.json({ error: "Failed to send." }, { status: 500 });
  }
}
