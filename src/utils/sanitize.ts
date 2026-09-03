import DOMPurify from 'dompurify'

export function sanitizeHtml(html: string | undefined): string {
  return DOMPurify.sanitize(html ?? '')
}
