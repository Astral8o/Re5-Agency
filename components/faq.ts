// Homepage FAQ, grouped by service. Also used for the FAQPage structured data in app/page.tsx.
export type QA = { q: string; a: string };
export const FAQ_GROUPS: { id: string; label: string; items: QA[] }[] = [
  {
    id: "digital",
    label: "RE5 Digital",
    items: [
      { q: "What is RE5 Digital?", a: "A single interactive page, such as a menu, catalogue or order page, with its own link and QR code. Customers browse, choose what they want and send the order straight to your WhatsApp." },
      { q: "Do my customers need to download an app?", a: "No. The link and QR code open in any phone browser. Customers can share it on WhatsApp, Instagram or anywhere else." },
      { q: "How long does it take?", a: "Usually 3 to 5 days once we have your menu or product list, prices and photos." },
      { q: "How much does it cost?", a: "It depends on the size of your menu or product list and what you need. Tell us about your business and we'll send you a clear quote." },
      { q: "Can I update my menu or prices myself?", a: "RE5 Digital pages are managed by our team, so you can't edit them yourself. Just send us your changes on WhatsApp and we'll update them for you. Updates are included in the RE5 Care Plan." },
      { q: "How do my customers pay?", a: "Each order arrives in your WhatsApp with the customer's chosen payment method, such as cash or card on delivery, pay on pickup or bank deposit. You confirm the order and collect payment the way you normally do." },
      { q: "Can I use my own domain name?", a: "Your page uses an RE5 link by default. If you'd like your own domain, you can buy one and we'll connect it for you." },
      { q: "Are there any ongoing costs?", a: "The RE5 Care Plan covers hosting, backups, up to 2 updates to your menu or prices a month and support on WhatsApp. We'll include it in your quote." },
    ],
  },
  {
    id: "websites",
    label: "Websites & Online Stores",
    items: [
      { q: "What's the difference between a business website and an online store?", a: "A business website helps customers find you, learn about your business and get in touch, with up to 5 pages. An online store adds a product catalogue, shopping cart, checkout and payments so customers can buy any time." },
      { q: "How long does it take?", a: "A business website usually takes 2 to 3 weeks and an online store 3 to 5 weeks. Timelines start once we have your content and depend on the size of the project." },
      { q: "How much does it cost?", a: "Websites and online stores are quoted based on what your business needs. Book a free consultation and we'll send you a clear quote." },
      { q: "Who owns the website and domain?", a: "You do. Your domain name is registered in your name." },
      { q: "Can my customers pay online?", a: "Online stores can accept card payments where supported, as well as bank transfer and cash on delivery." },
      { q: "How do updates work after launch?", a: "Send us your changes and our team will update your site. Regular updates are included in the RE5 Care Plan." },
      { q: "Are there any ongoing costs?", a: "Your domain name, hosting and any payment provider fees are separate from the build. The RE5 Care Plan covers hosting, security updates, backups, up to 2 content updates a month and support on WhatsApp." },
    ],
  },
  {
    id: "general",
    label: "General",
    items: [
      { q: "What is RE5 Agency?", a: "RE5 Agency is a Caribbean digital agency. We help businesses of every size get online, reach more customers and sell more, starting with websites, online stores and RE5 Digital pages." },
      { q: "What kinds of businesses do you work with?", a: "Small and growing businesses of all kinds, from restaurants, bars and bakeries to salons, boutiques, service providers and online sellers. If you have customers to reach, we can help." },
      { q: "Do I need to know exactly what I want?", a: "No. Many businesses come to us with a goal rather than a plan. We'll talk through what you're trying to achieve and recommend the right next step." },
      { q: "How do I get started?", a: "Send us a message through the contact form or tap Let's Talk Business. We'll set up a free consultation to learn about your business and recommend the right solution." },
      { q: "I don't have a logo, photos or wording yet. Can you still help?", a: "Yes. We work with what you have and guide you on the photos and information we need. If you're starting from scratch, we'll talk through the options in your consultation." },
      { q: "What do you need from me to get started?", a: "Your business details, your logo if you have one, photos, and your menu, services or product list with prices. We'll send you a simple checklist so nothing is missed." },
      { q: "How do I pay RE5?", a: "We take a 50% deposit to begin and the remaining 50% at launch. Payment is by bank transfer." },
      { q: "Do you only work with businesses in Trinidad and Tobago?", a: "We're based in Trinidad and Tobago and work with businesses across the Caribbean." },
    ],
  },
];
export const FAQ: QA[] = FAQ_GROUPS.flatMap((g) => g.items);
