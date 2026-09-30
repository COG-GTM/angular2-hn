import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string | undefined | null): string {
    return html ? DOMPurify.sanitize(html) : '';
}
