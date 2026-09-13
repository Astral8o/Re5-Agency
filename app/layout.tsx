import type { Metadata } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["200", "300", "400", "600"],
  variable: "--font-sora",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
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
    <html lang="en" className={`${sora.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
