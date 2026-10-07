import type { Metadata } from "next";
import { DM_Sans, Modak } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-6RBX04Y5KR";

const modak = Modak({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

// Workhorse font for everything that is not a Modak display moment.
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-sans",
  display: "swap",
});

const TITLE = "Re5 | Make it an experience.";
const DESCRIPTION =
  "Mobile frozen drink experiences for events, celebrations and brands across Trinidad & Tobago. Tell us what you have in mind.";

// The share image (WhatsApp, Instagram, iMessage) comes from app/opengraph-image.jpg.
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  metadataBase: new URL("https://www.re5agency.com"),
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://www.re5agency.com",
    siteName: "Re5",
    locale: "en_TT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${modak.variable} ${dmSans.variable}`}
    >
      <body>
        {children}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
