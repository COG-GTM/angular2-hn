import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string | undefined): string {
    if (!html) {
        return '';
    }
    return DOMPurify.sanitize(html);
}
