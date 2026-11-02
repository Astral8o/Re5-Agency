const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 960, height: 600 }, deviceScaleFactor: 2 });
  await p.goto('file://' + __dirname + '/nail-mock.html', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: __dirname + '/img/nail-mock.jpg', type: 'jpeg', quality: 88 });
  await b.close();
})();
