import DOMPurify from 'dompurify';

// Angular's [innerHTML] binding sanitizes HTML via DomSanitizer. React's
// dangerouslySetInnerHTML does not, so we sanitize here to preserve the same
// defense-in-depth for user-generated HTML (comments, item/poll content, user about).
export function sanitizeHtml(html: string | undefined | null): string {
  if (!html) {
    return '';
  }
  return DOMPurify.sanitize(html);
}
