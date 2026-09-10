// Кадры сцены по стадиям скролла: progress = scrollY / vh. Ждём сглаживание прогресса (lerp 0.09 при 60 Гц ≈ 1,5 с).
import puppeteer from 'puppeteer-core';
const [url, dir = '.review'] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser', headless: true,
  args: ['--no-sandbox', '--hide-scrollbars', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] });
const errs = []; const p = await b.newPage();
p.on('pageerror', (e) => errs.push(String(e).slice(0, 160))); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });
await p.setViewport({ width: 1440, height: 900 });
const t0 = Date.now(); await p.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
await p.waitForFunction(() => !document.querySelector('.loader'), { timeout: 30000 }).catch(() => errs.push('лоадер не ушёл за 30 с'));
console.log('лоадер ушёл через', ((Date.now() - t0) / 1000).toFixed(1), 'с');
await new Promise((r) => setTimeout(r, 3500)); await p.screenshot({ path: `${dir}/s-hero.png` });
await p.mouse.move(700, 450); await new Promise((r) => setTimeout(r, 300)); await p.mouse.move(400, 500, { steps: 8 }); await new Promise((r) => setTimeout(r, 600)); await p.screenshot({ path: `${dir}/s-hero-cursor.png` });
for (const pr of [0.9, 1.3, 2.2, 2.6, 3.2, 3.6, 4.4, 5.2, 6.2]) {
  await p.evaluate((v) => window.scrollTo(0, v * window.innerHeight), pr); await new Promise((r) => setTimeout(r, 2600));
  await p.screenshot({ path: `${dir}/s-${pr}.png` });
}
const h = await p.evaluate(() => document.body.scrollHeight / window.innerHeight); console.log('высота страницы, экранов:', h.toFixed(1));
// шторка палитр
await p.evaluate(() => window.scrollTo(0, 0)); await new Promise((r) => setTimeout(r, 1200));
await p.click('button[aria-label="Палитра события"]'); await new Promise((r) => setTimeout(r, 800)); await p.screenshot({ path: `${dir}/s-drawer.png` });
await p.click('.theme-card:nth-child(2)'); await new Promise((r) => setTimeout(r, 3500)); await p.screenshot({ path: `${dir}/s-theme-blush.png` });
const fps = await p.evaluate(() => new Promise((res) => { let n = 0; const t = performance.now(); const f = () => { n++; if (performance.now() - t < 2000) requestAnimationFrame(f); else res(n / 2); }; requestAnimationFrame(f); }));
console.log('кадров/с (программный рендер):', fps.toFixed(0), '· ошибки:', errs.length ? [...new Set(errs)].join(' | ') : 'нет');
await b.close();
