import DOMPurify from 'dompurify';

// Angular's [innerHTML] sanitizer allows none of these.
const FORBID_TAGS = ['style', 'form', 'input', 'button', 'select', 'option', 'textarea'];

/** Strips scripts, event handlers, inline styles, forms and javascript: URLs from API HTML, like Angular's [innerHTML] sanitizer. */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, { FORBID_TAGS, FORBID_ATTR: ['style'] });
}
