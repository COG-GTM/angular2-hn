import { describe, expect, it } from 'vitest'
import { sanitizeHtml } from './sanitizeHtml'

describe('sanitizeHtml', () => {
  it('removes executable markup and preserves safe links', () => {
    const sanitized = sanitizeHtml('<img src=x onerror=alert(1)><script>alert(1)</script><a href="https://x.y">ok</a>')

    expect(sanitized).not.toContain('onerror')
    expect(sanitized).not.toContain('<script')
    expect(sanitized).toContain('<a href="https://x.y">ok</a>')
  })

  it('normalizes missing content to an empty string', () => {
    expect(sanitizeHtml(undefined)).toBe('')
    expect(sanitizeHtml(null)).toBe('')
  })
})
