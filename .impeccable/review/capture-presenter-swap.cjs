const { chromium } = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
  const results = [];
  const captureName = process.env.QA_CAPTURE_NAME || 'hero-cardigan';
  const views = process.env.QA_CONFIRM ? [[1440, 'light', 'no-preference'], [390, 'dark', 'reduce']] : [[1440, 'light', 'reduce'], [1440, 'dark', 'reduce'], [390, 'light', 'reduce'], [320, 'dark', 'reduce'], [1100, 'light', 'reduce'], [768, 'light', 'reduce']];
  for (const [width, theme, reducedMotion] of views) {
    const context = await browser.newContext({ viewport: { width, height: width < 1024 ? 1100 : 900 }, colorScheme: theme, reducedMotion });
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    await page.addInitScript(theme => localStorage.setItem('theme', theme), theme);
    const errors = [];
    const warnings = [];
    page.on('pageerror', error => errors.push(error.stack || error.message));
    page.on('console', message => { if (['warning', 'error'].includes(message.type())) warnings.push(message.text()); });
    await page.goto(process.env.QA_BASE_URL || 'http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.locator('#top img').first().waitFor();
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    await page.waitForFunction(() => [...document.querySelectorAll('#top img')].filter(image => image.src.includes('hero-presenter-casual')).every(image => image.complete && image.naturalWidth > 0), null, { timeout: 20000 });
    await page.waitForTimeout(1000);
    const geometry = await page.locator('#top').evaluate(hero => {
      const images = [...hero.querySelectorAll('img')];
      const preview = hero.querySelector('figure');
      const model = images[0];
      const heroBounds = hero.getBoundingClientRect();
      const description = hero.querySelector('[data-hero-entrance="description"]');
      const textStyle = getComputedStyle(description);
      const copy = [...hero.querySelectorAll('[data-hero-entrance]')].filter(element => element.dataset.heroEntrance !== 'scene').map(element => ({ kind: element.dataset.heroEntrance, font: getComputedStyle(element).fontFamily, marginTop: getComputedStyle(element).marginTop, marginBottom: getComputedStyle(element).marginBottom, height: element.getBoundingClientRect().height }));
      return { overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth), images: images.map(image => ({ src: image.currentSrc, width: image.getBoundingClientRect().width, height: image.getBoundingClientRect().height, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight })), fonts: [...document.fonts].map(font => ({family: font.family, status: font.status})), copy, descriptionLines: Math.round(description.getBoundingClientRect().height / parseFloat(textStyle.lineHeight)), heroHeight: heroBounds.height, phoneTop: getComputedStyle(preview).top, phoneFits: preview.getBoundingClientRect().bottom <= heroBounds.bottom, modelZ: getComputedStyle(model).zIndex, modelClip: getComputedStyle(model).clipPath, dark: document.documentElement.classList.contains('dark'), progressDisplay: getComputedStyle(document.querySelector('.motion-reduce\\:hidden')).display };
    });
    await page.locator('#top').screenshot({ path: path.join(__dirname, `${captureName}-${width}-${theme}.png`), timeout: 20000 });
    console.log('Captured', width, theme);
    results.push({ width, theme, reducedMotion, errors, warnings, ...geometry });
    await context.close();
  }
  fs.writeFileSync(path.join(__dirname, `${captureName}-${process.env.QA_CONFIRM ? 'confirmation' : 'review'}.json`), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
