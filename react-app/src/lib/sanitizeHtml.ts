import DOMPurify from 'dompurify';

/**
 * Sanitizes API-provided HTML for `dangerouslySetInnerHTML`, matching Angular's
 * `[innerHTML]` DomSanitizer: markup and links are kept; scripts and event handlers are stripped.
 */
export function sanitizeHtml(html: string | null | undefined): { __html: string } {
  return { __html: DOMPurify.sanitize(html ?? '') };
}
