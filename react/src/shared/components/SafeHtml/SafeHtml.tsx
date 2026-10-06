import DOMPurify from 'dompurify';

export interface SafeHtmlProps {
    html: string | undefined;
    as?: 'div' | 'p' | 'span';
    className?: string;
}

/** Renders API-provided HTML (comments, poll options, user bios) sanitized, like Angular's `[innerHTML]` binding. */
export function SafeHtml({ html, as: Tag = 'div', className }: SafeHtmlProps) {
    return <Tag className={className} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html ?? '') }} />;
}
