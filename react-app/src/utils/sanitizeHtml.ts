import DOMPurify from 'dompurify';

/** Strips scripts, event handlers, inline styles and javascript: URLs from API HTML, like Angular's [innerHTML] sanitizer. */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, { FORBID_TAGS: ['style'], FORBID_ATTR: ['style'] });
}
