// Package details shown in the "See Packages" pop-ups on the homepage.

export type Group = { title?: string; items: string[] };
export type Package = {
  id: string;
  name: string;
  price: string;
  tagline: string;
  intro: string[];
  groups: Group[];
  note?: { label: string; text: string };
  after?: { title?: string; text: string }[];
  cta: "Get Started" | "Request a Consultation";
  demo?: string; // optional link to a live demo
  fine?: string; // fine print shown when this package is viewed on its own
  wide?: boolean;
};
export type PackageSet = {
  service: string; // matches the contact form's service options
  title: string;
  headline: string;
  intro: string[];
  packages: Package[];
  footnote: string;
};

export const PACKAGE_SETS: PackageSet[] = [
  {
    service: "Websites & Online Sales",
    title: "Websites & Online Sales",
    headline: "Your Business Deserves to Be Seen.",
    intro: [
      "Make it easier for customers to discover your business, explore your products and services, and buy from you online.",
      "Whether you're starting small or building a complete online store, we have a solution to help you take the next step.",
    ],
    packages: [
      {
        id: "re5-digital",
        fine: "Price reflects one-time setup and publishing; the USD amount is approximate. Hosting and menu or price updates are covered by the RE5 Care Plan. Your own domain name is optional and paid separately.",
        name: "RE5 Digital",
        price: "Starting at TT$350 / US$52",
        demo: "/digital/demo",
        tagline: "Start Online. Start Simple.",
        intro: [
          "Not every business needs a full website.",
          "RE5 Digital gives businesses a simple, professional way to share their offerings and receive customer orders through an interactive digital page.",
        ],
        groups: [
          {
            title: "What's Included",
            items: [
              "Branded, mobile-friendly interactive page",
              "Personalized link",
              "QR code",
              "Digital menu with WhatsApp ordering",
              "Multi-language menu",
              "Business information and contact details",
              "Initial setup and publishing",
            ],
          },
        ],
        cta: "Get Started",
      },
      {
        id: "business-website",
        fine: "Quoted based on your needs. Hosting, domain registration, maintenance, and additional pages or functionality are charged separately.",
        name: "Business Website",
        price: "Custom Quote",
        tagline: "Make a Strong First Impression Online.",
        intro: [
          "We design and build professional websites that help customers discover your business, learn about your offerings, and get in touch.",
        ],
        groups: [
          {
            title: "What's Included",
            items: [
              "Website design and development, up to 5 pages",
              "Mobile-friendly design",
              "Product or service showcase",
              "Contact and inquiry forms",
              "WhatsApp and social media links",
              "Basic search engine setup",
              "Google Maps integration where relevant",
              "Website launch and handover",
            ],
          },
        ],
        cta: "Get Started",
      },
      {
        id: "ecommerce-website",
        fine: "Quoted based on your needs. Hosting, domain registration, payment provider fees, maintenance, and additional functionality are charged separately.",
        name: "eCommerce Website",
        price: "Custom Quote",
        tagline: "Make It Easier for Customers to Buy.",
        intro: ["We build online stores that allow customers to browse products, place orders, and complete purchases conveniently."],
        groups: [
          {
            title: "What's Included",
            items: [
              "Online store design and development",
              "Mobile-friendly storefront",
              "Product catalogue with up to 20 products uploaded",
              "Shopping cart and checkout",
              "Payment gateway integration where supported",
              "Order notifications",
              "Basic inventory tracking where supported",
              "Shipping or pickup configuration",
              "Basic search engine setup",
              "Store management training and handover",
            ],
          },
        ],
        cta: "Get Started",
      },
    ],
    footnote:
      "Business and eCommerce websites are quoted based on your needs. RE5 Digital pricing reflects one-time setup; USD amounts are approximate. Hosting, domain registration, payment provider fees, maintenance, and additional functionality are charged separately.",
  },
];
