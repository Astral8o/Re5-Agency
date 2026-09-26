import type { Metadata } from "next";
import { Caveat, Instrument_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-6RBX04Y5KR";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-sans",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-script",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RE5 Agency — Your work deserves the spotlight.",
  description:
    "RE5 puts event businesses where people can see them, find them, and book them. Social content, discovery on Eventory, and clearer paths to bookings.",
  metadataBase: new URL("https://www.re5agency.com"),
  openGraph: {
    title: "RE5 Agency — Your work deserves the spotlight.",
    description:
      "We put your business where people can see it, find it, and book it.",
    url: "https://www.re5agency.com",
    siteName: "RE5 Agency",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${caveat.variable}`}
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
