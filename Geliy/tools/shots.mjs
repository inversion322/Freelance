// Кадры страницы: десктоп по экранам (900px шаг) и мобильный герой с верха страницы. Программный WebGL.
import puppeteer from 'puppeteer-core';
const [url, dir = '.review', waitMs = '7000'] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser', headless: true,
  args: ['--no-sandbox', '--hide-scrollbars', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] });
const errs = [];
const p = await b.newPage(); p.on('pageerror', (e) => errs.push(String(e).slice(0, 140))); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)); });
await p.setViewport({ width: 1440, height: 900 });
await p.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }); await new Promise((r) => setTimeout(r, Number(waitMs)));
await p.screenshot({ path: `${dir}/hero.png` });
const h = await p.evaluate(() => document.body.scrollHeight);
for (let i = 1, y = 900; y < h; y += 900, i++) { await p.evaluate((v) => window.scrollTo(0, v), y); await new Promise((r) => setTimeout(r, 600)); await p.screenshot({ path: `${dir}/page-${i}.png`, captureBeyondViewport: false }); }
const m = await b.newPage(); await m.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
await m.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }); await new Promise((r) => setTimeout(r, Number(waitMs)));
await m.evaluate(() => window.scrollTo(0, 0)); await m.screenshot({ path: `${dir}/mobile-hero.png` });
const mh = await m.evaluate(() => document.body.scrollHeight);
for (let i = 1, y = 844; y < Math.min(mh, 844 * 4); y += 844, i++) { await m.evaluate((v) => window.scrollTo(0, v), y); await new Promise((r) => setTimeout(r, 500)); await m.screenshot({ path: `${dir}/mobile-${i}.png`, captureBeyondViewport: false }); }
console.log(`высота: десктоп ${h}, мобильный ${mh}; ошибки: ${errs.length ? [...new Set(errs)].join(' | ') : 'нет'}`);
await b.close();
