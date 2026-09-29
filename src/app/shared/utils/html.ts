import DOMPurify from 'dompurify';

export function sanitizedHtml(html: string | undefined): { __html: string } {
  return { __html: DOMPurify.sanitize(html ?? '') };
}

export function hasExternalUrl(url: string | undefined): boolean {
  return !!url && url.indexOf('http') === 0;
}

export function linkTargetProps(openLinkInNewTab: boolean): { target?: string; rel?: string } {
  return openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {};
}
