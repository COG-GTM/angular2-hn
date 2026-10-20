const ALLOWED_TAGS = new Set([
    'a', 'b', 'blockquote', 'br', 'code', 'del', 'em', 'i', 'li', 'ol', 'p', 'pre', 's', 'strong', 'sub', 'sup', 'u', 'ul',
]);
const ALLOWED_ATTRS = new Set(['href', 'rel', 'title']);
const SAFE_URL = /^(?:https?:|mailto:|\/|#|[^:]*$)/i;

/**
 * Angular's `[innerHTML]` binding ran the value through `DomSanitizer`; React's
 * `dangerouslySetInnerHTML` does not, so apply an equivalent allowlist here:
 * unknown elements are unwrapped (text kept), event-handler attributes and
 * unsafe URL schemes are dropped.
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
                if (!ALLOWED_ATTRS.has(attr.name) || (attr.name === 'href' && !SAFE_URL.test(attr.value.trim()))) {
                    child.removeAttribute(attr.name);
                }
            }
        }
    };
    walk(doc.body);
    return doc.body.innerHTML;
}
