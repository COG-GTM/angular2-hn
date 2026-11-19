import json, os, sys
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image, ImageChops

OUT = Path('parity/feeds/report'); OUT.mkdir(parents=True, exist_ok=True)
RAW = Path('parity/feeds/raw'); RAW.mkdir(exist_ok=True)
CHROME = os.environ.get('CHROME_BIN') or None
APPS = {'legacy': 'http://localhost:4000', 'angular21': 'http://localhost:4200'}
PAGES = ['news/1', 'news/2', 'newest/1', 'show/1', 'ask/1', 'jobs/1']
VIEWPORTS = {'desktop': (1280, 900), 'mobile': (390, 844)}

EXTRACT = """() => {
  const root = document.querySelector('app-feed');
  const ol = root.querySelector('ol');
  const norm = s => s.replace(/\\s+/g, ' ').trim();
  return {
    start: ol && ol.start,
    count: root.querySelectorAll('li.post').length,
    jobHeader: norm(root.querySelector('.job-header')?.textContent || ''),
    items: [...root.querySelectorAll('li.post item')].map(i => ({
      title: norm(i.querySelector('a.title').textContent),
      href: i.querySelector('a.title').getAttribute('href'),
      laptop: norm(i.querySelector('.subtext-laptop').textContent),
    })),
    nav: [...root.querySelectorAll('.nav a')].map(a => [a.className.replace(/\\s*active\\s*/, '').trim(), norm(a.textContent), a.getAttribute('href')]),
  };
}"""

def run(selected_vps):
    results = {}
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=CHROME)
        for vp in selected_vps:
            w, h = VIEWPORTS[vp]
            for page_path in PAGES:
                data = {}
                for app, base in APPS.items():
                    ctx = b.new_context(viewport={'width': w, 'height': h}, color_scheme='light')
                    pg = ctx.new_page()
                    pg.add_init_script("window.ga = function(){};")
                    pg.goto(f'{base}/{page_path}')
                    pg.wait_for_selector('app-feed li.post', timeout=30000)
                    pg.wait_for_timeout(800)
                    data[app] = pg.evaluate(EXTRACT)
                    slug = page_path.replace('/', '-')
                    pg.locator('app-feed .main-content').screenshot(path=str(RAW / f'{vp}-{slug}-{app}.png'))
                    pg.screenshot(path=str(RAW / f'{vp}-{slug}-{app}-full.png'), full_page=False)
                    ctx.close()
                results[f'{vp} /{page_path}'] = data
        b.close()
    return results

def compose(vp, slug):
    l = Image.open(RAW / f'{vp}-{slug}-legacy.png').convert('RGB')
    r = Image.open(RAW / f'{vp}-{slug}-angular21.png').convert('RGB')
    h = min(l.height, r.height, 1300)
    l2, r2 = l.crop((0, 0, l.width, h)), r.crop((0, 0, r.width, h))
    gap = 16
    out = Image.new('RGB', (l2.width + r2.width + gap, h), (255, 0, 255))
    out.paste(l2, (0, 0)); out.paste(r2, (l2.width + gap, 0))
    out.save(OUT / f'{vp}-{slug}.png', optimize=True)
    if l.size == r.size:
        diff = ImageChops.difference(l, r).convert('L')
        changed = sum(1 for px in diff.get_flattened_data() if px > 16)
        return l.size, r.size, round(100 * changed / (l.width * l.height), 2)
    return l.size, r.size, None

if __name__ == '__main__':
    vps = sys.argv[1:] or list(VIEWPORTS)
    res = run(vps)
    summary = []
    for key, d in res.items():
        vp, path = key.split(' ')
        slug = path.strip('/').replace('/', '-')
        a, n = d['legacy'], d['angular21']
        ls, rs, pct = compose(vp, slug)
        same_struct = a['start'] == n['start'] and a['count'] == n['count'] and a['nav'] == n['nav'] and a['jobHeader'] == n['jobHeader']
        titles_same = [i['title'] for i in a['items']] == [i['title'] for i in n['items']]
        items_same = a['items'] == n['items']
        summary.append(dict(key=key, start=(a['start'], n['start']), count=(a['count'], n['count']), nav_same=a['nav'] == n['nav'], nav=n['nav'], job_header_same=a['jobHeader'] == n['jobHeader'], structure_same=same_struct, titles_same=titles_same, items_same=items_same, size=(ls, rs), diff_pct=pct))
        if not items_same:
            for x, y in zip(a['items'], n['items']):
                if x != y: print('  ITEM DIFF', key, x, '|', y); break
    json.dump(summary, open(OUT / 'summary.json', 'w'), indent=1)
    for s in summary: print(s)
