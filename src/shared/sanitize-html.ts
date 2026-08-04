import createDOMPurify from 'dompurify';

const purify = createDOMPurify(window);

purify.addHook('afterSanitizeAttributes', (node) => {
    if (node instanceof Element && node.getAttribute('target') === '_blank') {
        node.setAttribute('rel', 'noopener noreferrer');
    }
});

export function sanitizeHtml(html: string): string {
    return purify.sanitize(html, { ADD_ATTR: ['target'] });
}
