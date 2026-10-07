import { describe, expect, it } from 'vitest'
import { formatCommentCount } from './comment'

describe('formatCommentCount', () => {
  it.each([
    [0, 'discuss'],
    [1, '1 comment'],
    [5, '5 comments'],
  ])('formats %i comments', (count, formatted) => {
    expect(formatCommentCount(count)).toBe(formatted)
  })
})
