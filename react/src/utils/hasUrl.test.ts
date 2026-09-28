import { hasUrl } from './hasUrl'

describe('hasUrl', () => {
  it('is true for absolute http(s) urls', () => {
    expect(hasUrl('https://example.com')).toBe(true)
    expect(hasUrl('http://example.com')).toBe(true)
  })

  it('is false for relative HN urls and missing urls', () => {
    expect(hasUrl('item?id=123')).toBe(false)
    expect(hasUrl(undefined)).toBe(false)
  })
})
