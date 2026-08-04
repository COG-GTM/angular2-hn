import DOMPurify from 'dompurify';

// The API returns pre-rendered HTML for comments, poll options, story text and user bios.
export function sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html);
}
