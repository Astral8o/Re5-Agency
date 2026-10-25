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
  wide?: boolean;
};
export type PackageSet = {
  service: string; // matches the contact form's service options
  title: string;
  headline: string;
  intro: string[];
  packages: Package[];
  addons?: { title: string; intro: string; packages: Package[] }; // optional add-ons shown under the main packages
  footnote: string;
};

export const PACKAGE_SETS: PackageSet[] = [
  {
    service: "Websites & Online Sales",
    title: "Websites & Online Sales",
    headline: "Sell Online. Answer Faster. Run It All in One Place.",
    intro: [
      "Make it easier for customers to discover your business, explore your products and services, and buy from you online.",
      "Start with a website or RE5 Digital page, then add an AI chat assistant, connected orders, and a simple business dashboard, all working together as one system.",
    ],
    packages: [
      {
        id: "re5-digital",
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
    addons: {
      title: "Add-ons",
      intro:
        "Add these to any website package. Each add-on is quoted based on your needs, with a one-time setup and a monthly fee that covers the software, hosting, and support, and they all work together as one system.",
      packages: [
        {
          id: "ai-chat-assistant",
          name: "AI Chat Assistant",
          price: "Custom Quote",
          tagline: "Answer Customers, Even After Hours.",
          intro: ["An AI assistant that replies to customer questions instantly, collects their details, and passes them to your team when a person is needed."],
          groups: [
            {
              title: "What's Included",
              items: [
                "AI chat assistant on your website, with WhatsApp and Instagram available",
                "Answers common questions on prices, hours, location, and availability",
                "Collects each customer's name, number, and request",
                "Hands conversations to you or your team when needed",
                "Trained on your business information",
                "Updates when your prices, menu, or services change",
              ],
            },
          ],
          cta: "Get Started",
        },
        {
          id: "connected-orders",
          name: "Connected Orders & Inquiries",
          price: "Custom Quote",
          tagline: "Every Message. One Place.",
          intro: ["Bring the orders and inquiries from your WhatsApp, social media, and website into one place, so nothing gets lost in the chats."],
          groups: [
            {
              title: "What's Included",
              items: [
                "WhatsApp Business, Instagram, Facebook, and website forms connected",
                "Orders and inquiries logged automatically",
                "Instant alerts for new orders",
                "See which channel each order came from",
                "Setup, testing, and staff training",
              ],
            },
          ],
          cta: "Get Started",
        },
        {
          id: "business-dashboard",
          name: "Business Dashboard",
          price: "Custom Quote",
          demo: "/see-ai-in-action",
          tagline: "See Your Business at a Glance.",
          intro: ["A simple CRM and inventory dashboard that keeps track of your customers, orders, and stock, all in one place."],
          groups: [
            {
              title: "What's Included",
              items: [
                "Customer list built automatically from your orders and inquiries",
                "Customer order history",
                "Follow-up reminders for regular customers",
                "Stock levels with low-stock alerts",
                "Import of your existing customer and product lists",
                "Simple sales summary: today, this week, and top items",
                "Staff training and handover",
              ],
            },
          ],
          cta: "Get Started",
        },
        {
          id: "connected-business-bundle",
          name: "Connected Business Bundle",
          price: "Custom Quote",
          wide: true,
          tagline: "Everything Connected. One System.",
          intro: [
            "Get the AI Chat Assistant, Connected Orders & Inquiries, and Business Dashboard together, set up to work as one system with your website or RE5 Digital page.",
            "Save compared with adding each one separately.",
          ],
          groups: [
            {
              title: "What's Included",
              items: ["AI Chat Assistant", "Connected Orders & Inquiries", "Business Dashboard", "One setup, one monthly fee, one point of contact"],
            },
          ],
          cta: "Get Started",
        },
      ],
    },
    footnote:
      "Business and eCommerce websites are quoted based on your needs. RE5 Digital pricing reflects one-time setup; USD amounts are approximate. Hosting, domain registration, payment provider fees, maintenance, and additional functionality are charged separately. Add-on monthly fees include the software and support; WhatsApp marketing message fees set by Meta are charged separately.",
  },
];
