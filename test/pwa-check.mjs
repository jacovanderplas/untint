// Checks that Untint works as an installed web app, using the Microsoft Edge already on this PC.
// Serves the app on localhost, then: service worker in control, no installability errors,
// a drag counts as a move, the game survives a reload, and it still loads with the server down and the browser offline.
// Run:  cd test && npm install && npm run pwa
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8766, URL = `http://127.0.0.1:${PORT}/`;
const EDGE = process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const SHOTS = path.join(ROOT, 'test', 'screens');
fs.mkdirSync(SHOTS, { recursive: true });

const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

function serve(){
  const p = spawn('python', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
  return p;
}

let server = serve();
await sleep(1200);
const userDataDir = fs.mkdtempSync(path.join(ROOT, 'test', '.profile-'));
const context = await chromium.launchPersistentContext(userDataDir, {
  executablePath: EDGE, headless: true,
  viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true
});
const errors = [];
const page = context.pages()[0] || await context.newPage();
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

try {
  await page.goto(URL);
  await page.waitForSelector('#cv');
  const swReady = await page.evaluate(() => navigator.serviceWorker.ready.then(r => !!r.active));
  await page.reload();
  const controlled = await page.evaluate(() => !!navigator.serviceWorker.controller);
  check('service worker active and in control after a reload', swReady && controlled);

  const cdp = await context.newCDPSession(page);
  const manifest = await cdp.send('Page.getAppManifest');
  const inst = await cdp.send('Page.getInstallabilityErrors');
  check('manifest loads without errors', manifest.errors.length === 0, manifest.errors.map(e => e.message).join('; '));
  check('no installability errors', inst.installabilityErrors.length === 0, inst.installabilityErrors.map(e => e.errorId).join(', '));

  // start a known puzzle: Beach day, 3x3, easy
  await page.click('#newBtn');
  await page.click('#segGrid [data-n="3"]');
  await page.click('#segDiff [data-diff="easy"]');
  await page.click('.pic[data-k="0"]');
  await page.click('#startBtn');
  const caption = await page.textContent('#sceneBtn');
  check('Beach day is the first picture', caption.startsWith('Beach day'), caption);

  const box = await page.locator('#stage').boundingBox();
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  await page.mouse.move(x, y); await page.mouse.down();
  await page.mouse.move(x, y + 10); await page.mouse.move(x, y + 40, { steps: 5 });
  await page.screenshot({ path: path.join(SHOTS, 'dragging.png') });
  await page.mouse.up();
  const moves = await page.textContent('#stMoves');
  check('a drag on the picture counts as one move', moves.trim() === '1 move', moves);
  const tabBefore = await page.textContent('#colTabs .tab:nth-child(2)');

  await page.reload();
  await page.waitForSelector('#cv');
  const movesAfter = await page.textContent('#stMoves');
  const tabAfter = await page.textContent('#colTabs .tab:nth-child(2)');
  check('game in progress survives closing and reopening', movesAfter.trim() === '1 move' && tabAfter === tabBefore, `${movesAfter}, column 2 at ${tabAfter}`);

  server.kill(); await sleep(600);
  await context.setOffline(true);
  await page.reload();
  await page.waitForSelector('#cv', { timeout: 8000 });
  const offline = await page.evaluate(() => ({ title: document.title, moves: document.getElementById('stMoves').textContent, painted: (() => { const d = document.getElementById('cv').getContext('2d').getImageData(360, 360, 1, 1).data; return d[3] === 255; })() }));
  check('loads offline with the server stopped', offline.title === 'Untint' && offline.painted, JSON.stringify(offline));
  await page.screenshot({ path: path.join(SHOTS, 'offline.png') });

  check('no script errors', errors.length === 0, errors.slice(0, 3).join(' | '));
} catch (e) {
  check('test run finished', false, String(e));
} finally {
  await context.close();
  server.kill();
  fs.rmSync(userDataDir, { recursive: true, force: true });
}
const failed = results.filter(r => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
