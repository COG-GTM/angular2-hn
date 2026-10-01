import { describe, expect, it } from 'vitest';
import angular from './fixtures/angular-outputs.json';
import hnapi from './fixtures/node-hnapi.json';
import { commentLabel, domainOf, isExternalUrl, pollPercent, sanitizeHtml, timeAgo } from '.';

const stories = [...hnapi.news, ...hnapi.newest];

describe('commentLabel (Angular comment pipe)', () => {
  it.each(angular.commentPipe)('$input → "$output"', ({ input, output }) => {
    expect(commentLabel(input)).toBe(output);
  });
});

describe('isExternalUrl (Angular hasUrl getter)', () => {
  it.each(angular.hasUrl)('"$url"', ({ url, feedItem, itemDetails }) => {
    expect(isExternalUrl(url)).toBe(feedItem);
    expect(isExternalUrl(url)).toBe(itemDetails);
  });

  it('treats missing urls as self posts', () => {
    expect(isExternalUrl(null)).toBe(false);
    expect(isExternalUrl(undefined)).toBe(false);
  });
});

describe('domainOf (node-hnapi `domain`)', () => {
  it.each(stories.map((s) => [s.url, s.domain ?? undefined] as const))('%s → %s', (url, domain) => {
    expect(domainOf(url)).toBe(domain);
  });

  it('handles missing and malformed urls', () => {
    expect(domainOf(null)).toBeUndefined();
    expect(domainOf('')).toBeUndefined();
    expect(domainOf('http://')).toBeUndefined();
    expect(domainOf('HTTP://WWW.Example.COM/x')).toBe('example.com');
  });
});

describe('timeAgo (node-hnapi `time_ago`)', () => {
  it.each(['news', 'newest'] as const)('reproduces every time_ago in the captured /%s response', (feed) => {
    // node-hnapi serves cached responses, so find the instant it rendered them.
    const entries = hnapi[feed];
    const earliest = Math.max(...entries.map((s) => s.time));
    let renderedAt: number | null = null;
    for (let t = hnapi.captured_at; t >= earliest && renderedAt === null; t--) {
      if (entries.every((s) => timeAgo(s.time, t * 1000) === s.time_ago)) {
        renderedAt = t;
      }
    }
    expect(renderedAt).not.toBeNull();
  });

  const now = 1_790_000_000_000;
  const ago = (seconds: number) => timeAgo(now / 1000 - seconds, now);

  it.each([
    [0, 'a few seconds ago'],
    [44, 'a few seconds ago'],
    [45, 'a minute ago'],
    [89, 'a minute ago'],
    [90, '2 minutes ago'],
    [44 * 60, '44 minutes ago'],
    [45 * 60, 'an hour ago'],
    [89 * 60, 'an hour ago'],
    [90 * 60, '2 hours ago'],
    [21 * 3600, '21 hours ago'],
    [22 * 3600, 'a day ago'],
    [35 * 3600, 'a day ago'],
    [36 * 3600, '2 days ago'],
    [25 * 86400, '25 days ago'],
    [26 * 86400, 'a month ago'],
    [45 * 86400, 'a month ago'],
    [46 * 86400, '2 months ago'],
    [319 * 86400, '10 months ago'],
    [320 * 86400, 'a year ago'],
    [547 * 86400, 'a year ago'],
    [548 * 86400, '2 years ago'],
    [19 * 365 * 86400, '19 years ago'],
  ])('%is → %s', (seconds, expected) => {
    expect(ago(seconds)).toBe(expected);
  });

  it('clamps future timestamps', () => {
    expect(ago(-600)).toBe('a few seconds ago');
  });

  it('defaults to the current time', () => {
    expect(timeAgo(Math.floor(Date.now() / 1000) - 7200)).toBe('2 hours ago');
  });
});

describe('sanitizeHtml (Angular [innerHTML] sanitization)', () => {
  const normalize = (html: string) => {
    const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
    return doc.body.innerHTML;
  };

  it.each(hnapi.commentHtml.map((html, i) => [i, html]))('keeps captured comment #%i intact', (_, html) => {
    expect(sanitizeHtml(html)).toBe(normalize(html));
  });

  it('removes active content', () => {
    expect(sanitizeHtml('<p>a</p><script>x()</script><iframe src="https://e.vil"></iframe><style>p{}</style>')).toBe(
      '<p>a</p>',
    );
    expect(sanitizeHtml('<a href="javascript:alert(1)" onclick="x()" style="color:red">l</a>')).toBe('<a>l</a>');
    expect(sanitizeHtml('<img src="data:text/html,x" onerror="x()">')).toBe('<img>');
  });

  it('keeps safe and relative links', () => {
    const html = '<a href="item?id=1">i</a><a href="/user/pg">u</a><a href="mailto:a@b.c">m</a>';
    expect(sanitizeHtml(html)).toBe(html);
  });
});

describe('pollPercent', () => {
  it('matches points / poll_votes_count * 100', () => {
    expect(pollPercent(30, 40)).toBe(75);
    expect(pollPercent(1, 3)).toBeCloseTo(33.333, 3);
    expect(pollPercent(5, 0)).toBe(0);
    expect(pollPercent(5, undefined)).toBe(0);
  });
});
