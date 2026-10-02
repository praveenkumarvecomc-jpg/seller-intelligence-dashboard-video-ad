// Parallel deterministic frame renderer.
// usage: PAGE=index4.html FPS=60 WORKERS=4 SCALE=1 node render4.mjs <outDir> <startFrame> <endFrame> [step]
//        FRAMES="12 90 400" node render4.mjs <outDir>   (explicit list)
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
const [outDir, s = '0', e = '1800', step = '1'] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const FPS = +(process.env.FPS || 60), WORKERS = +(process.env.WORKERS || 4), SCALE = +(process.env.SCALE || 1);
const EXE = process.env.CHROME_PATH || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p));
const PORT = 8765 + Math.floor(Math.random() * 500);
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: process.cwd(), stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
const browser = await chromium.launch({ executablePath: EXE, args: ['--ignore-gpu-blocklist', '--disable-lcd-text', '--font-render-hinting=none'] });
const LIST = process.env.FRAMES ? process.env.FRAMES.trim().split(/\s+/).map(Number) : null;
const frames = LIST || Array.from({ length: Math.ceil((+e - +s) / +step) }, (_, i) => +s + i * +step);
const t0 = Date.now(); let done = 0;
async function worker(w) {
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: SCALE });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.text()); });
  page.on('pageerror', er => console.log('[pageerror]', er.message));
  await page.goto(`http://127.0.0.1:${PORT}/${process.env.PAGE || 'index4.html'}`);
  await page.waitForFunction(() => window.READY === true, null, { timeout: 90000 });
  const cdp = await ctx.newCDPSession(page);
  for (let i = w; i < frames.length; i += WORKERS) {
    const f = frames[i];
    await page.evaluate(t => window.renderAt(t), f / FPS);
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true, clip: { x: 0, y: 0, width: 1920, height: 1080, scale: 1 } });
    fs.writeFileSync(`${outDir}/f_${String(f).padStart(4, '0')}.png`, Buffer.from(data, 'base64'));
    if (++done % 120 === 0) console.log(`${done}/${frames.length}`, ((Date.now() - t0) / 1000).toFixed(1) + 's');
  }
}
await Promise.all(Array.from({ length: WORKERS }, (_, w) => worker(w)));
await browser.close(); srv.kill();
console.log('done', frames.length, 'frames', ((Date.now() - t0) / 1000).toFixed(1) + 's');
