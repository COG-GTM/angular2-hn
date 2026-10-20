const ALLOWED_TAGS = new Set([
    'A',
    'B',
    'BLOCKQUOTE',
    'BR',
    'CODE',
    'DEL',
    'EM',
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'HR',
    'I',
    'LI',
    'OL',
    'P',
    'PRE',
    'S',
    'SPAN',
    'STRONG',
    'SUB',
    'SUP',
    'U',
    'UL',
]);

/** Removed together with their content; any other unknown element is unwrapped (children kept). */
const DROPPED_TAGS = new Set([
    'SCRIPT',
    'STYLE',
    'IFRAME',
    'FRAME',
    'FRAMESET',
    'OBJECT',
    'EMBED',
    'APPLET',
    'TEMPLATE',
    'NOSCRIPT',
    'SVG',
    'MATH',
    'LINK',
    'META',
    'BASE',
    'TITLE',
    'TEXTAREA',
    'SELECT',
    'OPTION',
    'BUTTON',
    'INPUT',
    'FORM',
]);

const LINK_REL = 'nofollow noopener noreferrer';
const SAFE_SCHEMES = new Set(['http:', 'https:', 'mailto:']);
const URL_BASE = 'https://news.ycombinator.com/';

export function isSafeHref(rawHref: string): boolean {
    // Browsers ignore ASCII whitespace/control chars inside schemes ("java\nscript:").
    // eslint-disable-next-line no-control-regex
    const href = rawHref.replace(/[\u0000-\u0020\u007f-\u009f]/g, '');
    if (!href) return false;
    if (href.startsWith('//') || href.startsWith('/\\') || href.startsWith('\\')) return false;
    const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(href);
    if (scheme && !SAFE_SCHEMES.has(`${scheme[1].toLowerCase()}:`)) return false;
    // Second opinion from the WHATWG URL parser (what the browser will actually navigate to).
    try {
        const url = new URL(rawHref, URL_BASE);
        if (!SAFE_SCHEMES.has(url.protocol)) return false;
        if (!scheme && url.origin !== new URL(URL_BASE).origin) return false;
    } catch {
        return false;
    }
    return true;
}

function escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function cleanChildren(parent: Node, doc: Document): void {
    for (const child of Array.from(parent.childNodes)) {
        if (child.nodeType === Node.TEXT_NODE) continue;
        if (child.nodeType !== Node.ELEMENT_NODE) {
            parent.removeChild(child);
            continue;
        }
        const el = child as Element;
        const tag = el.tagName.toUpperCase();
        if (DROPPED_TAGS.has(tag)) {
            parent.removeChild(el);
            continue;
        }
        cleanChildren(el, doc);
        if (!ALLOWED_TAGS.has(tag)) {
            const fragment = doc.createDocumentFragment();
            while (el.firstChild) fragment.appendChild(el.firstChild);
            parent.replaceChild(fragment, el);
            continue;
        }
        for (const attr of Array.from(el.attributes)) {
            if (!(tag === 'A' && attr.name === 'href')) el.removeAttribute(attr.name);
        }
        if (tag === 'A') {
            const href = el.getAttribute('href');
            if (href !== null && !isSafeHref(href)) el.removeAttribute('href');
            el.setAttribute('rel', LINK_REL);
        }
    }
}

/**
 * Allowlist sanitizer for HN HTML (`content`, `about`, poll text) before `dangerouslySetInnerHTML`.
 * Angular's `[innerHTML]` was sanitized by DomSanitizer; React does no sanitizing.
 * Keeps basic formatting tags; drops scripts/styles/embeds with their content; strips every attribute
 * except `a[href]`; removes `javascript:`/`data:`/protocol-relative (`//`, `/\`) hrefs; forces
 * `rel="nofollow noopener noreferrer"` on links.
 */
export function sanitizeHtml(html: string | null | undefined): string {
    if (!html) return '';
    if (typeof DOMParser === 'undefined') return escapeHtml(html);
    const doc = new DOMParser().parseFromString(`<!doctype html><body>${html}`, 'text/html');
    cleanChildren(doc.body, doc);
    return doc.body.innerHTML;
}
