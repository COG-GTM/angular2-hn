import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

describe('SettingsComponent', () => {
    let fixture: ComponentFixture<SettingsComponent>;
    let settingsService: jasmine.SpyObj<SettingsService>;
    let settings: Settings;

    const element = (): HTMLElement => fixture.nativeElement;
    const input = (selector: string) => element().querySelector(selector) as HTMLInputElement;
    const themeRadio = (theme: string) => input(`input[type="radio"][value="${theme}"]`);
    const numberInputs = () => element().querySelectorAll('input[type="number"]') as NodeListOf<HTMLInputElement>;

    beforeEach(() => {
        settings = {
            showSettings: true,
            openLinkInNewTab: true,
            theme: 'night',
            titleFontSize: '18',
            listSpacing: '4',
        };
        settingsService = jasmine.createSpyObj<SettingsService>(
            'SettingsService',
            ['toggleSettings', 'toggleOpenLinksInNewTab', 'setTheme', 'setFont', 'setSpacing'],
        );
        settingsService.settings = settings;

        TestBed.configureTestingModule({
            declarations: [SettingsComponent],
            providers: [{ provide: SettingsService, useValue: settingsService }],
        });

        fixture = TestBed.createComponent(SettingsComponent);
        fixture.detectChanges();
    });

    it('should share the settings object held by the service', () => {
        expect(fixture.componentInstance.settings).toBe(settings);
    });

    it('should reflect the current settings in the form controls', () => {
        expect(input('input[type="checkbox"]').checked).toBe(true);
        expect(themeRadio('night').checked).toBe(true);
        expect(themeRadio('default').checked).toBe(false);
        expect(themeRadio('amoledblack').checked).toBe(false);
        expect(numberInputs()[0].value).toBe('18');
        expect(numberInputs()[1].value).toBe('4');
    });

    it('should close the popup via the service', () => {
        (element().querySelector('.close') as HTMLElement).click();

        expect(settingsService.toggleSettings).toHaveBeenCalled();
    });

    it('should toggle opening links in a new tab', () => {
        input('input[type="checkbox"]').dispatchEvent(new Event('change'));

        expect(settingsService.toggleOpenLinksInNewTab).toHaveBeenCalled();
    });

    ['default', 'night', 'amoledblack'].forEach(theme => {
        it(`should select the "${theme}" theme when its radio is clicked`, () => {
            themeRadio(theme).click();

            expect(settingsService.setTheme).toHaveBeenCalledWith(theme);
        });
    });

    it('should update the title font size on keyup', () => {
        const fontInput = numberInputs()[0];
        fontInput.value = '24';
        fontInput.dispatchEvent(new KeyboardEvent('keyup'));

        expect(settingsService.setFont).toHaveBeenCalledWith('24');
    });

    it('should update the list spacing on keyup', () => {
        const spacingInput = numberInputs()[1];
        spacingInput.value = '10';
        spacingInput.dispatchEvent(new KeyboardEvent('keyup'));

        expect(settingsService.setSpacing).toHaveBeenCalledWith('10');
    });
});

describe('SettingsComponent with the real SettingsService', () => {
    const storageKeys = ['theme', 'openLinkInNewTab', 'titleFontSize', 'listSpacing'];
    let savedStorage: { [key: string]: string | null };
    let fixture: ComponentFixture<SettingsComponent>;
    let service: SettingsService;

    beforeEach(() => {
        savedStorage = {};
        storageKeys.forEach(key => (savedStorage[key] = localStorage.getItem(key)));
        localStorage.setItem('theme', 'default');

        TestBed.configureTestingModule({
            declarations: [SettingsComponent],
        });

        service = TestBed.inject(SettingsService);
        fixture = TestBed.createComponent(SettingsComponent);
        fixture.detectChanges();
    });

    afterEach(() => {
        storageKeys.forEach(key => {
            if (savedStorage[key] === null) {
                localStorage.removeItem(key);
            } else {
                localStorage.setItem(key, savedStorage[key]);
            }
        });
    });

    it('should switch and persist the theme when a theme radio is clicked', () => {
        const radio = fixture.nativeElement.querySelector('input[value="amoledblack"]') as HTMLInputElement;
        radio.click();
        fixture.detectChanges();

        expect(service.settings.theme).toBe('amoledblack');
        expect(localStorage.getItem('theme')).toBe('amoledblack');
        expect(radio.checked).toBe(true);
    });

    it('should toggle the new tab preference through the checkbox', () => {
        const initial = service.settings.openLinkInNewTab;
        const checkbox = fixture.nativeElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
        checkbox.click();
        fixture.detectChanges();

        expect(service.settings.openLinkInNewTab).toBe(!initial);
        expect(localStorage.getItem('openLinkInNewTab')).toBe(JSON.stringify(!initial));
    });
});
