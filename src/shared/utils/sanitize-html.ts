import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string | null | undefined): { __html: string } {
    return { __html: DOMPurify.sanitize(html ?? '') };
}
