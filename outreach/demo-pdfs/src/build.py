"""Build the four RE5 segment demo PDFs (HTML here, PDF via render.js)."""
import html, pathlib, segno
from PIL import Image

D = pathlib.Path(__file__).parent
IMG = D / "img"

# Crop the order panel from the nail concept for the "reorder" step.
Image.open(IMG / "nail-mock.jpg").crop((1290, 190, 1885, 1130)).save(IMG / "nail-order.jpg", quality=90)

WA = "https://wa.me/18687177720"
BOOK = "https://calendar.zoho.com/zc/view/slot-booking/0801123c0f30aaf2ed3e553add145be0000037b41a839607d7ef5ef11007a10c2a572457c0c3d619a3ad9b47cbe40200793ff715897a90084459d67037874b70"
SITE = "https://www.re5agency.com"
segno.make(WA, error="m").save(str(IMG / "qr-wa.svg"), scale=4, border=0, dark="#2a0f2e")

MARK = '<svg viewBox="6.5 5 87 84.3" class="mark" aria-hidden="true"><circle cx="50" cy="20" r="15"/><circle cx="78.5" cy="40.7" r="15"/><circle cx="67.6" cy="74.3" r="15"/><circle cx="32.4" cy="74.3" r="15"/><circle cx="21.5" cy="40.7" r="15"/></svg>'
LOGO = f'<span class="logo">{MARK}<span>RE<b>5</b> Agency</span></span>'

OPTIONS = [
    ("RE5 Digital", "Start online. Start simple.", "A branded, mobile-friendly page with your products, a personal link and QR code, and orders sent to you on WhatsApp."),
    ("Business Website", "Make a strong first impression.", "Up to five pages to showcase your range, with enquiry forms, WhatsApp and social links, and Google Maps."),
    ("eCommerce Website", "Make it easier to buy.", "An online store with catalogue, cart and checkout, order notifications, delivery or pickup, and payment where supported."),
]
APPROACH = [("Discovery", "We learn how you sell today"), ("Strategy", "We recommend what fits"), ("Development", "We build it with you"), ("Testing", "We check every step"), ("Launch", "We help your team and customers adopt it")]

SEGMENTS = {
    "beauty-hair": dict(
        title="RE5 Demo | Hair & Beauty",
        kicker="A website concept for hair and beauty businesses",
        head="Help shoppers find the right hair, shade and length, then order with confidence.",
        intro="Your customers already know what they want: a texture, a length, a colour. RE5 builds websites that let them see your full range in one place, build a complete order and come back for more, while you keep the delivery, pickup and payment methods you already use.",
        hero="img/hair-loop-poster.png",
        hero_cap="Lumière Hair Collection, a fictional demo website built by RE5 Agency.",
        benefits=[("Browse by texture, length and colour", "Every style shown with options and prices up front, so fewer back-and-forth messages."),
                  ("Complete orders in one place", "Customers add everything they need, choose delivery or pickup and send a clear order."),
                  ("Serve stylists and salons", "Trade accounts and wholesale pricing for the professionals who buy from you every month.")],
        steps=[("img/hair-grid.jpg", "wide", "Shop by texture", "Bundles, wigs and extensions with lengths and starting prices visible at a glance. Filters let shoppers jump straight to what they came for."),
               ("img/hair-tapein.jpg", "wide", "Spotlight new arrivals", "New collections and shade ranges get their own feature, with a button that opens a chat about colours and availability."),
               ("img/hair-wholesale.jpg", "wide", "Welcome trade customers", "Salons and stylists apply for a wholesale account online, so trade enquiries arrive with business details and order size already filled in.")],
        also="Also possible: class or appointment pages with dates and registration, branch and showroom details, skincare bundles, and reorder lists for regular customers.",
        questions=["How do customers choose hair or products today: in store, by DM or on WhatsApp?",
                   "Roughly how many styles, shades and lengths do you carry?",
                   "How much of your business comes from stylists, salons or resellers?",
                   "Which delivery, pickup and payment options do you offer now?"],
    ),
    "nail-supply": dict(
        title="RE5 Demo | Nail Supply",
        kicker="A website concept for nail supply businesses",
        head="Let technicians pick shades, build a restock and reorder in a few taps.",
        intro="Nail professionals buy by shade, size and quantity, and they come back for the same essentials again and again. RE5 builds online catalogues that make that easy for them and send you complete, itemised orders through the channels you already use.",
        hero="img/nail-mock.jpg",
        hero_cap="Lacquer & Co., a fictional concept illustration by RE5 Agency.",
        benefits=[("Shade swatches on every product", "Polish, pigments and powders shown with their colours, sizes and prices, ready to compare."),
                  ("Saved restocks and quick reorders", "Technicians and salons can repeat last month's order instead of starting from scratch."),
                  ("Complete orders on WhatsApp", "Each order arrives itemised with quantities, pickup or delivery and payment choice.")],
        steps=[("img/nail-order.jpg", "panel", "Reorder the usual restock", "A salon account remembers past orders. One tap brings back last month's restock to adjust and send."),
               ("img/dig-form.jpg", "phone", "Choose pickup or delivery", "Customers enter their details once, pick how they want to receive the order and how they will pay."),
               ("img/dig-wa.jpg", "phone", "The order lands in your WhatsApp", "You receive a clear, itemised message with totals and customer details, ready to confirm. Shown here on our RE5 Digital demo.")],
        also="Also possible: bulk and salon pricing, bundled starter kits, new-shade drops, class or workshop sign-ups and stock notes such as low or back in stock.",
        questions=["How do technicians place orders today: walk-in, WhatsApp, phone or DM?",
                   "Roughly how many products and shade or size variants do you carry?",
                   "What share of sales comes from salons and technicians who reorder regularly?",
                   "Do you offer delivery, and how is payment taken?"],
    ),
    "wholesale-supply": dict(
        title="RE5 Demo | Wholesale & Trade Supply",
        kicker="A website concept for wholesalers and trade suppliers",
        head="Give your trade customers a faster way to find products, request quotes and reorder.",
        intro="Shops, restaurants, offices and contractors want to check what you carry, see case sizes or pack options, and place repeat orders without waiting on a call back. RE5 builds supplier websites around how your team already sells, from a clear online catalogue to full trade ordering.",
        hero="img/hero-supplier.png",
        hero_cap="Harbourline Supply Co., a fictional supplier concept by RE5 Agency.",
        benefits=[("Shop by category", "Food, cleaning, packaging, foodservice or equipment ranges organised so buyers find items fast."),
                  ("Quotes and trade accounts", "Business customers request pricing or apply for an account, with their details captured up front."),
                  ("Structured repeat orders", "Orders arrive itemised by product and quantity, making them easier to pick, invoice and repeat.")],
        steps=[("img/hero-supplier.png", "wide", "A catalogue buyers can search", "Category browsing, product search and a clear Request a Quote path on desktop and mobile."),
               ("img/hair-wholesale.jpg", "wide", "Trade account applications", "Business customers apply online with business type and expected order size. Shown here on our hair wholesale demo; the same flow fits any trade supplier."),
               ("img/store-delivery.jpg", "wide", "Delivery or pickup at checkout", "Buyers choose delivery or collection and see totals before they confirm. Payment options can include bank transfer or cash on delivery.")],
        also="Already have a website? We can review what you have and look at adding product catalogues, quote requests, trade accounts or reorder lists to it.",
        questions=["How do business customers place orders today, and who takes them?",
                   "Roughly how many products, pack sizes or case options do you carry?",
                   "Do you use sales reps, and do customers have account pricing?",
                   "Which POS, inventory or accounting system do you use, and can it export a product list?"],
    ),
    "boutique-retail": dict(
        title="RE5 Demo | Boutique & Retail",
        kicker="A website concept for boutiques and specialty retailers",
        head="Turn followers into shoppers with collections they can browse, choose and buy.",
        intro="Your social pages already bring people in. RE5 builds online shops that let them browse every collection, pick sizes, colours or finishes and place an order, so interest from a post can become a sale without a long thread of messages.",
        hero="img/store-loop-poster.png",
        hero_pos_1p="center bottom",
        hero_cap="Island Heat, a fictional demo online store built by RE5 Agency.",
        benefits=[("Collections in one place", "New arrivals, featured looks and full ranges organised so shoppers do not need to scroll through posts."),
                  ("Options made clear", "Sizes, colours, finishes and prices shown on each product before anyone has to ask."),
                  ("A simple way to buy", "Cart, delivery or pickup and payment choice, or a reserve-and-collect request if that suits your store.")],
        steps=[("img/store-grid.jpg", "wide", "Browse and filter the range", "Shoppers filter by category and see prices, labels like New or Limited, and an Add to cart button on every item."),
               ("img/store-modal.jpg", "wide", "Product details and quantity", "Each product opens with a description, options and quantity before it goes into the cart."),
               ("img/store-placed.jpg", "wide", "Checkout your way", "Customers choose card, bank transfer or cash on delivery, with bundle savings and delivery shown in the total.")],
        also="Also possible: promotion and event pages, gift selection, workshop or class sign-ups, and orders sent to WhatsApp instead of a full checkout.",
        questions=["How do shoppers buy from you today: in store, Instagram DM or WhatsApp?",
                   "How often do new pieces or collections arrive?",
                   "Would you prefer full online checkout, or reserve and collect in store?",
                   "Which delivery and payment options do you already offer?"],
    ),
}

CSS = (D / "style.css").read_text()


def e(s):
    return html.escape(s, quote=True)


def page(seg):
    s = SEGMENTS[seg]
    ben = "".join(f'<div class="ben"><span class="num">0{i+1}</span><h3>{e(a)}</h3><p>{e(b)}</p></div>' for i, (a, b) in enumerate(s["benefits"]))
    steps = "".join(
        f'<div class="step {kind}"><figure><img src="{img}" alt=""></figure><div><span class="num">Step {i+1}</span><h3>{e(h)}</h3><p>{e(t)}</p></div></div>'
        for i, (img, kind, h, t) in enumerate(s["steps"]))
    opts = "".join(f'<div class="opt"><h4>{e(n)}</h4><em>{e(t)}</em><p>{e(d)}</p></div>' for n, t, d in OPTIONS)
    appr = "".join(f'<li><span>{i+1}</span><b>{e(a)}</b><small>{e(b)}</small></li>' for i, (a, b) in enumerate(APPROACH))
    qs = "".join(f"<li>{e(q)}</li>" for q in s["questions"])
    foot = f'<footer>{LOGO}<span>www.re5agency.com</span></footer>'
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><title>{e(s['title'])}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>
<section class="pg cover">
  <header>{LOGO}<span class="pill">Demo guide</span></header>
  <p class="kick">{e(s['kicker'])}</p>
  <h1>{e(s['head'])}</h1>
  <p class="lead">{e(s['intro'])}</p>
  <figure class="hero"><img src="{s['hero']}" alt=""><figcaption>{e(s['hero_cap'])}</figcaption></figure>
  <div class="bens">{ben}</div>
  {foot}
</section>
<section class="pg">
  <header>{LOGO}<span class="pill">How it could work</span></header>
  <h2>What your customers would see.</h2>
  <p class="sub">Screens from RE5 demo builds. Every business is different, so what we build is shaped around how you sell today.</p>
  <div class="steps">{steps}</div>
  <p class="also">{e(s['also'])}</p>
  {foot}
</section>
<section class="pg">
  <header>{LOGO}<span class="pill">Next steps</span></header>
  <h2>Options that fit how you sell.</h2>
  <div class="opts">{opts}</div>
  <p class="fine">Every option is quoted based on your needs, after a short discovery conversation.</p>
  <h2 class="h2b">How we work</h2>
  <ol class="appr">{appr}</ol>
  <div class="two">
    <div class="qs"><h3>What we would ask first</h3><ul>{qs}</ul></div>
    <div class="cta">
      <h3>Let's talk business!</h3>
      <p>Interested in exploring what could work for your business?</p>
      <a class="btn wa" href="{WA}">Message us on WhatsApp</a>
      <span class="tel">+1 868 717-7720</span>
      <a class="btn book" href="{BOOK}">Book a discovery conversation</a>
      <div class="qr"><img src="img/qr-wa.svg" alt=""><small>Scan to chat on WhatsApp</small></div>
    </div>
  </div>
  <p class="disc">Screens show fictional demo businesses created by RE5 Agency. Features shown are examples, not a fixed package. Hosting, domain, payment provider fees and maintenance are quoted separately.</p>
  <footer>{LOGO}<a href="{SITE}">www.re5agency.com</a></footer>
</section>
</body></html>"""


for seg in SEGMENTS:
    out = page(seg)
    assert "—" not in out and "cheap" not in out.lower(), seg
    (D / f"{seg}.html").write_text(out)
print("built", list(SEGMENTS))


def onepager(seg):
    s = SEGMENTS[seg]
    steps = "".join(
        f'<div class="ostep {kind}"><figure><img src="{img}" alt=""></figure><span class="num">Step {i+1}</span><h3>{e(h)}</h3><p>{e(t)}</p></div>'
        for i, (img, kind, h, t) in enumerate(s["steps"]))
    bens = "".join(f"<li><b>{e(a)}.</b> {e(b)}</li>" for a, b in s["benefits"])
    opts = " · ".join(n for n, _, _ in OPTIONS)
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><title>{e(s['title'])} (one page)</title>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>
<section class="pg cover one">
  <header>{LOGO}<span class="pill">Demo guide</span></header>
  <p class="kick">{e(s['kicker'])}</p>
  <h1>{e(s['head'])}</h1>
  <p class="lead">{e(s['intro'])}</p>
  <figure class="hero"><img src="{s['hero']}" alt="" style="object-position:{s.get('hero_pos_1p','top center')}"><figcaption>{e(s['hero_cap'])}</figcaption></figure>
  <div class="osteps">{steps}</div>
  <div class="otwo">
    <div><h3>Why it helps</h3><ul class="obens">{bens}</ul><p class="oopts"><b>Options:</b> {e(opts)}. Every option is quoted based on your needs.</p></div>
    <div class="cta">
      <h3>Let's talk business!</h3>
      <a class="btn wa" href="{WA}">Message us on WhatsApp</a>
      <span class="tel">+1 868 717-7720</span>
      <a class="btn book" href="{BOOK}">Book a discovery conversation</a>
      <div class="qr"><img src="img/qr-wa.svg" alt=""><small>Scan to chat on WhatsApp</small></div>
    </div>
  </div>
  <p class="disc">Screens show fictional demo businesses created by RE5 Agency. Features shown are examples, not a fixed package.</p>
  <footer>{LOGO}<a href="{SITE}">www.re5agency.com</a></footer>
</section></body></html>"""


for seg in SEGMENTS:
    out = onepager(seg)
    assert "—" not in out and "cheap" not in out.lower(), seg
    (D / f"{seg}-1p.html").write_text(out)
print("built one-pagers")
