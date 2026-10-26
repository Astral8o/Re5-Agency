import HomePage from "@/components/HomePage";
import { POSTS } from "./blog/posts";
import "./home.css";

const BUSINESS_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "RE5 Agency",
  url: "https://www.re5agency.com",
  image: "https://www.re5agency.com/og-image.jpg?v=2",
  description:
    "RE5 helps Caribbean businesses grow online and sell more through professional websites, e-commerce solutions, and interactive ordering platforms.",
  areaServed: "Caribbean",
  address: { "@type": "PostalAddress", addressCountry: "TT" },
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BUSINESS_JSON_LD) }} />
      <HomePage posts={POSTS.slice(0, 3)} />
    </>
  );
}
