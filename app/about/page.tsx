import type { Metadata } from "next";
import BlogChrome from "../blog/Chrome";
import "./about.css";

export const metadata: Metadata = {
  title: "About | RE5 Agency",
  description:
    "Our vision is a Caribbean where businesses of every size thrive in the digital economy. Learn about RE5 Agency's goal and how we work.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <BlogChrome>
      <main className="ab">
        <section className="ab-hero h-pattern">
          <div className="ab-panel">
            <span className="ab-mono">About RE5 Agency</span>
            <span className="ab-mono ab-label">Our Vision</span>
            <h1>
              A Caribbean where businesses of every size have the knowledge, capabilities, and opportunities to{" "}
              <span className="ab-mark">thrive in the digital economy</span> and compete confidently on the global
              stage.
            </h1>
          </div>
        </section>

        <section className="ab-section">
          <div className="ab-row">
            <span className="ab-mono ab-label">Our Goal</span>
            <p className="ab-goal">
              To help thousands of Caribbean businesses successfully adopt digital technologies, expand their market
              reach, strengthen their capabilities, and achieve measurable, sustainable growth.
            </p>
          </div>
        </section>

        <section className="ab-section">
          <div className="ab-row">
            <span className="ab-mono ab-label">How We Will Achieve This</span>
            <div className="ab-how">
              <p className="ab-intro">RE5 Agency will pursue its mission through:</p>
              <article className="ab-card">
                <span className="ab-n">01</span>
                <div>
                  <h2>Websites &amp; Online Sales</h2>
                  <p>
                    Helping Caribbean businesses establish and strengthen their online presence through professional
                    websites, e-commerce solutions, and interactive ordering platforms.
                  </p>
                  <div className="ab-actions">
                    <a href="/#services" className="ab-btn">
                      See Packages <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="ab-cta">
          <h2>Let&rsquo;s build what&rsquo;s next for your business.</h2>
          <a href="/#contact" className="ab-btn ab-btn--lg">
            Let&rsquo;s Talk Business <span aria-hidden="true">→</span>
          </a>
        </section>
      </main>
    </BlogChrome>
  );
}
