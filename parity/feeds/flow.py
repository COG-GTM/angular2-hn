from playwright.sync_api import sync_playwright
import os
CHROME=os.environ.get('CHROME_BIN') or None
RAW='parity/feeds/raw'
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=CHROME)
    for name, base in [('legacy','http://localhost:4000'),('angular21','http://localhost:4200')]:
        pg=b.new_page(viewport={'width':1280,'height':900}); pg.add_init_script("window.ga=function(){}")
        pg.goto(base+'/news/1'); pg.wait_for_selector('app-feed li.post')
        first1=pg.locator('app-feed a.title').first.inner_text()
        pg.mouse.wheel(0,3000); pg.wait_for_timeout(300)
        pg.click('app-feed .nav .more'); pg.wait_for_url('**/news/2'); pg.wait_for_function("document.querySelector('app-feed ol').start===31")
        y=pg.evaluate('window.scrollY'); first2=pg.locator('app-feed a.title').first.inner_text()
        pg.click('app-feed .nav .prev'); pg.wait_for_url('**/news/1'); pg.wait_for_function("document.querySelector('app-feed ol').start===1")
        back=pg.locator('app-feed a.title').first.inner_text()
        # self post opens item route
        pg.goto(base+'/ask/1'); pg.wait_for_selector('app-feed li.post')
        href=pg.locator('app-feed a.title').first.get_attribute('href')
        # error state
        ctx=b.new_context(viewport={'width':1280,'height':900}); e=ctx.new_page(); e.add_init_script("window.ga=function(){}")
        e.route('**/node-hnapi.herokuapp.com/**', lambda r: r.abort())
        e.goto(base+'/newest/1'); e.wait_for_selector('app-error-message .strong', timeout=15000)
        err=e.locator('app-error-message .strong').inner_text()
        e.locator('app-feed .main-content').screenshot(path=f'{RAW}/desktop-error-{name}.png'); ctx.close()
        print(name, dict(page1_first=first1[:30], page2_first=first2[:30], scrollY_after_more=y, back_to_page1=back==first1, ask_href=href, error=err))
