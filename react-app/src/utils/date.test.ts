import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatTimeAgo, formatDate, formatDateTime } from './date';

describe('date utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatTimeAgo', () => {
    it('should return "just now" for very recent timestamps', () => {
      const timestamp = Math.floor(Date.now() / 1000);
      expect(formatTimeAgo(timestamp)).toBe('just now');
    });

    it('should return seconds ago for timestamps less than a minute old', () => {
      const timestamp = Math.floor(Date.now() / 1000) - 30;
      expect(formatTimeAgo(timestamp)).toBe('30 seconds ago');
    });

    it('should return minutes ago for timestamps less than an hour old', () => {
      const timestamp = Math.floor(Date.now() / 1000) - 300;
      expect(formatTimeAgo(timestamp)).toBe('5 minutes ago');
    });

    it('should return hours ago for timestamps less than a day old', () => {
      const timestamp = Math.floor(Date.now() / 1000) - 7200;
      expect(formatTimeAgo(timestamp)).toBe('2 hours ago');
    });

    it('should return days ago for timestamps less than a month old', () => {
      const timestamp = Math.floor(Date.now() / 1000) - 259200;
      expect(formatTimeAgo(timestamp)).toBe('3 days ago');
    });
  });

  describe('formatDate', () => {
    it('should format a timestamp to a date string', () => {
      const timestamp = 1705320000;
      const result = formatDate(timestamp);
      expect(result).toContain('2024');
      expect(result).toContain('January');
    });
  });

  describe('formatDateTime', () => {
    it('should format a timestamp to a date and time string', () => {
      const timestamp = 1705320000;
      const result = formatDateTime(timestamp);
      expect(result).toContain('2024');
      expect(result).toContain('January');
    });
  });
});
