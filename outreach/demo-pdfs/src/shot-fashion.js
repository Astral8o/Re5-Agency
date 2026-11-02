const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 960, height: 600 }, deviceScaleFactor: 2 });
  for (const s of ['grid', 'modal', 'bag']) {
    await p.goto('file://' + __dirname + '/fashion-mock.html?s=' + s, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: __dirname + '/img/fashion-' + s + '.jpg', type: 'jpeg', quality: 88 });
  }
  await b.close();
})();
