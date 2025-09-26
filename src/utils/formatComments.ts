export const formatComments = (count: number): string => {
  if (count > 0) {
    const text = count === 1 ? 'comment' : 'comments'
    return `${count} ${text}`
  }
  return 'discuss'
}
