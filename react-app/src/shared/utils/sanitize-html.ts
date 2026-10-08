// React's dangerouslySetInnerHTML does not sanitize like Angular's [innerHTML] (DomSanitizer).
// HN `content`/`about` fields are user-supplied, so strip everything outside a small allowlist.
const ALLOWED_TAGS = new Set([
    'A',
    'P',
    'I',
    'EM',
    'B',
    'STRONG',
    'PRE',
    'CODE',
    'BR',
    'U',
    'S',
    'BLOCKQUOTE',
    'UL',
    'OL',
    'LI',
]);
const ALLOWED_ATTRS: Record<string, Set<string>> = { A: new Set(['href', 'rel', 'title']) };
const SAFE_URL = /^(https?:|mailto:|\/|#|item\?|user\?)/i;

function clean(node: Node, doc: Document): Node | null {
    if (node.nodeType === Node.TEXT_NODE) {
        return doc.createTextNode(node.textContent ?? '');
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
        return null;
    }
    const el = node as Element;
    const children = Array.from(el.childNodes)
        .map((child) => clean(child, doc))
        .filter((child): child is Node => child !== null);
    if (!ALLOWED_TAGS.has(el.tagName)) {
        if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return null;
        const fragment = doc.createDocumentFragment();
        children.forEach((child) => fragment.appendChild(child));
        return fragment;
    }
    const out = doc.createElement(el.tagName.toLowerCase());
    const allowed = ALLOWED_ATTRS[el.tagName];
    for (const attr of Array.from(el.attributes)) {
        if (!allowed?.has(attr.name)) continue;
        if (attr.name === 'href' && !SAFE_URL.test(attr.value.trim())) continue;
        out.setAttribute(attr.name, attr.value);
    }
    if (el.tagName === 'A' && out.hasAttribute('href')) {
        out.setAttribute('rel', 'nofollow noopener noreferrer');
    }
    children.forEach((child) => out.appendChild(child));
    return out;
}

export function sanitizeHtml(html: string | null | undefined): string {
    if (!html) return '';
    const parsed = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
    const container = document.createElement('div');
    Array.from(parsed.body.childNodes).forEach((node) => {
        const cleaned = clean(node, document);
        if (cleaned) container.appendChild(cleaned);
    });
    return container.innerHTML;
}
