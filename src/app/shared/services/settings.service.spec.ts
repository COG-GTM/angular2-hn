import { TestBed } from '@angular/core/testing';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
    let service: SettingsService;
    let localStorageSpy: jasmine.SpyObj<Storage>;

    beforeEach(() => {
        localStorageSpy = jasmine.createSpyObj('localStorage', ['getItem', 'setItem']);
        localStorageSpy.getItem.and.returnValue(null);

        spyOn(localStorage, 'getItem').and.callFake(localStorageSpy.getItem);
        spyOn(localStorage, 'setItem').and.callFake(localStorageSpy.setItem);

        TestBed.configureTestingModule({
            providers: [SettingsService]
        });
        service = TestBed.inject(SettingsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have default settings', () => {
        expect(service.settings).toBeTruthy();
        expect(service.settings.showSettings).toBe(false);
        expect(service.settings.theme).toBeDefined();
    });

    describe('toggleSettings', () => {
        it('should toggle showSettings from false to true', () => {
            service.settings.showSettings = false;
            service.toggleSettings();
            expect(service.settings.showSettings).toBe(true);
        });

        it('should toggle showSettings from true to false', () => {
            service.settings.showSettings = true;
            service.toggleSettings();
            expect(service.settings.showSettings).toBe(false);
        });
    });

    describe('toggleOpenLinksInNewTab', () => {
        it('should toggle openLinkInNewTab and save to localStorage', () => {
            service.settings.openLinkInNewTab = false;
            service.toggleOpenLinksInNewTab();
            expect(service.settings.openLinkInNewTab).toBe(true);
            expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'true');
        });
    });

    describe('setTheme', () => {
        it('should set theme and save to localStorage', () => {
            service.setTheme('night');
            expect(service.settings.theme).toBe('night');
            expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'night');
        });

        it('should set default theme', () => {
            service.setTheme('default');
            expect(service.settings.theme).toBe('default');
            expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'default');
        });
    });

    describe('setFont', () => {
        it('should set font size and save to localStorage', () => {
            service.setFont('18');
            expect(service.settings.titleFontSize).toBe('18');
            expect(localStorage.setItem).toHaveBeenCalledWith('titleFontSize', '18');
        });
    });

    describe('setSpacing', () => {
        it('should set list spacing and save to localStorage', () => {
            service.setSpacing('10');
            expect(service.settings.listSpacing).toBe('10');
            expect(localStorage.setItem).toHaveBeenCalledWith('listSpacing', '10');
        });
    });
});
