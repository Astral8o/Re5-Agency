import LandingPage from "@/components/LandingPage";

// Business details for Google (shown in search results and Maps panels).
const BUSINESS_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Re5",
  url: "https://www.re5agency.com",
  image: "https://www.re5agency.com/opengraph-image.jpg",
  description:
    "Mobile frozen drink experiences for events, celebrations and brands across Trinidad & Tobago.",
  telephone: "+1-868-717-7720",
  areaServed: [
    { "@type": "Place", name: "Trinidad" },
    { "@type": "Place", name: "Tobago" },
  ],
  address: { "@type": "PostalAddress", addressCountry: "TT" },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BUSINESS_JSON_LD) }}
      />
      <LandingPage />
    </>
  );
}
