const { chromium } = require('playwright');
const segs = ['beauty-hair','nail-supply','wholesale-supply','boutique-retail','fashion-boutique'];
(async () => {
  const b = await chromium.launch();
  for (const s of segs) {
    const p = await b.newPage();
    await p.goto('file://' + __dirname + '/' + s + '.html', { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.pdf({ path: __dirname + '/out/RE5-Demo-' + s + '.pdf', format: 'A4', printBackground: true, preferCSSPageSize: true });
    const pv = await b.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 1 });
    await pv.goto('file://' + __dirname + '/' + s + '.html', { waitUntil: 'networkidle' });
    await pv.evaluate(() => document.fonts.ready);
    await pv.screenshot({ path: __dirname + '/prev/' + s + '.png', fullPage: true });
  }
  await b.close();
})();
