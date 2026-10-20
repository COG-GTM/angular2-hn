/**
 * Minimal stand-in for Angular's `[innerHTML]` sanitizer (`DomSanitizer`), which the
 * original components relied on for story / comment HTML coming from the API.
 * Drops script-capable elements, `on*` handlers, inline `style` and unsafe URL schemes
 * while keeping the markup HN emits (`p`, `a`, `i`, `pre`, `code`, ...).
 */
const BLOCKED_TAGS = new Set([
    'script',
    'style',
    'iframe',
    'frame',
    'object',
    'embed',
    'link',
    'meta',
    'base',
    'form',
    'input',
    'button',
    'textarea',
    'select',
    'svg',
    'math',
    'template',
]);

const URL_ATTRIBUTES = new Set(['href', 'src', 'xlink:href', 'formaction', 'action', 'srcset']);

// Same shape as Angular's SAFE_URL_PATTERN: known scheme or a relative URL, never `javascript:`.
const SAFE_URL_PATTERN = /^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:/?#]*(?:[/?#]|$))/i;

function isSafeUrl(value: string): boolean {
    const url = value.trim();
    return SAFE_URL_PATTERN.test(url) && !/^(?:javascript|vbscript|data):/i.test(url);
}

export function sanitizeHtml(html: string | null | undefined): string {
    if (!html) {
        return '';
    }
    if (typeof DOMParser === 'undefined') {
        return '';
    }
    const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
    const elements = Array.from(doc.body.querySelectorAll('*'));

    for (const element of elements) {
        if (BLOCKED_TAGS.has(element.tagName.toLowerCase())) {
            element.remove();
            continue;
        }
        for (const attribute of Array.from(element.attributes)) {
            const name = attribute.name.toLowerCase();
            if (
                name.startsWith('on') ||
                name === 'style' ||
                (URL_ATTRIBUTES.has(name) && !isSafeUrl(attribute.value))
            ) {
                element.removeAttribute(attribute.name);
            }
        }
    }

    return doc.body.innerHTML;
}
