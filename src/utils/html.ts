import DOMPurify from 'dompurify';

/**
 * Angular's [innerHTML] binding sanitized untrusted markup automatically; React's
 * dangerouslySetInnerHTML does not, so the API-provided HTML is sanitized here instead.
 */
export function sanitizedHtml(html: string | undefined): { __html: string } {
  return { __html: DOMPurify.sanitize(html ?? '') };
}
