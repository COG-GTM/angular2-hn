import { describe, it, expect } from 'vitest'
import { formatComment } from './formatComment'

describe('formatComment', () => {
    it('returns "discuss" for 0 comments', () => {
        expect(formatComment(0)).toBe('discuss')
    })

    it('returns "1 comment" for 1 comment', () => {
        expect(formatComment(1)).toBe('1 comment')
    })

    it('returns plural for multiple comments', () => {
        expect(formatComment(5)).toBe('5 comments')
        expect(formatComment(100)).toBe('100 comments')
    })

    it('returns "discuss" for negative numbers', () => {
        expect(formatComment(-1)).toBe('discuss')
    })
})
