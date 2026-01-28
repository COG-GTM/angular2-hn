import { describe, it, expect } from 'vitest';
import { formatCommentCount, formatCommentCountAbbreviated } from './comments';

describe('comment utilities', () => {
  describe('formatCommentCount', () => {
    it('should return "no comments" for 0', () => {
      expect(formatCommentCount(0)).toBe('no comments');
    });

    it('should return "1 comment" for 1', () => {
      expect(formatCommentCount(1)).toBe('1 comment');
    });

    it('should return plural form for multiple comments', () => {
      expect(formatCommentCount(5)).toBe('5 comments');
      expect(formatCommentCount(100)).toBe('100 comments');
    });
  });

  describe('formatCommentCountAbbreviated', () => {
    it('should return "no comments" for 0', () => {
      expect(formatCommentCountAbbreviated(0)).toBe('no comments');
    });

    it('should return "1 comment" for 1', () => {
      expect(formatCommentCountAbbreviated(1)).toBe('1 comment');
    });

    it('should return normal count for less than 1000', () => {
      expect(formatCommentCountAbbreviated(500)).toBe('500 comments');
    });

    it('should abbreviate thousands', () => {
      expect(formatCommentCountAbbreviated(1500)).toBe('1.5k comments');
      expect(formatCommentCountAbbreviated(10000)).toBe('10k comments');
    });

    it('should abbreviate millions', () => {
      expect(formatCommentCountAbbreviated(1500000)).toBe('1.5m comments');
    });
  });
});
