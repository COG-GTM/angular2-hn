import DOMPurify from 'dompurify';

export const sanitizeHtml = (html: string | undefined | null): string => DOMPurify.sanitize(html ?? '');
