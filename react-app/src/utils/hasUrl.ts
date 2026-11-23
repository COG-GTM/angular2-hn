/** External items have absolute URLs; ask/job posts link to `item?id=...`. */
export function hasUrl(url: string | undefined): boolean {
  return !!url && url.indexOf('http') === 0;
}
