import HomePage from "@/components/HomePage";
import { FAQ } from "@/components/faq";
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

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BUSINESS_JSON_LD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />
      <HomePage posts={POSTS.slice(0, 3)} />
    </>
  );
}
