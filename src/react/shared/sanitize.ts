import DOMPurify from 'dompurify';

/**
 * Angular ran every `[innerHTML]` binding through its DomSanitizer, which kept an
 * allowlist of elements and attributes and dropped everything else. React's
 * `dangerouslySetInnerHTML` has no such step, so the Hacker News markup is filtered
 * here instead — restricted to the formatting tags the API actually returns.
 */
const config = {
    ALLOWED_TAGS: ['a', 'b', 'i', 'em', 'strong', 'code', 'pre', 'p', 'br', 'blockquote', 'span', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'title', 'rel', 'target'],
};

export function sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, config);
}
