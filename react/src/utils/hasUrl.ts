// Port of the `hasUrl` getter shared by ItemComponent and ItemDetailsComponent: node-hnapi returns
// relative urls (e.g. "item?id=123") for Ask/Show HN posts, which must link internally instead.
export function hasUrl(url: string | undefined): boolean {
  return (url ?? '').indexOf('http') === 0
}
