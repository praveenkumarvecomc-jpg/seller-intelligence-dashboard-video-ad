// usage: node render.mjs <outDir> <startFrame> <endFrame> [step]
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
const [outDir, s = '0', e = '450', step = '1'] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const PORT = 8765 + Math.floor(Math.random() * 500);
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: process.cwd(), stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-webgl'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.text()); });
page.on('pageerror', e => console.log('[pageerror]', e.message));
await page.goto(`http://127.0.0.1:${PORT}/${process.env.PAGE || 'index.html'}`);
await page.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
const el = await page.$('#wrap');
const t0 = Date.now();
const LIST = process.env.FRAMES ? process.env.FRAMES.trim().split(/\s+/).map(Number) : null;
const frames = LIST || Array.from({length: Math.ceil((+e - +s) / +step)}, (_, i) => +s + i * +step);
for (const f of frames) {
  await page.evaluate(t => window.renderAt(t), f / (+process.env.FPS || 30));
  await el.screenshot({ path: `${outDir}/f_${String(f).padStart(4, '0')}.png` });
  if (f % 60 === 0) console.log('frame', f, ((Date.now() - t0) / 1000).toFixed(1) + 's');
}
await browser.close(); srv.kill();
console.log('done', ((Date.now() - t0) / 1000).toFixed(1) + 's');
