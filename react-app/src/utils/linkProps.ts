/** target/rel for external links, honoring the "open links in a new tab" setting. */
export function externalLinkProps(openInNewTab: boolean) {
  return openInNewTab ? { target: '_blank', rel: 'noopener' } : {};
}
