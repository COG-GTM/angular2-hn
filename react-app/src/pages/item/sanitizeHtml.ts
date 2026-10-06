// React has no equivalent of Angular's built-in [innerHTML] sanitizer, so HN HTML is allow-listed here before
// dangerouslySetInnerHTML. HN only emits p/a/i/pre/code; anything else is unwrapped (text kept) or dropped.
const ALLOWED_TAGS = new Set([
  'p',
  'a',
  'i',
  'em',
  'b',
  'strong',
  'u',
  's',
  'pre',
  'code',
  'br',
  'blockquote',
  'ul',
  'ol',
  'li',
  'span',
]);
const DROPPED_TAGS = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'template',
  'noscript',
  'svg',
  'math',
  'link',
  'meta',
]);
const ALLOWED_LINK_ATTRS = new Set(['href', 'rel']);
// Same pattern as Angular's SAFE_URL_PATTERN: http(s)/mailto or scheme-less (relative) URLs.
const SAFE_URL = /^(?:(?:https?|mailto):|[^&:/?#]*(?:[/?#]|$))/i;

function cleanChildren(parent: Element) {
  for (const child of Array.from(parent.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) continue;
    if (child.nodeType !== Node.ELEMENT_NODE) {
      child.remove();
      continue;
    }
    const el = child as Element;
    const tag = el.tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) {
      if (DROPPED_TAGS.has(tag)) {
        el.remove();
      } else {
        cleanChildren(el);
        el.replaceWith(...Array.from(el.childNodes));
      }
      continue;
    }
    for (const attr of Array.from(el.attributes)) {
      const keep =
        tag === 'a' && ALLOWED_LINK_ATTRS.has(attr.name) && (attr.name !== 'href' || SAFE_URL.test(attr.value.trim()));
      if (!keep) el.removeAttribute(attr.name);
    }
    cleanChildren(el);
  }
}

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  cleanChildren(doc.body);
  return doc.body.innerHTML;
}
