const { chromium } = require('playwright');
const segs = {'beauty-hair':'Hair-and-Beauty','nail-supply':'Nail-Supply','wholesale-supply':'Wholesale-and-Trade-Supply','boutique-retail':'Boutique-and-Retail','fashion-boutique':'Fashion-Boutique'};
(async () => {
  const b = await chromium.launch();
  for (const [s, name] of Object.entries(segs)) {
    const p = await b.newPage();
    await p.goto('file://' + __dirname + '/' + s + '-1p.html', { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.pdf({ path: __dirname + '/../RE5-OnePager-' + name + '.pdf', format: 'A4', printBackground: true, preferCSSPageSize: true });
  }
  await b.close();
})();
