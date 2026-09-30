/**
 * Pixel + DOM parity check between the legacy Angular app (OLD_URL) and the React port (NEW_URL).
 *
 * Both apps are driven with Playwright against the same recorded API fixtures (parity/fixtures), so the
 * only variable is the rendering. For every scenario/viewport we capture a full-page screenshot and a
 * computed-style snapshot of every element under <app-root>, then diff both.
 *
 *   OLD_URL=http://127.0.0.1:4200 NEW_URL=http://127.0.0.1:5173 npm run parity
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const OLD_URL = process.env.OLD_URL || 'http://127.0.0.1:4200';
const NEW_URL = process.env.NEW_URL || 'http://127.0.0.1:5173';
const CHROME_PATH = process.env.CHROME_PATH;
const PIXEL_THRESHOLD = Number(process.env.PIXEL_THRESHOLD || 0.1);
const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const API_HOST = 'node-hnapi.herokuapp.com';

const fixturesDir = path.join(here, 'fixtures');
const reportDir = path.join(here, 'report');
const ids = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'ids.json'), 'utf8'));

const viewports = {
    desktop: { width: 1280, height: 800 },
    mobile: { width: 375, height: 667 },
};

/** @type {Array<{name: string, path: string, viewports?: string[], storage?: Record<string,string>, api?: (p: string) => ({status:number, body:string}|'hang'|null), act?: (page: import('playwright').Page) => Promise<void>, waitLoader?: boolean}>} */
const scenarios = [
    { name: 'news-p1', path: '/news/1' },
    { name: 'news-p2', path: '/news/2' },
    { name: 'root-redirect', path: '/' },
    { name: 'newest', path: '/newest/1' },
    { name: 'show', path: '/show/1' },
    { name: 'ask', path: '/ask/1' },
    { name: 'jobs', path: '/jobs/1' },
    { name: 'item-story', path: `/item/${ids.story}` },
    { name: 'item-ask', path: `/item/${ids.ask}` },
    { name: 'item-poll', path: `/item/${ids.poll}` },
    { name: 'user', path: `/user/${ids.user}` },
    { name: 'news-night', path: '/news/1', storage: { theme: 'night' } },
    { name: 'news-amoled', path: '/news/1', storage: { theme: 'amoledblack' } },
    { name: 'item-night', path: `/item/${ids.story}`, storage: { theme: 'night' } },
    { name: 'user-amoled', path: `/user/${ids.user}`, storage: { theme: 'amoledblack' } },
    { name: 'news-font-spacing', path: '/news/1', storage: { titleFontSize: '22', listSpacing: '12' } },
    { name: 'news-newtab', path: '/news/1', storage: { openLinkInNewTab: 'true' } },
    { name: 'settings-open', path: '/news/1', act: (page) => page.click('img.settings') },
    {
        name: 'settings-pick-night',
        path: '/news/1',
        act: async (page) => {
            await page.click('img.settings');
            await page.click('input[value="night"]');
        },
    },
    {
        name: 'settings-newtab-toggle',
        path: '/news/1',
        act: async (page) => {
            await page.click('img.settings');
            await page.click('input[type="checkbox"]');
            await page.click('.close');
        },
    },
    {
        name: 'comment-collapse',
        path: `/item/${ids.story}`,
        act: (page) => page.click('app-comment .collapse >> nth=0'),
    },
    {
        name: 'nav-to-show',
        path: '/news/1',
        act: async (page) => {
            await page.click('.header-nav a[href="/show/1"]');
            await page.waitForSelector('app-loader', { state: 'detached' });
        },
    },
    {
        name: 'nav-more-prev',
        path: '/news/1',
        act: async (page) => {
            await page.click('.nav a.more');
            await page.waitForSelector('ol[start="31"]');
            await page.click('.nav a.prev');
            await page.waitForSelector('ol[start="1"]');
        },
    },
    {
        name: 'feed-error',
        path: '/ask/1',
        api: () => ({ status: 500, body: 'boom' }),
    },
    {
        name: 'item-error',
        path: `/item/${ids.story}`,
        api: () => ({ status: 500, body: 'boom' }),
    },
    {
        name: 'user-error',
        path: '/user/nobody',
        api: () => ({ status: 404, body: 'Cannot GET /user/nobody' }),
    },
    { name: 'feed-loading', path: '/news/1', api: () => 'hang', waitLoader: false },
    { name: 'item-loading', path: `/item/${ids.story}`, api: () => 'hang', waitLoader: false },
];

function fixtureFor(url) {
    const u = new URL(url);
    const key = (u.pathname.replace(/^\//, '') + u.search).replace(/[/?=]/g, '_');
    const file = path.join(fixturesDir, `${key}.json`);
    if (fs.existsSync(file)) return { status: 200, body: fs.readFileSync(file, 'utf8') };
    return { status: 404, body: `<pre>Cannot GET ${u.pathname}</pre>` };
}

const STYLE_PROPS = [
    'display', 'position', 'float', 'visibility', 'opacity', 'z-index', 'box-sizing',
    'color', 'background-color', 'background-image',
    'font-size', 'font-family', 'font-weight', 'font-style', 'letter-spacing', 'line-height', 'text-align',
    'text-decoration-line', 'text-indent', 'text-overflow', 'white-space', 'word-wrap', 'cursor',
    'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'border-top', 'border-right', 'border-bottom', 'border-left', 'border-radius',
    'width', 'height', 'top', 'left', 'right', 'bottom', 'transform', 'overflow',
];

function domSnapshot(styleProps) {
    const root = document.querySelector('app-root');
    const out = [];
    const walk = (el, pathParts) => {
        const cs = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        const text = Array.from(el.childNodes)
            .filter((n) => n.nodeType === Node.TEXT_NODE)
            .map((n) => n.textContent.replace(/\s+/g, ' '))
            .join('¦');
        const attrs = {};
        for (const a of ['href', 'target', 'rel', 'start', 'type', 'name', 'alt', 'hidden']) {
            if (el.hasAttribute(a)) attrs[a] = el.getAttribute(a);
        }
        const relative = (u) => (u ? u.replace(location.origin, '') : u);
        if (el instanceof HTMLImageElement) attrs.src = relative(el.currentSrc || el.src);
        if (el instanceof HTMLAnchorElement) attrs.href = relative(el.href);
        if (el instanceof HTMLInputElement) {
            attrs.value = el.value;
            attrs.checked = String(el.checked);
        }
        const styles = {};
        for (const p of styleProps) styles[p] = cs.getPropertyValue(p);
        const tag = el.tagName.toLowerCase();
        out.push({
            path: pathParts.join('>'),
            tag,
            classes: Array.from(el.classList).filter((c) => !c.startsWith('ng-')).sort().join(' '),
            text,
            attrs,
            rect: [rect.x, rect.y, rect.width, rect.height].map((v) => Math.round(v * 10) / 10),
            styles,
        });
        let i = 0;
        for (const child of el.children) {
            if (child.tagName === 'SCRIPT' || child.tagName === 'STYLE') continue;
            walk(child, [...pathParts, `${child.tagName.toLowerCase()}[${i++}]`]);
        }
    };
    walk(root, ['app-root']);
    return out;
}

function diffSnapshots(a, b) {
    const diffs = [];
    if (a.length !== b.length) diffs.push(`element count differs: old=${a.length} new=${b.length}`);
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) {
        const x = a[i];
        const y = b[i];
        const where = `${x.path}${x.classes ? ' .' + x.classes.replace(/ /g, '.') : ''}`;
        if (x.tag !== y.tag) {
            diffs.push(`${where}: tag <${x.tag}> vs <${y.tag}> (${y.path})`);
            break; // structure diverged, further comparisons are noise
        }
        if (x.classes !== y.classes) diffs.push(`${where}: classes "${x.classes}" vs "${y.classes}"`);
        if (x.text !== y.text) diffs.push(`${where}: text ${JSON.stringify(x.text)} vs ${JSON.stringify(y.text)}`);
        for (const k of new Set([...Object.keys(x.attrs), ...Object.keys(y.attrs)])) {
            if (x.attrs[k] !== y.attrs[k]) diffs.push(`${where}: attr ${k} ${JSON.stringify(x.attrs[k])} vs ${JSON.stringify(y.attrs[k])}`);
        }
        if (x.rect.some((v, j) => Math.abs(v - y.rect[j]) > 0.5)) diffs.push(`${where}: rect ${x.rect} vs ${y.rect}`);
        for (const p of Object.keys(x.styles)) {
            if (x.styles[p] !== y.styles[p]) diffs.push(`${where}: ${p} "${x.styles[p]}" vs "${y.styles[p]}"`);
        }
    }
    return diffs;
}

function readPng(file) {
    return PNG.sync.read(fs.readFileSync(file));
}

function padTo(png, width, height) {
    if (png.width === width && png.height === height) return png;
    const out = new PNG({ width, height, fill: true });
    out.data.fill(0);
    PNG.bitblt(png, out, 0, 0, png.width, png.height, 0, 0);
    return out;
}

function comparePngs(oldFile, newFile, diffFile) {
    const a = readPng(oldFile);
    const b = readPng(newFile);
    const width = Math.max(a.width, b.width);
    const height = Math.max(a.height, b.height);
    const pa = padTo(a, width, height);
    const pb = padTo(b, width, height);
    const diff = new PNG({ width, height });
    const mismatched = pixelmatch(pa.data, pb.data, diff.data, width, height, { threshold: PIXEL_THRESHOLD });
    fs.writeFileSync(diffFile, PNG.sync.write(diff));
    return {
        mismatched,
        total: width * height,
        sizeMatch: a.width === b.width && a.height === b.height,
        oldSize: `${a.width}x${a.height}`,
        newSize: `${b.width}x${b.height}`,
    };
}

async function capture(browser, baseUrl, scenario, viewportName, outPrefix) {
    const context = await browser.newContext({
        viewport: viewports[viewportName],
        colorScheme: 'light',
        reducedMotion: 'reduce',
    });
    await context.route(
        (url) => url.hostname === API_HOST,
        async (route) => {
            const url = route.request().url();
            const override = scenario.api ? scenario.api(new URL(url).pathname) : null;
            if (override === 'hang') return; // never respond → loader stays visible
            const res = override || fixtureFor(url);
            await route.fulfill({
                status: res.status,
                body: res.body,
                headers: { 'content-type': res.status === 200 ? 'application/json' : 'text/html', 'access-control-allow-origin': '*' },
            });
        }
    );
    // Google Analytics is not part of the UI under test.
    await context.route(/google-analytics\.com/, (route) => route.fulfill({ status: 200, body: '' }));
    const storage = { theme: 'default', ...(scenario.storage || {}) };
    await context.addInitScript((entries) => {
        for (const [k, v] of Object.entries(entries)) localStorage.setItem(k, v);
    }, storage);

    const page = await context.newPage();
    const consoleErrors = [];
    page.on('pageerror', (err) => consoleErrors.push(String(err)));
    // A hanging API request never reaches networkidle, so loading scenarios only wait for the load event.
    await page.goto(baseUrl + scenario.path, { waitUntil: scenario.waitLoader === false ? 'load' : 'networkidle' });
    await page.waitForSelector('app-root > div');
    if (scenario.waitLoader !== false) {
        await page.waitForSelector('app-loader', { state: 'detached', timeout: 15000 });
    } else {
        await page.waitForSelector('app-loader');
    }
    if (scenario.act) {
        await scenario.act(page);
        await page.waitForLoadState('networkidle');
    }
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400); // let 0.2s CSS transitions settle
    const shot = `${outPrefix}.png`;
    await page.screenshot({ path: shot, fullPage: true, animations: 'disabled', caret: 'hide', timeout: 120000 });
    const snapshot = await page.evaluate(domSnapshot, STYLE_PROPS);
    const url = page.url();
    await context.close();
    return { shot, snapshot, url, consoleErrors };
}

async function main() {
    fs.rmSync(reportDir, { recursive: true, force: true });
    fs.mkdirSync(reportDir, { recursive: true });
    const browser = await chromium.launch({ headless: true, executablePath: CHROME_PATH || undefined });
    const results = [];
    for (const scenario of scenarios) {
        if (ONLY && !ONLY.test(scenario.name)) continue;
        for (const viewportName of scenario.viewports || Object.keys(viewports)) {
            const id = `${scenario.name}--${viewportName}`;
            let oldRes;
            let newRes;
            try {
                oldRes = await capture(browser, OLD_URL, scenario, viewportName, path.join(reportDir, `${id}--old`));
                newRes = await capture(browser, NEW_URL, scenario, viewportName, path.join(reportDir, `${id}--new`));
            } catch (err) {
                console.log(`FAIL ${id.padEnd(36)} ${String(err).split('\n')[0]}`);
                results.push({ id, scenario: scenario.name, viewport: viewportName, mismatched: -1, total: 1, pct: 100, oldSize: '?', newSize: '?', domDiffs: [`capture failed: ${String(err).split('\n')[0]}`], newErrors: [], oldErrors: [] });
                continue;
            }
            const px = comparePngs(oldRes.shot, newRes.shot, path.join(reportDir, `${id}--diff.png`));
            const domDiffs = diffSnapshots(oldRes.snapshot, newRes.snapshot);
            const oldPath = new URL(oldRes.url).pathname;
            const newPath = new URL(newRes.url).pathname;
            if (oldPath !== newPath) domDiffs.unshift(`final URL path differs: ${oldPath} vs ${newPath}`);
            const pct = (px.mismatched / px.total) * 100;
            results.push({ id, scenario: scenario.name, viewport: viewportName, ...px, pct, domDiffs, newErrors: newRes.consoleErrors, oldErrors: oldRes.consoleErrors });
            const status = px.mismatched === 0 && domDiffs.length === 0 ? 'OK  ' : 'DIFF';
            console.log(`${status} ${id.padEnd(36)} px=${px.mismatched} (${pct.toFixed(3)}%) size ${px.oldSize} vs ${px.newSize} domDiffs=${domDiffs.length}`);
            for (const d of domDiffs.slice(0, 12)) console.log(`       - ${d}`);
            if (domDiffs.length > 12) console.log(`       ... ${domDiffs.length - 12} more`);
            if (newRes.consoleErrors.length) console.log(`       new-app page errors: ${newRes.consoleErrors.join(' | ')}`);
        }
    }
    await browser.close();
    writeReport(results);
    const failed = results.filter((r) => r.mismatched > 0 || r.domDiffs.length > 0);
    console.log(`\n${results.length - failed.length}/${results.length} scenarios pixel- and DOM-identical.`);
    fs.writeFileSync(path.join(reportDir, 'results.json'), JSON.stringify(results, null, 2));
    process.exitCode = failed.length ? 1 : 0;
}

function writeReport(results) {
    const rows = results
        .map(
            (r) => `| ${r.scenario} | ${r.viewport} | ${r.oldSize} / ${r.newSize} | ${r.mismatched} (${r.pct.toFixed(3)}%) | ${r.domDiffs.length} | ${r.mismatched === 0 && r.domDiffs.length === 0 ? '✅' : '❌'} |`
        )
        .join('\n');
    const md = `# Angular → React pixel parity report

Old app: ${OLD_URL}  •  New app: ${NEW_URL}  •  pixelmatch threshold: ${PIXEL_THRESHOLD}

| Scenario | Viewport | Size old / new | Mismatched pixels | DOM/style diffs | Result |
|---|---|---|---|---|---|
${rows}

${results.filter((r) => r.domDiffs.length).map((r) => `## ${r.id}\n\n${r.domDiffs.map((d) => `- ${d}`).join('\n')}`).join('\n\n')}
`;
    fs.writeFileSync(path.join(reportDir, 'REPORT.md'), md);
    const cards = results
        .map(
            (r) => `<section class="${r.mismatched === 0 && r.domDiffs.length === 0 ? 'ok' : 'bad'}">
<h2>${r.id} — ${r.mismatched} px (${r.pct.toFixed(3)}%), ${r.domDiffs.length} DOM diffs</h2>
<div class="row"><figure><figcaption>Angular</figcaption><img src="${r.id}--old.png"></figure>
<figure><figcaption>React</figcaption><img src="${r.id}--new.png"></figure>
<figure><figcaption>Diff</figcaption><img src="${r.id}--diff.png"></figure></div>
${r.domDiffs.length ? `<pre>${r.domDiffs.join('\n')}</pre>` : ''}
</section>`
        )
        .join('\n');
    fs.writeFileSync(
        path.join(reportDir, 'index.html'),
        `<!doctype html><meta charset="utf-8"><title>Parity report</title>
<style>body{font-family:sans-serif;margin:20px}section{border:1px solid #ccc;margin:20px 0;padding:10px}section.ok h2{color:#2a7}section.bad h2{color:#c33}.row{display:flex;gap:10px}figure{margin:0;flex:1;min-width:0}img{width:100%;border:1px solid #ddd}pre{background:#f6f6f6;padding:8px;overflow:auto}</style>
<h1>Angular → React parity report</h1>${cards}`
    );
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
