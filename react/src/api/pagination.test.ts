import { hasNextPage, hasPreviousPage, listStart } from './pagination'

// Mirrors FeedComponent: listStart = ((pageNum - 1) * 30) + 1, "More" only on a full page of 30.
describe('pagination', () => {
  it('numbers each page from (page - 1) * 30 + 1', () => {
    expect(listStart(1)).toBe(1)
    expect(listStart(2)).toBe(31)
    expect(listStart(5)).toBe(121)
  })

  it('shows "Prev" on every page but the first', () => {
    expect(hasPreviousPage(1)).toBe(false)
    expect(hasPreviousPage(2)).toBe(true)
  })

  it('shows "More" only when the page is full', () => {
    expect(hasNextPage(30)).toBe(true)
    expect(hasNextPage(29)).toBe(false)
  })
})
