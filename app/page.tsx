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
    "RE5 helps Caribbean businesses of every size thrive in the digital economy with the knowledge, tools and support to reach more customers and grow with confidence.",
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
