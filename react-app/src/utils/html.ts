import DOMPurify from 'dompurify';

/** Angular's [innerHTML] sanitized bindings; the API's HTML is untrusted, so keep sanitizing it. */
export function sanitizeHtml(html: string | undefined): string {
    return DOMPurify.sanitize(html ?? '');
}
