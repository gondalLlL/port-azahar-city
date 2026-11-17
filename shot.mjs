import { spawn } from 'node:child_process';
import { readFileSync, mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

async function main() {
  mkdirSync('screenshots', { recursive: true });

  // Start server
  const serverProc = spawn('node', ['serve.ts', '--port', '8124'], { stdio: 'inherit' });
  await new Promise(r => setTimeout(r, 2000)); // wait for server to start

  const shots = JSON.parse(readFileSync('shots.json', 'utf-8'));
  const browser = await chromium.launch({
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--headless']
  });

  const results = [];
  const errors = [];

  for (const shot of shots) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push({ shot: shot.name, text: msg.text() });
    });
    page.on('pageerror', err => {
      errors.push({ shot: shot.name, text: err.message });
    });

    const url = `http://localhost:8124/${shot.query}`;
    await page.goto(url, { waitUntil: 'networkidle' });

    // Wait for window.__shotReady
    try {
      await page.waitForFunction(() => window.__shotReady === true, { timeout: 10000 });
    } catch (e) {
      errors.push({ shot: shot.name, text: 'Timeout waiting for __shotReady' });
    }

    // Extra frame settle
    await page.waitForTimeout(500);

    const outPath = join('screenshots', shot.name);
    let quality = 80;
    await page.screenshot({ path: outPath, type: 'jpeg', quality });

    let stats = statSync(outPath);
    if (stats.size > 262144) {
      quality = 60;
      await page.screenshot({ path: outPath, type: 'jpeg', quality });
      stats = statSync(outPath);
    }

    results.push({ name: shot.name, size: stats.size, quality });
    await page.close();
  }

  // Test plain game load once
  const page = await browser.newPage();
  let homeError = false;
  page.on('pageerror', () => { homeError = true; });
  await page.goto('http://localhost:8124/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.close();

  await browser.close();
  serverProc.kill();

  console.log(JSON.stringify({ results, errors, homeError }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
