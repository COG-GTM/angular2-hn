import DOMPurify from 'dompurify';

export function sanitizedHtml(html: string | undefined | null): { __html: string } {
    return { __html: DOMPurify.sanitize(html ?? '') };
}
