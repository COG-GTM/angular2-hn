const ALLOWED_TAGS = new Set(
  'A ABBR B BLOCKQUOTE BR CITE CODE DEL DIV EM H1 H2 H3 H4 H5 H6 HR I LI OL P PRE Q S SMALL SPAN STRONG SUB SUP U UL'.split(' ')
);
const DROPPED_TAGS = new Set('SCRIPT STYLE TEMPLATE NOSCRIPT IFRAME OBJECT EMBED SVG MATH TITLE'.split(' '));
const ALLOWED_ATTRS = new Set(['href', 'title', 'rel']);
/** Angular's SAFE_URL_PATTERN. */
const SAFE_URL = /^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:/?#]*(?:[/?#]|$))/i;

/**
 * Allowlist sanitizer standing in for the DomSanitizer that Angular applied to `[innerHTML]`:
 * drops scripts, event handlers, unknown attributes and unsafe URLs, and unwraps unknown tags.
 */
export function sanitizeHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  cleanChildren(doc.body);
  return doc.body.innerHTML;
}

function cleanChildren(parent: Element) {
  for (const node of Array.from(parent.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) continue;
    if (!(node instanceof Element)) {
      node.remove();
      continue;
    }
    const tag = node.tagName.toUpperCase();
    if (DROPPED_TAGS.has(tag)) {
      node.remove();
      continue;
    }
    cleanChildren(node);
    if (!ALLOWED_TAGS.has(tag)) {
      node.replaceWith(...Array.from(node.childNodes));
      continue;
    }
    for (const { name, value } of Array.from(node.attributes)) {
      const attr = name.toLowerCase();
      if (!ALLOWED_ATTRS.has(attr) || (attr === 'href' && !SAFE_URL.test(value.trim()))) {
        node.removeAttribute(name);
      }
    }
  }
}
