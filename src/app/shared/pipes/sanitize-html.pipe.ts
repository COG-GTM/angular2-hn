import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

const ALLOWED_TAGS = ['A', 'B', 'BR', 'CODE', 'EM', 'I', 'P', 'PRE', 'STRONG'];
const DROPPED_TAGS = ['SCRIPT', 'STYLE', 'IFRAME', 'FRAME', 'OBJECT', 'EMBED', 'APPLET', 'LINK', 'META',
  'BASE', 'FORM', 'INPUT', 'BUTTON', 'TEXTAREA', 'SELECT', 'OPTION', 'SVG', 'MATH', 'TEMPLATE', 'NOSCRIPT'];
const ALLOWED_URL_SCHEMES = ['http:', 'https:', 'mailto:'];

@Pipe({
  name: 'sanitizeHtml',
  pure: true
})
export class SanitizeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(html: string): string {
    if (!html) {
      return '';
    }

    const body = new DOMParser().parseFromString(html, 'text/html').body;
    this.clean(body);

    return this.sanitizer.sanitize(SecurityContext.HTML, body.innerHTML) || '';
  }

  private clean(node: Element): void {
    Array.from(node.children).forEach(child => {
      if (DROPPED_TAGS.includes(child.tagName)) {
        child.remove();
        return;
      }

      if (!ALLOWED_TAGS.includes(child.tagName)) {
        this.clean(child);
        child.replaceWith(...Array.from(child.childNodes));
        return;
      }

      Array.from(child.attributes).forEach(attribute => {
        if (child.tagName !== 'A' || attribute.name.toLowerCase() !== 'href' || !this.isSafeUrl(attribute.value)) {
          child.removeAttribute(attribute.name);
        }
      });

      if (child.tagName === 'A' && child.hasAttribute('href')) {
        child.setAttribute('rel', 'nofollow noopener noreferrer');
        child.setAttribute('target', '_blank');
      }

      this.clean(child);
    });
  }

  private isSafeUrl(url: string): boolean {
    try {
      return ALLOWED_URL_SCHEMES.includes(new URL(url, document.baseURI).protocol);
    } catch {
      return false;
    }
  }
}
