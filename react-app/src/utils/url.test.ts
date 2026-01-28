import { describe, it, expect } from 'vitest';
import { hasUrl, extractDomain, isValidUrl, getHackerNewsItemUrl, getHackerNewsUserUrl } from './url';

describe('url utilities', () => {
  describe('hasUrl', () => {
    it('should return true for http URLs', () => {
      expect(hasUrl('http://example.com')).toBe(true);
    });

    it('should return true for https URLs', () => {
      expect(hasUrl('https://example.com')).toBe(true);
    });

    it('should return false for non-http URLs', () => {
      expect(hasUrl('ftp://example.com')).toBe(false);
      expect(hasUrl('example.com')).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(hasUrl(null)).toBe(false);
      expect(hasUrl(undefined)).toBe(false);
      expect(hasUrl('')).toBe(false);
    });
  });

  describe('extractDomain', () => {
    it('should extract domain from URL', () => {
      expect(extractDomain('https://www.example.com/path')).toBe('www.example.com');
      expect(extractDomain('http://news.ycombinator.com')).toBe('news.ycombinator.com');
    });

    it('should return empty string for invalid URLs', () => {
      expect(extractDomain('not-a-url')).toBe('');
      expect(extractDomain(null)).toBe('');
      expect(extractDomain(undefined)).toBe('');
    });
  });

  describe('isValidUrl', () => {
    it('should return true for valid URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com/path?query=1')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl(null)).toBe(false);
      expect(isValidUrl(undefined)).toBe(false);
    });
  });

  describe('getHackerNewsItemUrl', () => {
    it('should generate correct item URL', () => {
      expect(getHackerNewsItemUrl(12345)).toBe('https://news.ycombinator.com/item?id=12345');
    });
  });

  describe('getHackerNewsUserUrl', () => {
    it('should generate correct user URL', () => {
      expect(getHackerNewsUserUrl('pg')).toBe('https://news.ycombinator.com/user?id=pg');
    });
  });
});
