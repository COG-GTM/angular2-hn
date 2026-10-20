// Element / attribute allowlists mirror Angular's DomSanitizer (packages/core/src/sanitization/html_sanitizer.ts):
// unknown elements are unwrapped (their text is kept), unknown attributes (including `class`, `style`
// and every `on*` handler) are dropped, and URL attributes must use a safe scheme.
const ALLOWED_TAGS = new Set([
    'a', 'abbr', 'address', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo', 'blockquote', 'br', 'caption', 'cite',
    'code', 'col', 'colgroup', 'data', 'dd', 'del', 'dfn', 'div', 'dl', 'dt', 'em', 'figcaption', 'figure', 'footer',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'i', 'img', 'ins', 'kbd', 'li', 'main', 'map',
    'mark', 'nav', 'ol', 'p', 'pre', 'q', 'rp', 'rt', 'rtc', 'ruby', 's', 'samp', 'section', 'small', 'source',
    'span', 'strike', 'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'time', 'tr', 'track',
    'tt', 'u', 'ul', 'var', 'video',
]);
const URL_ATTRS = new Set(['href', 'src', 'cite', 'longdesc', 'poster', 'usemap']);
const ALLOWED_ATTRS = new Set([
    'abbr', 'align', 'alt', 'border', 'cellpadding', 'cellspacing', 'colspan', 'controls', 'dir', 'headers', 'height',
    'hreflang', 'lang', 'loop', 'media', 'muted', 'preload', 'rel', 'rowspan', 'scope', 'span', 'start', 'summary',
    'target', 'title', 'type', 'valign', 'width',
]);
const SAFE_URL = /^(?:(?:https?|mailto|ftp|tel|file|sms):|[^&:/?#]*(?:[/?#]|$))/i;
const SAFE_DATA_IMAGE = /^data:image\/(?:bmp|gif|jpe?g|png|tiff|webp);base64,[a-z0-9+/]+=*$/i;

function isSafeUrl(value: string) {
    const url = value.trim();
    return SAFE_URL.test(url) || SAFE_DATA_IMAGE.test(url);
}

/**
 * Angular's `[innerHTML]` binding ran the value through `DomSanitizer`; React's
 * `dangerouslySetInnerHTML` does not, so apply an equivalent allowlist here.
 */
export function sanitizeHtml(html: string): string {
    if (typeof DOMParser === 'undefined') return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const walk = (node: Element) => {
        for (const child of Array.from(node.children)) {
            walk(child);
            if (!ALLOWED_TAGS.has(child.tagName.toLowerCase())) {
                child.replaceWith(...Array.from(child.childNodes));
                continue;
            }
            for (const attr of Array.from(child.attributes)) {
                const name = attr.name.toLowerCase();
                const keep = URL_ATTRS.has(name) ? isSafeUrl(attr.value) : ALLOWED_ATTRS.has(name);
                if (!keep) child.removeAttribute(attr.name);
            }
        }
    };
    walk(doc.body);
    return doc.body.innerHTML;
}
