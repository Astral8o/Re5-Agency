import type { ReactNode } from "react";
import "./blog.css";

export function Mark({ color = "#007750" }: { color?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill={color} aria-hidden="true">
      <circle cx="50" cy="20" r="15" />
      <circle cx="78.5" cy="40.7" r="15" />
      <circle cx="67.6" cy="74.3" r="15" />
      <circle cx="32.4" cy="74.3" r="15" />
      <circle cx="21.5" cy="40.7" r="15" />
    </svg>
  );
}

// Header, closing call to action and footer shared by the blog pages, matching the homepage.
export default function BlogChrome({ children }: { children: ReactNode }) {
  return (
    <div className="bl">
      <header className="bl-nav">
        <a href="/" className="bl-logo" aria-label="RE5 Agency home">
          <Mark />
          <span>
            RE<em>5</em> Agency
          </span>
        </a>
        <nav className="bl-links">
          <a href="/#services">Services</a>
          <a href="/blog">Blog</a>
          <a href="/#contact" className="bl-cta">
            Let&rsquo;s Talk Business
          </a>
        </nav>
      </header>
      {children}
      <footer className="bl-foot">
        <span>&copy; {new Date().getFullYear()} RE5 Agency. All rights reserved.</span>
        <a href="/privacy">Privacy Policy</a>
      </footer>
    </div>
  );
}
