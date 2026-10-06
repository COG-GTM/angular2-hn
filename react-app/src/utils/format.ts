// Ported from src/app/shared/pipes/comment.pipe.ts and shared template helpers.

/** `comment` pipe: 0 -> "discuss", 1 -> "1 comment", n -> "n comments". */
export function commentLabel(count: number | null | undefined): string {
  if (count && count > 0) {
    return `${count} ${count === 1 ? 'comment' : 'comments'}`;
  }
  return 'discuss';
}

/** Mirrors the Angular `hasUrl` getter: true for absolute external links, false for HN-internal ("item?id=") urls. */
export function hasExternalUrl(url: string | null | undefined): boolean {
  return !!url && url.indexOf('http') === 0;
}

/** First list number for a feed page (30 items per page). */
export function listStart(page: number): number {
  return (page - 1) * 30 + 1;
}

/** Link attrs for external links honoring the "open links in new tab" setting. */
export function externalLinkProps(openInNewTab: boolean): { target?: string; rel?: string } {
  return openInNewTab ? { target: '_blank', rel: 'noopener' } : {};
}
