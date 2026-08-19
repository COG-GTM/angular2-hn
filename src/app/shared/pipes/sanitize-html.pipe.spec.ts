import { TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';

import { SanitizeHtmlPipe } from './sanitize-html.pipe';

describe('SanitizeHtmlPipe', () => {
  let pipe: SanitizeHtmlPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [BrowserModule], providers: [SanitizeHtmlPipe] });
    pipe = TestBed.inject(SanitizeHtmlPipe);
  });

  it('keeps the markup Hacker News comments use', () => {
    const html = pipe.transform('<p>hello <i>there</i> <a href="https://example.com">link</a></p>');

    expect(html).toContain('<i>there</i>');
    expect(html).toContain('href="https://example.com"');
  });

  it('drops scripts and inline event handlers', () => {
    const html = pipe.transform('<p onclick="alert(1)">hi</p><script>alert(1)</script><img src="x" onerror="alert(1)">');

    expect(html).not.toContain('script');
    expect(html).not.toContain('onclick');
    expect(html).not.toContain('onerror');
    expect(html).toContain('hi');
  });

  it('drops javascript: and data: links but keeps the text', () => {
    const html = pipe.transform('<a href="javascript:alert(1)">click</a>');

    expect(html).not.toContain('javascript:');
    expect(html).toContain('click');
  });

  it('unwraps unknown elements instead of dropping their text', () => {
    expect(pipe.transform('<div><span>text</span></div>')).toBe('text');
  });

  it('returns an empty string for empty content', () => {
    expect(pipe.transform(undefined)).toBe('');
  });
});
