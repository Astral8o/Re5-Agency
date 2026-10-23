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
  footnote: string;
};

export const PACKAGE_SETS: PackageSet[] = [
  {
    service: "Marketing & Customer Growth",
    title: "Marketing & Customer Growth",
    headline: "Get Seen. Attract Customers. Grow Your Business.",
    intro: [
      "Build a stronger online presence, reach new customers, and create more opportunities for sales with marketing services designed around your business.",
    ],
    packages: [
      {
        id: "social-essentials",
        name: "Social Media Essentials",
        price: "TT$1,800/month",
        tagline: "Stay visible. Stay connected.",
        intro: ["For businesses that want a consistent and professional social media presence."],
        groups: [
          {
            title: "Every Week",
            items: [
              "3 social media posts, including up to 2 Reels per month",
              "Branded graphics and engaging captions",
              "Content scheduling on Facebook and Instagram",
            ],
          },
          { title: "Also Included", items: ["Initial social media audit", "Monthly content calendar", "Monthly performance summary"] },
        ],
        note: { label: "Content", text: "You provide photos and video footage. We handle design, editing, captions, and publishing." },
        cta: "Get Started",
      },
      {
        id: "marketing-growth",
        name: "Marketing & Growth",
        price: "TT$3,500/month",
        tagline: "Reach more customers. Generate more opportunities.",
        intro: ["For businesses ready to attract new customers through professional content and targeted marketing campaigns."],
        groups: [
          {
            title: "Every Week",
            items: [
              "3 social media posts, including up to 1 Reel",
              "Branded graphics and engaging captions",
              "Content scheduling on Facebook and Instagram",
            ],
          },
          {
            title: "Also Included",
            items: [
              "Initial marketing and social media audit",
              "Monthly marketing and campaign plan",
              "1 professional photography and videography session per month, up to 2 hours",
              "Management of 1 Meta advertising campaign per month",
              "Monthly performance report covering reach, engagement, and customer inquiries",
            ],
          },
        ],
        note: { label: "Content", text: "We handle content planning, photography, filming, editing, and publishing." },
        cta: "Get Started",
      },
    ],
    footnote:
      "Packages are based on a four-week content cycle. Reels count toward the total number of posts. Advertising spend and additional services are charged separately.",
  },
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
        price: "Starting at TT$2,500 / US$368",
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
        price: "Starting at TT$5,500 / US$810",
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
      "Prices reflect one-time setup. USD amounts are approximate. Hosting, domain registration, payment provider fees, maintenance, and additional functionality are charged separately.",
  },
  {
    service: "Business Systems & Automation",
    title: "Business Systems & Automation",
    headline: "Smarter Systems. Better Business Decisions.",
    intro: [
      "Missed customer inquiries, inaccurate inventory records, and repetitive tasks can cost your business time and money.",
      "We help you address these challenges with practical business systems, AI, and automation that make everyday work easier.",
    ],
    packages: [
      {
        id: "crm",
        name: "CRM & Customer Management",
        price: "TT$2,500 | One-Time Setup",
        tagline: "Every Customer Opportunity Matters.",
        intro: [
          "Keep customer information organized, track sales opportunities, and make sure important follow-ups don't get overlooked.",
        ],
        groups: [
          {
            title: "What's Included",
            items: [
              "Business needs assessment",
              "CRM selection, setup, and configuration",
              "Customer database setup",
              "One sales or inquiry pipeline",
              "Lead tracking and follow-up reminders",
              "Basic reporting dashboard",
              "Staff training and handover",
            ],
          },
        ],
        cta: "Get Started",
      },
      {
        id: "business-automation",
        name: "Business Automation",
        price: "Starting at TT$5,500 | One-Time Setup",
        tagline: "Less Manual Work. More Control.",
        intro: [
          "Still tracking inventory in spreadsheets or spending hours completing the same tasks?",
          "We implement business systems and automations that help you keep track of important activities, reduce repetitive work, and manage operations more efficiently.",
        ],
        groups: [
          {
            title: "What's Included",
            items: [
              "Business process assessment",
              "Setup of one primary business system, such as CRM or inventory management",
              "Sales or inventory tracking configuration",
              "Up to 2 supported workflow automations",
              "Basic reporting dashboard",
              "System testing, training, and handover",
            ],
          },
          {
            title: "Examples of What We Can Automate",
            items: [
              "Low-stock alerts to help prevent unexpected stockouts",
              "Customer follow-up reminders",
              "Lead notifications and inquiry tracking",
              "Routine updates between compatible business systems",
            ],
          },
        ],
        cta: "Get Started",
      },
      {
        id: "advanced-ai",
        name: "Advanced AI & Business Systems",
        price: "Custom Quote | One-Time Implementation",
        tagline: "Bring Your Business Together.",
        intro: [
          "Imagine your marketing, website, sales, customer management, and inventory working together.",
          "We design and implement connected business systems that help information move between different areas of your business, reduce duplicated work, and give you a clearer picture of performance.",
          "With AI and automation, your business can go further, from forecasting demand and identifying sales opportunities to improving customer communication and managing everyday operations.",
        ],
        groups: [
          {
            title: "Marketing & Sales",
            items: [
              "Connect marketing campaigns with lead and sales tracking",
              "Automate customer follow-ups",
              "Identify opportunities for repeat business",
            ],
          },
          {
            title: "Websites & Online Sales",
            items: [
              "Connect website inquiries and online orders with compatible business systems",
              "Coordinate customer, order, and sales information",
            ],
          },
          {
            title: "Customer Management",
            items: [
              "Centralize customer records and interactions",
              "Track purchase history and sales opportunities",
              "Support personalized customer communications",
            ],
          },
          {
            title: "Inventory & Purchasing",
            items: [
              "Monitor inventory levels and product performance",
              "Automate reorder notifications",
              "Use AI-assisted forecasting to anticipate demand where supported",
            ],
          },
          {
            title: "AI & Workflow Automation",
            items: [
              "Connect business processes across compatible software",
              "Automate repetitive administrative tasks",
              "Introduce AI assistants for appropriate business activities",
            ],
          },
          {
            title: "Business Reporting",
            items: [
              "Connect marketing, sales, customer, and operational information",
              "Build dashboards to monitor performance and support business decisions",
            ],
          },
        ],
        after: [
          {
            title: "The Result",
            text: "Better coordination, fewer manual tasks, stronger customer relationships, and a business equipped to manage growth.",
          },
          { text: "Every implementation begins with discovery to determine the right systems, integrations, and features for your business." },
        ],
        cta: "Request a Consultation",
        wide: true,
      },
    ],
    footnote:
      "All packages include one-time implementation fees. Software subscriptions, AI usage, paid integrations, and ongoing support are separate unless included in your quotation.",
  },
];
