import type { Metadata, Viewport } from "next";
import Menu from "./Menu";
import { BUSINESS } from "./menu";
import "./menu.css";

const TITLE = `${BUSINESS.name} | Menu`;
const DESC = "Browse the menu and order on WhatsApp. A demo menu made with RE5 Digital (fictional business).";

// These tags control the preview card WhatsApp shows when the link is shared.
export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "/digital/demo" },
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESC,
    url: "https://www.re5agency.com/digital/demo",
    siteName: "RE5 Digital",
    images: [{ url: "/digital/demo-og.jpg", width: 1200, height: 630, alt: `${BUSINESS.name} menu` }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC, images: ["/digital/demo-og.jpg"] },
};

export const viewport: Viewport = { themeColor: "#0e3b43" };

export default function Page() {
  return <Menu />;
}
