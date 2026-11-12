import DOMPurify from 'dompurify';

// Angular's [innerHTML] sanitized API HTML; React's dangerouslySetInnerHTML does not.
export function sanitizedHtml(html: string | undefined): { __html: string } {
    return { __html: DOMPurify.sanitize(html ?? '') };
}
