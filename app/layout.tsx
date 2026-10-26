import type { Metadata } from "next";
import { Instrument_Sans, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import CleanHash from "@/components/CleanHash";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-6RBX04Y5KR";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-mono",
  display: "swap",
});

// Wordmark only: Plus Jakarta Sans for the "RE5 Agency" logo.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: "500",
  variable: "--font-logo",
  display: "swap",
});

const TITLE = "RE5 Agency | Your Partner in Business Growth & Digital Transformation";
const DESCRIPTION =
  "RE5 helps Caribbean businesses of every size thrive in the digital economy with the knowledge, tools and support to reach more customers and grow with confidence.";

// Applies to the Next.js pages (privacy, 404). The homepage is public/index.html with its own tags.
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  metadataBase: new URL("https://www.re5agency.com"),
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://www.re5agency.com",
    siteName: "RE5 Agency",
    type: "website",
    images: [{ url: "/og-image.jpg?v=2", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.jpg?v=2"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${instrumentSans.variable} ${jetbrainsMono.variable} ${jakarta.variable}`}>
      <body>
        <CleanHash />
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
