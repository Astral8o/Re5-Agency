import type { Metadata } from "next";
import BlogChrome, { Mark } from "../Chrome";
import { POSTS } from "../posts";
import Planner from "../../tools/website-blueprint/Planner";
import "../../tools/website-blueprint/planner.css";

const post = POSTS.find((p) => p.slug === "build-your-own-portfolio-website-with-ai-for-free")!;
const url = `https://www.re5agency.com/blog/${post.slug}`;

export const metadata: Metadata = {
  title: `${post.title} | RE5 Agency`,
  description: post.description,
  alternates: { canonical: `/blog/${post.slug}` },
  openGraph: {
    type: "article",
    title: post.title,
    description: post.description,
    url,
    publishedTime: post.published,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: post.title, description: post.description },
};

const ARTICLE_LD = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: post.title,
  description: post.description,
  datePublished: post.published,
  articleSection: post.category,
  mainEntityOfPage: url,
  author: { "@type": "Organization", name: "RE5 Agency", url: "https://www.re5agency.com" },
  publisher: { "@type": "Organization", name: "RE5 Agency", url: "https://www.re5agency.com" },
};

export default function Article() {
  return (
    <BlogChrome>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_LD) }} />
      <section className="bl-hero">
        <div className="bl-hero-inner">
          <span className="bl-crumb bl-mono">
            <a href="/blog">RE5 Insights</a> · Article {post.number}
          </span>
          <h1>{post.title}</h1>
          <div className="bl-meta bl-mono">
            <span>{post.category}</span>
            <span>{post.readingTime}</span>
          </div>
          <div>
            <a href="#planner" className="bl-jump">
              Skip to the free Website Blueprint Planner ↓
            </a>
          </div>
        </div>
        <div className="bl-cover" style={{ background: post.cover }}>
          <Mark color="#F3F1EC" />
        </div>
      </section>

      <article className="bl-article">
        <p className="bl-lede">
          You do good work. Clients like it, friends recommend you, and your Instagram shows some of it. But when
          someone asks, &ldquo;Do you have a website?&rdquo;, you don&rsquo;t have an easy answer.
        </p>
        <p>
          A simple portfolio website gives people one place to see your work, understand what you offer and get in
          touch. For freelancers, creatives, consultants, speakers and independent professionals, it can be the
          difference between &ldquo;I&rsquo;ll think about it&rdquo; and &ldquo;When are you available?&rdquo;
        </p>
        <p>
          The good news is that you no longer need to know how to code, or have a large budget, to create one. AI
          website builders can now turn a written description into a working website in minutes.
        </p>
        <p>
          <strong>The catch is that AI can only work with what you give it.</strong> If you give it very little, it
          fills the gaps with generic wording, stock-style images and, sometimes, details that aren&rsquo;t true. If
          you give it your real story, your real work and your own photos, it can build something that actually feels
          like you.
        </p>
        <p>This guide shows you how to prepare, step by step, and then build your website with AI.</p>

        <h2>What Goes on a Portfolio Website?</h2>
        <p>
          You don&rsquo;t need lots of pages. For most independent professionals, a single scrolling page with a few
          clear sections is enough:
        </p>
        <ul className="bl-paths">
          <li>
            <strong>Hero:</strong>
            The first thing people see. A headline that explains what you do, a short introduction and one main button,
            such as View My Work or Contact Me.
          </li>
          <li>
            <strong>Portfolio:</strong>
            A few of your best projects, with photos and a short explanation of what you did.
          </li>
          <li>
            <strong>Services:</strong>
            What you offer, who it&rsquo;s for and what clients receive.
          </li>
          <li>
            <strong>About:</strong>
            A short, honest introduction to you and how you work.
          </li>
          <li>
            <strong>Credibility (optional):</strong>
            Real testimonials, qualifications or achievements, if you have them.
          </li>
          <li>
            <strong>Contact:</strong>
            The ways you&rsquo;re happy for people to reach you, such as email, WhatsApp, Instagram or LinkedIn.
          </li>
        </ul>
        <p>That&rsquo;s it. Simple websites are easier to build, easier to keep up to date and easier for visitors to use.</p>

        <h2>Prepare First, Then Build</h2>
        <p>
          It&rsquo;s tempting to open an AI website builder and type &ldquo;make me a portfolio website.&rdquo; You
          will get a website. It just won&rsquo;t be yours.
        </p>
        <p>
          A little preparation makes a big difference. Before you start, you&rsquo;ll want three things ready: your
          words, your images and an idea of how you want your website to look.
        </p>

        <h3>
          <span className="bl-num">01</span>Get Clear on What You Do and Who It&rsquo;s For
        </h3>
        <p>Answer these in plain language, the way you&rsquo;d explain your work to a friend:</p>
        <ul>
          <li>What do you do?</li>
          <li>Who do you usually work with?</li>
          <li>What do you enjoy most about your work?</li>
          <li>What makes your approach different?</li>
          <li>What do you want visitors to do after viewing your website?</li>
        </ul>
        <p>
          These answers become the foundation of everything else. If they&rsquo;re clear, your website will be clear
          too.
        </p>

        <h3>
          <span className="bl-num">02</span>Find Your Brand Voice
        </h3>
        <p>
          Your brand voice is how your personality comes through in your words. Are you warm and friendly? Calm and
          thoughtful? Bold and direct?
        </p>
        <p>
          Pick two or three words that describe how you want to come across, and note any words you love or would
          never use. This helps the AI write in a way that sounds like you, instead of sounding like everyone else.
        </p>

        <h3>
          <span className="bl-num">03</span>Write Your Content Before You Build
        </h3>
        <p>
          Draft your headline, a short introduction, your services and a few sentences about yourself. They
          don&rsquo;t need to be perfect. You can refine them later.
        </p>
        <p>
          For each portfolio project, note what it was, who it was for, what you personally contributed and, where you
          know it, the outcome.
        </p>
        <p>
          Only include what&rsquo;s true. A short, real testimonial is worth far more than an impressive one that
          isn&rsquo;t.
        </p>

        <h3>
          <span className="bl-num">04</span>Gather Your Best Photos
        </h3>
        <p>
          Choose a professional photo of yourself, a strong main image for the top of your website, your logo if you
          have one and a few images for each portfolio project.
        </p>
        <p>
          Use photos you own or have permission to use, and choose quality over quantity. A few strong images work
          better than many average ones.
        </p>

        <h3>
          <span className="bl-num">05</span>Choose a Visual Direction
        </h3>
        <p>
          Decide on the overall feel: minimal and clean, bold and expressive, editorial and elegant, or warm and
          personal. Pick one or two colours you like.
        </p>
        <p>
          It also helps to collect a few websites you admire. Look at how they arrange photos, use headings and
          organize content. You can use these ideas for inspiration without copying someone else&rsquo;s work.
        </p>

        <h3>
          <span className="bl-num">06</span>Choose Your AI Website Builder
        </h3>
        <p>There are several tools you can use. Three popular options are:</p>
        <ul className="bl-paths">
          <li>
            <strong>Wix:</strong>
            A website builder with AI tools to create a site from your answers, plus a visual editor for making changes
            yourself.
          </li>
          <li>
            <strong>Claude:</strong>
            An AI assistant that can create a website from a detailed brief. You may need a separate service to publish
            the website it creates.
          </li>
          <li>
            <strong>Lovable:</strong>
            An AI tool that builds websites and web apps from written instructions, with options to publish them.
          </li>
        </ul>
        <div className="bl-callout">
          <p>
            <strong>A note on &ldquo;free.&rdquo;</strong> Many AI website builders offer a free plan or free trial,
            but free plans usually come with limits. These can include platform branding on your website, a web address
            that includes the platform&rsquo;s name instead of your own domain, or limits on how much you can create or
            upload. Plans change often, so check each platform&rsquo;s current options before you commit.
          </p>
        </div>

        <h3>
          <span className="bl-num">07</span>Generate, Then Refine One Section at a Time
        </h3>
        <p>
          Start with a clear prompt that describes your work, your audience, the sections you need and the look you
          want. Ask the AI not to invent any information.
        </p>
        <p>
          Once your first version is ready, improve it one section at a time. For example: &ldquo;Update only the About
          section with the text below. Don&rsquo;t change anything else.&rdquo; Small, specific requests give you more
          control than asking the AI to redo everything.
        </p>

        <h2>Before You Publish</h2>
        <p>Take a few minutes to check:</p>
        <ul>
          <li>Does the website look good on your phone, as well as on a computer?</li>
          <li>Do all the buttons and links work, including your contact details?</li>
          <li>Are the spelling and wording correct?</li>
          <li>Are your photos in the right places?</li>
          <li>Is everything on the website true? Remove anything the AI added that you didn&rsquo;t provide.</li>
        </ul>
        <p>Then ask a friend or past client to look at it. A fresh pair of eyes often spots what you missed.</p>

        <h2>Let&rsquo;s Get Everything Ready</h2>
        <p>
          To make preparation easier, we created the free <strong>RE5 Website Blueprint Planner</strong>. It walks you
          through each step above: you&rsquo;ll find your brand voice, write your website content, add your photos and
          logo, and choose your visual style.
        </p>
        <p>
          At the end, you&rsquo;ll download your personalised Website Blueprint: a PDF with your content, your images
          and ready-to-use prompts for your AI website builder.
        </p>
        <p>
          It&rsquo;s free, there&rsquo;s no account to create, and your answers and photos stay in your browser.
        </p>
      </article>

      <section id="planner" className="bl-tool" aria-label="Website Blueprint Planner">
        <Planner />
        <p className="bl-tool-alt">
          Prefer more room? <a href="/tools/website-blueprint">Open the planner on its own page</a>.
        </p>
      </section>

      <section className="bl-close">
        <div className="bl-close-inner">
          <span className="bl-mono" style={{ color: "#A7C68C" }}>
            Want a Hand Building It?
          </span>
          <p>
            Your Website Blueprint gives you everything you need to build with AI. If you&rsquo;d rather have support,
            or you&rsquo;re ready for a website that does more, RE5 Agency can help you plan and build it, step by step.
          </p>
          <h2>
            Your Next Move <em>Starts Here.</em>
          </h2>
          <a href="/#contact">Let&rsquo;s Talk Business →</a>
        </div>
      </section>
    </BlogChrome>
  );
}
