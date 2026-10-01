import { useMemo, type ElementType } from 'react';

const BLOCKED_TAGS = 'script, style, iframe, object, embed, link, meta, base, form, input, button, textarea, select';
const URL_ATTRS = new Set(['href', 'src', 'xlink:href', 'action', 'formaction']);
const SAFE_URL = /^(?:https?:|mailto:|\/|#|item\?|user\?)/i;

/**
 * Strips active content from HN-supplied HTML before it is rendered, standing
 * in for Angular's built-in `[innerHTML]` sanitization.
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

export interface HtmlContentProps {
  html: string | undefined;
  as?: ElementType;
  className?: string;
}

export function HtmlContent({ html, as: Tag = 'div', className }: HtmlContentProps) {
  const safe = useMemo(() => sanitizeHtml(html ?? ''), [html]);
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: safe }} />;
}
