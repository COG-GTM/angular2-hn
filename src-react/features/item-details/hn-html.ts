import { sanitizeHtml } from '../../shared/utils';

const HN_BASE_URL = 'https://news.ycombinator.com/';
const ABSOLUTE_HREF = /^[a-z][a-z0-9+.-]*:/i;

/**
 * `sanitizeHtml` plus HN-relative links (`item?id=123`) resolved against news.ycombinator.com, so they don't resolve
 * against the app's own `/item/:id` URL. `sanitizeHtml` only keeps relative hrefs that resolve to the HN origin.
 */
export function sanitizeHnHtml(html: string | null | undefined): string {
    const clean = sanitizeHtml(html);
    if (!clean.includes('href=')) return clean;
    const doc = new DOMParser().parseFromString(`<body>${clean}</body>`, 'text/html');
    let changed = false;
    doc.body.querySelectorAll('a[href]').forEach((link) => {
        const href = link.getAttribute('href') ?? '';
        if (ABSOLUTE_HREF.test(href)) return;
        try {
            link.setAttribute('href', new URL(href, HN_BASE_URL).href);
            changed = true;
        } catch {
            link.removeAttribute('href');
            changed = true;
        }
    });
    return changed ? doc.body.innerHTML : clean;
}
