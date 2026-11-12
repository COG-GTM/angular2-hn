import DOMPurify from 'dompurify';

/** Equivalent of Angular's built-in [innerHTML] sanitization. */
export function sanitizeHtml(html: string | undefined): { __html: string } {
    return { __html: DOMPurify.sanitize(html ?? '') };
}
