/**
 * Angular sanitized every `[innerHTML]` binding through its DomSanitizer, which
 * drops unsafe elements and attributes while leaving the formatting markup that
 * the Hacker News API returns (`<p>`, `<a>`, `<pre>`, `<i>`) untouched. React's
 * `dangerouslySetInnerHTML` has no such step, so the same filtering is applied
 * here to keep the migrated views both identical and equally safe.
 */
const unsafeElements = ['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'base', 'form'];

const safeUrl = /^(?!javascript:|data:(?!image\/(png|gif|jpe?g|webp);))/i;

export function sanitizeHtml(html: string): string {
    const template = document.createElement('template');
    template.innerHTML = html;

    template.content.querySelectorAll(unsafeElements.join(',')).forEach(element => element.remove());

    template.content.querySelectorAll('*').forEach(element => {
        for (const attribute of Array.from(element.attributes)) {
            const name = attribute.name.toLowerCase();
            const isUrl = name === 'href' || name === 'src' || name === 'xlink:href';

            if (name.startsWith('on') || (isUrl && !safeUrl.test(attribute.value.trim()))) {
                element.removeAttribute(attribute.name);
            }
        }
    });

    return template.innerHTML;
}
