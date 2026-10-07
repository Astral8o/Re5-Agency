import type { Metadata } from "next";
import "../landing.css";

export const metadata: Metadata = {
  title: "Privacy Policy | Re5",
  description: "How Re5 collects and uses the details you share with us.",
  alternates: { canonical: "/privacy" },
};

const WHATSAPP_URL = "https://wa.me/18687177720";

export default function PrivacyPage() {
  return (
    <div className="r5 r5-legal">
      <header className="r5-legal__top">
        <a href="/" className="r5-nav__logo" aria-label="Re5 home">
          Re5<span className="r5-dot">.</span>
        </a>
        <a href="/" className="r5-legal__back">
          ← Back to the site
        </a>
      </header>

      <main className="r5-legal__body">
        <span className="r5-eyebrow">Last updated October 2026</span>
        <h1 className="r5-h2">Privacy Policy</h1>
        <p>
          Re5 creates mobile experiences for events, celebrations and brands across Trinidad &amp; Tobago. This
          policy explains what information we collect through re5agency.com, why we collect it and what you can
          ask us to do with it.
        </p>

        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Booking form details:</strong> your name, email, phone or WhatsApp number, how you&rsquo;d like
            us to contact you and your answers about your event or brand (for example the date, location, guest
            count, flavours and anything else you choose to tell us).
          </li>
          <li>
            <strong>Messages:</strong> anything you send us on WhatsApp or by email.
          </li>
          <li>
            <strong>Website usage:</strong> we use Google Analytics to understand how people use the site, such as
            which pages are visited, the type of device and browser, and your approximate location (city or
            country). Google Analytics uses cookies to do this.
          </li>
        </ul>

        <h2>How we use it</h2>
        <ul>
          <li>To reply to your enquiry and set up a consultation.</li>
          <li>To plan your experience and prepare a quote.</li>
          <li>To improve the website and understand what people are looking for.</li>
        </ul>
        <p>We don&rsquo;t sell your information, and we don&rsquo;t use it for advertising.</p>

        <h2>Who we share it with</h2>
        <p>
          We only share information with the services that help us run the website: Vercel (website hosting),
          Resend (delivers your booking form to our inbox) and Google Analytics (website statistics). They process
          information on our behalf and only for these purposes. We may also share information if the law
          requires it.
        </p>

        <h2>How long we keep it</h2>
        <p>
          We keep enquiry details for as long as we need them to respond, plan your experience and keep basic
          business records. You can ask us to delete them at any time.
        </p>

        <h2>Your choices</h2>
        <ul>
          <li>You can ask to see, correct or delete the information we hold about you.</li>
          <li>
            You can block or clear cookies in your browser settings, or use Google&rsquo;s{" "}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener">
              Analytics opt-out add-on
            </a>
            .
          </li>
        </ul>

        <h2>Contact us</h2>
        <p>
          For any privacy question or request, message us on{" "}
          <a href={WHATSAPP_URL} target="_blank" rel="noopener">
            WhatsApp
          </a>
          .
        </p>

        <h2>Changes to this policy</h2>
        <p>If we update this policy, we&rsquo;ll post the new version on this page with a new date.</p>
      </main>
    </div>
  );
}
