import { TestBed } from '@angular/core/testing';

import { SettingsService } from '../../shared/services/settings.service';
import { SettingsComponent } from './settings.component';

describe('SettingsComponent', () => {
    let service: SettingsService;

    beforeEach(() => {
        localStorage.clear();
        window.matchMedia = ((query: string) => ({
            matches: false,
            media: query,
            addEventListener: () => {},
        })) as never;
        service = TestBed.inject(SettingsService);
    });

    function render() {
        const fixture = TestBed.createComponent(SettingsComponent);
        fixture.detectChanges();
        return { fixture, el: fixture.nativeElement as HTMLElement };
    }

    function themeRadios(el: HTMLElement) {
        return Array.from(el.querySelectorAll<HTMLInputElement>('input[type=radio]'));
    }

    it('renders the sections and theme options', () => {
        const { el } = render();
        expect(el.querySelector('h1')?.textContent).toBe('Settings');
        expect(Array.from(el.querySelectorAll('h2')).map((h) => h.textContent)).toEqual([
            'Links',
            'Select a theme',
            'Change Font',
        ]);
        expect(themeRadios(el).map((r) => r.parentElement?.textContent?.trim())).toEqual([
            'Default',
            'Night',
            'Black (AMOLED)',
        ]);
        expect(themeRadios(el).map((r) => r.value)).toEqual(['default', 'night', 'amoledblack']);
        expect(themeRadios(el)[0].checked).toBe(true);
    });

    it('selects a theme and persists it', () => {
        const { fixture, el } = render();
        themeRadios(el)[2].click();
        fixture.detectChanges();
        expect(service.settings().theme).toBe('amoledblack');
        expect(localStorage.getItem('theme')).toBe('amoledblack');
        expect(themeRadios(el)[2].checked).toBe(true);
    });

    it('toggles opening links in a new tab', () => {
        const { fixture, el } = render();
        const checkbox = el.querySelector<HTMLInputElement>('input[type=checkbox]')!;
        expect(checkbox.checked).toBe(false);
        checkbox.click();
        fixture.detectChanges();
        expect(service.settings().openLinkInNewTab).toBe(true);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('updates title font size and list spacing on keyup', () => {
        const { el } = render();
        const [font, spacing] = Array.from(el.querySelectorAll<HTMLInputElement>('input[type=number]'));
        expect(font.value).toBe('16');
        expect(spacing.value).toBe('0');
        font.value = '20';
        font.dispatchEvent(new KeyboardEvent('keyup'));
        spacing.value = '5';
        spacing.dispatchEvent(new KeyboardEvent('keyup'));
        expect(service.settings().titleFontSize).toBe('20');
        expect(service.settings().listSpacing).toBe('5');
        expect(localStorage.getItem('titleFontSize')).toBe('20');
        expect(localStorage.getItem('listSpacing')).toBe('5');
    });

    it('closes from the close button', () => {
        service.toggleSettings();
        const { el } = render();
        (el.querySelector('.close') as HTMLElement).click();
        expect(service.settings().showSettings).toBe(false);
    });
});
