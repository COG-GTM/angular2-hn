// Approximates Angular's [innerHTML] sanitization (DomSanitizer) for HN-provided HTML.
const ALLOWED_TAGS = new Set([
  'A',
  'P',
  'I',
  'EM',
  'B',
  'STRONG',
  'U',
  'S',
  'CODE',
  'PRE',
  'BR',
  'BLOCKQUOTE',
  'UL',
  'OL',
  'LI',
]);
const DROPPED_TAGS = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'TEMPLATE', 'NOSCRIPT', 'SVG', 'MATH']);
const SAFE_URL = /^(?:https?:|mailto:|\/|#|[^:]*$)/i;

function clean(node: Node) {
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as Element;
      if (DROPPED_TAGS.has(el.tagName)) {
        el.remove();
        continue;
      }
      clean(el);
      if (!ALLOWED_TAGS.has(el.tagName)) {
        el.replaceWith(...Array.from(el.childNodes));
        continue;
      }
      for (const attr of Array.from(el.attributes)) {
        const keep = el.tagName === 'A' && attr.name === 'href' && SAFE_URL.test(attr.value.trim());
        if (!keep) el.removeAttribute(attr.name);
      }
    } else if (child.nodeType !== Node.TEXT_NODE) {
      child.parentNode?.removeChild(child);
    }
  }
}

export function sanitizeHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  clean(doc.body);
  return doc.body.innerHTML;
}
