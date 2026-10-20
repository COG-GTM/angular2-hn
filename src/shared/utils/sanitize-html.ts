// Element / attribute allowlists mirror Angular's DomSanitizer (packages/core/src/sanitization/html_sanitizer.ts):
// unknown elements are unwrapped (their text is kept, except for script/style/template whose content is
// dropped), unknown attributes (including `class`, `style` and every `on*` handler) are dropped, and URL
// attributes must use a safe scheme.
const ALLOWED_TAGS = new Set([
    'a', 'abbr', 'address', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo', 'blockquote', 'br', 'caption', 'cite',
    'code', 'col', 'colgroup', 'data', 'dd', 'del', 'dfn', 'div', 'dl', 'dt', 'em', 'figcaption', 'figure', 'footer',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'i', 'img', 'ins', 'kbd', 'li', 'main', 'map',
    'mark', 'nav', 'ol', 'p', 'pre', 'q', 'rp', 'rt', 'rtc', 'ruby', 's', 'samp', 'section', 'small', 'source',
    'span', 'strike', 'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'time', 'tr', 'track',
    'tt', 'u', 'ul', 'var', 'video',
]);
const DROP_CONTENT_TAGS = new Set(['script', 'style', 'template']);
const URL_ATTRS = new Set(['href', 'src', 'cite', 'longdesc', 'poster', 'usemap']);
const ALLOWED_ATTRS = new Set([
    'abbr', 'align', 'alt', 'border', 'cellpadding', 'cellspacing', 'colspan', 'controls', 'dir', 'headers', 'height',
    'hreflang', 'lang', 'loop', 'media', 'muted', 'preload', 'rel', 'rowspan', 'scope', 'span', 'start', 'summary',
    'target', 'title', 'type', 'valign', 'width',
]);
// HN emits relative links (`item?id=…`, `user?id=…`) that must resolve against news.ycombinator.com,
// not against the React route the reader is on.
const HN_ORIGIN = 'https://news.ycombinator.com/';
const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'ftp:', 'tel:', 'sms:']);
const SAFE_DATA_IMAGE = /^data:image\/(?:bmp|gif|jpe?g|png|tiff|webp);base64,[a-z0-9+/]+=*$/i;

/**
 * Returns the normalised URL to keep, or null when it must be dropped. The browser's own URL
 * parser decides the scheme (so `java\nscript:` and friends cannot slip through) and the
 * normalised form is what gets written back to the attribute.
 */
function safeUrl(value: string): string | null {
    if (SAFE_DATA_IMAGE.test(value.trim())) return value.trim();
    let url: URL;
    try {
        url = new URL(value, HN_ORIGIN);
    } catch {
        return null;
    }
    return SAFE_PROTOCOLS.has(url.protocol) ? url.href : null;
}

/**
 * Angular's `[innerHTML]` binding ran the value through `DomSanitizer`; React's
 * `dangerouslySetInnerHTML` does not, so apply an equivalent allowlist here.
 */
export function sanitizeHtml(html: string | null | undefined): string {
    if (!html || typeof DOMParser === 'undefined') return '';
    const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
    const walk = (node: Element) => {
        for (const child of Array.from(node.children)) {
            const tag = child.tagName.toLowerCase();
            if (DROP_CONTENT_TAGS.has(tag)) {
                child.remove();
                continue;
            }
            walk(child);
            if (!ALLOWED_TAGS.has(tag)) {
                child.replaceWith(...Array.from(child.childNodes));
                continue;
            }
            for (const attr of Array.from(child.attributes)) {
                const name = attr.name.toLowerCase();
                if (URL_ATTRS.has(name)) {
                    const url = safeUrl(attr.value);
                    if (url === null) child.removeAttribute(attr.name);
                    else child.setAttribute(attr.name, url);
                } else if (!ALLOWED_ATTRS.has(name)) {
                    child.removeAttribute(attr.name);
                }
            }
        }
    };
    walk(doc.body);
    return doc.body.innerHTML;
}
