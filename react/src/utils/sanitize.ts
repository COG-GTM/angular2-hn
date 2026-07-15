import DOMPurify from 'dompurify';

// Mirrors Angular's automatic [innerHTML] DomSanitizer behaviour: strip
// scripts/event handlers while keeping the formatting markup the HN API returns.
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html ?? '');
}
