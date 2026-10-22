import type { Metadata } from "next";
import "./privacy.css";

export const metadata: Metadata = {
  title: "Privacy Policy | RE5 Agency",
  description: "How RE5 Agency collects and uses the details you share with us.",
  alternates: { canonical: "/privacy" },
};

function Mark() {
  return (
    <svg viewBox="0 0 100 100" fill="#007750" aria-hidden="true">
      <circle cx="50" cy="20" r="15" />
      <circle cx="78.5" cy="40.7" r="15" />
      <circle cx="67.6" cy="74.3" r="15" />
      <circle cx="32.4" cy="74.3" r="15" />
      <circle cx="21.5" cy="40.7" r="15" />
    </svg>
  );
}

export default function PrivacyPage() {
  return (
    <div className="pp">
      <header className="pp-top">
        <a href="/" className="pp-logo" aria-label="RE5 Agency home">
          <Mark />
          RE5 Agency
        </a>
        <a href="/" className="pp-back">
          ← Back to the site
        </a>
      </header>

      <main className="pp-body">
        <span className="pp-eyebrow">Last updated October 2026</span>
        <h1>Privacy Policy</h1>
        <p>
          RE5 Agency is a business consulting and digital solutions agency based in Trinidad &amp; Tobago. This
          policy explains what information we collect through re5agency.com, why we collect it and what you can
          ask us to do with it.
        </p>

        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Contact form details:</strong> your name, company, email, phone or WhatsApp number, the
            services you&rsquo;re interested in and anything you tell us about your plans.
          </li>
          <li>
            <strong>Website Blueprint Planner:</strong> when you download your free Website Blueprint, we save your
            first name, email address, whether you chose to receive updates from us, and the date and time of that
            choice. Your workbook answers and photos are processed in your own browser to create your PDF. They are
            not sent to us or stored by us, and they&rsquo;re cleared when you leave the page.
          </li>
          <li>
            <strong>Website usage:</strong> we use Google Analytics to understand how people use the site, such as
            which pages are visited, the type of device and browser, and your approximate location (city or
            country). Google Analytics uses cookies to do this.
          </li>
        </ul>

        <h2>How we use it</h2>
        <ul>
          <li>To reply to your enquiry and talk through how we can help.</li>
          <li>To record your Website Blueprint download and your marketing choice.</li>
          <li>To prepare proposals or quotes you ask us for.</li>
          <li>
            To send free website tips, business resources and updates, but only if you opted in. You can unsubscribe
            at any time using the link in any of those emails.
          </li>
          <li>To improve the website and understand what people are looking for.</li>
        </ul>
        <p>We don&rsquo;t sell your information, and we don&rsquo;t use it for advertising.</p>

        <h2>Who we share it with</h2>
        <p>
          We only share information with the services that help us run the website: Vercel (website hosting),
          Resend (delivers your contact form to our inbox and stores Website Blueprint sign-ups) and Google Analytics (website statistics). They
          process information on our behalf and only for these purposes. We may also share information if the
          law requires it.
        </p>

        <h2>How long we keep it</h2>
        <p>
          We keep enquiry details for as long as we need them to respond, work with you and keep basic business
          records. You can ask us to delete them at any time.
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
          For any privacy question or request, send us a message through the{" "}
          <a href="/#contact">contact form</a> and mention that it&rsquo;s about privacy.
        </p>

        <h2>Changes to this policy</h2>
        <p>If we update this policy, we&rsquo;ll post the new version on this page with a new date.</p>
      </main>
    </div>
  );
}
