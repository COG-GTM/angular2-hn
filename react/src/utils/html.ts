const BLOCKED_TAGS = 'script, style, iframe, object, embed, link, meta, base, form, input, button, textarea, select';
const URL_ATTRS = new Set(['href', 'src', 'xlink:href', 'action', 'formaction']);
const SAFE_URL = /^(?:https?:|mailto:|\/|#|item\?|user\?)/i;

/**
 * Sanitizes HN-supplied HTML (comment text, self-post bodies, poll options,
 * user `about`) before it is rendered with `dangerouslySetInnerHTML` — the
 * React stand-in for Angular's sanitized `[innerHTML]` binding.
 */
export function sanitizeHtml(html: string): string {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  doc.body.querySelectorAll(BLOCKED_TAGS).forEach((el) => el.remove());
  doc.body.querySelectorAll('*').forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      if (name.startsWith('on') || name === 'style' || name === 'srcdoc') {
        el.removeAttribute(attr.name);
      } else if (URL_ATTRS.has(name) && !SAFE_URL.test(attr.value.trim())) {
        el.removeAttribute(attr.name);
      }
    }
  });
  return doc.body.innerHTML;
}
