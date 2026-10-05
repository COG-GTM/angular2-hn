/** True for absolute links; HN self posts (Ask/Show/polls) use relative urls like `item?id=123`. */
export function hasExternalUrl(url: string | undefined | null): boolean {
  return !!url && url.indexOf('http') === 0;
}

/** `target`/`rel` attributes for outbound story links, honouring the "open links in a new tab" setting. */
export function externalLinkProps(openLinkInNewTab: boolean): { target?: string; rel?: string } {
  return openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {};
}
