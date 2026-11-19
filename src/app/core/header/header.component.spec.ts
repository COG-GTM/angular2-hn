import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { SettingsService } from '../../shared/services/settings.service';
import { HeaderComponent } from './header.component';

@Component({ template: '' })
class BlankComponent {}

describe('HeaderComponent', () => {
    beforeEach(async () => {
        localStorage.clear();
        window.matchMedia = ((query: string) => ({
            matches: false,
            media: query,
            addEventListener: () => {},
        })) as never;
        await TestBed.configureTestingModule({
            imports: [HeaderComponent],
            providers: [provideRouter([{ path: '**', component: BlankComponent }])],
        }).compileComponents();
    });

    function render() {
        const fixture = TestBed.createComponent(HeaderComponent);
        fixture.detectChanges();
        return { fixture, el: fixture.nativeElement as HTMLElement };
    }

    it('renders the logo and feed nav links', () => {
        const { el } = render();
        expect(el.querySelector('img.logo')?.getAttribute('src')).toBe('assets/images/logo.svg');
        expect(el.querySelector('a.home-link')?.getAttribute('href')).toBe('/news/1');
        const links = Array.from(el.querySelectorAll('.header-nav a'));
        expect(links.map((a) => a.textContent?.trim())).toEqual(['new', 'show', 'ask', 'jobs']);
        expect(links.map((a) => a.getAttribute('href'))).toEqual(['/newest/1', '/show/1', '/ask/1', '/jobs/1']);
    });

    it('marks the current feed link active', async () => {
        const { fixture, el } = render();
        await TestBed.inject(Router).navigateByUrl('/show/1');
        fixture.detectChanges();
        expect(el.querySelector('.header-nav a.active')?.textContent?.trim()).toBe('show');
        expect(el.querySelector('a.home-link.active')).toBeNull();
    });

    it('toggles the settings panel from the cog', () => {
        const { fixture, el } = render();
        expect(el.querySelector('app-settings')).toBeNull();
        (el.querySelector('img.settings') as HTMLElement).click();
        fixture.detectChanges();
        expect(TestBed.inject(SettingsService).settings().showSettings).toBe(true);
        expect(el.querySelector('app-settings .popup h1')?.textContent).toBe('Settings');
        (el.querySelector('img.settings') as HTMLElement).click();
        fixture.detectChanges();
        expect(el.querySelector('app-settings')).toBeNull();
    });

    it('scrolls to top when a nav link is clicked', () => {
        const { el } = render();
        const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
        (el.querySelector('.header-nav a') as HTMLElement).click();
        expect(scrollTo).toHaveBeenCalledWith(0, 0);
        scrollTo.mockRestore();
    });
});
