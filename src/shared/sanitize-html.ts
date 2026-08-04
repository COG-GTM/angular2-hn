import DOMPurify from 'dompurify';

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node instanceof Element && node.getAttribute('target') === '_blank') {
        node.setAttribute('rel', 'noopener noreferrer');
    }
});

export function sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, { ADD_ATTR: ['target'] });
}
