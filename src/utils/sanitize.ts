import DOMPurify from 'dompurify';

export function sanitize(html: string | undefined): { __html: string } {
  return { __html: DOMPurify.sanitize(html ?? '') };
}
