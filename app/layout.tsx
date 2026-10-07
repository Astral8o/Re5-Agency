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

export const metadata: Metadata = {
  title: "Re5 | Roll up. Experience it.",
  description:
    "We create mobile experiences designed around your brand, event or celebration. Across Trinidad and Tobago.",
  metadataBase: new URL("https://www.re5agency.com"),
  openGraph: {
    title: "Re5 | Roll up. Experience it.",
    description:
      "Mobile experiences for brands, events and celebrations across Trinidad and Tobago.",
    url: "https://www.re5agency.com",
    siteName: "Re5",
    type: "website",
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
