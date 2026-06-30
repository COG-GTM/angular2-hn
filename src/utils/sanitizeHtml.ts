import DOMPurify from 'dompurify';

// Angular's [innerHTML] binding sanitizes by default; React's
// dangerouslySetInnerHTML does not. Sanitize HTML coming from the HN API
// before injecting it so we preserve the original safe behavior.
export function sanitizeHtml(html: string | undefined | null): string {
  return DOMPurify.sanitize(html ?? '');
}
