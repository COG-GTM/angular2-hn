import DOMPurify from 'dompurify';

/**
 * Builds the `dangerouslySetInnerHTML` payload for HTML coming from the Hacker News
 * API. Angular sanitized these bindings automatically; React does not.
 */
export function sanitizedHtml(html: string | undefined): { __html: string } {
    return { __html: DOMPurify.sanitize(html ?? '') };
}
