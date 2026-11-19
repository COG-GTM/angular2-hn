import { TestBed } from '@angular/core/testing';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
    it('renders the GitHub link', () => {
        const fixture = TestBed.createComponent(FooterComponent);
        fixture.detectChanges();
        const el = fixture.nativeElement as HTMLElement;
        expect(el.querySelector('#footer p')?.textContent).toBe('Show this project some ❤ on GitHub');
        const link = el.querySelector('#footer a');
        expect(link?.getAttribute('href')).toBe('https://github.com/hdjirdeh/angular2-hn');
        expect(link?.getAttribute('target')).toBe('_blank');
        expect(link?.getAttribute('rel')).toBe('noopener');
    });
});
