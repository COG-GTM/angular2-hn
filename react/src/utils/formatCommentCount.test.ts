import { formatCommentCount } from './formatCommentCount'

// Parity with src/app/shared/pipes/comment.pipe.spec.ts
describe('formatCommentCount', () => {
  it('renders "discuss" when there are no comments', () => {
    expect(formatCommentCount(0)).toBe('discuss')
  })

  it('uses the singular for one comment', () => {
    expect(formatCommentCount(1)).toBe('1 comment')
  })

  it('uses the plural for more than one comment', () => {
    expect(formatCommentCount(42)).toBe('42 comments')
  })
})
