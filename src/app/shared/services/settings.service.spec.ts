import { TestBed } from '@angular/core/testing';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
    let service: SettingsService;

    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({
            providers: [SettingsService]
        });
        service = TestBed.inject(SettingsService);
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('Firebase SDK toggle', () => {
        it('should initialize useFirebaseSDK as false by default', () => {
            expect(service.settings.useFirebaseSDK).toBe(false);
        });

        it('should toggle useFirebaseSDK from false to true', () => {
            service.settings.useFirebaseSDK = false;
            service.toggleFirebaseSDK();
            expect(service.settings.useFirebaseSDK).toBe(true);
        });

        it('should toggle useFirebaseSDK from true to false', () => {
            service.settings.useFirebaseSDK = true;
            service.toggleFirebaseSDK();
            expect(service.settings.useFirebaseSDK).toBe(false);
        });

        it('should persist useFirebaseSDK setting to localStorage', () => {
            service.toggleFirebaseSDK();
            const stored = localStorage.getItem('useFirebaseSDK');
            expect(stored).toBe('true');
        });

        it('should load useFirebaseSDK setting from localStorage', () => {
            localStorage.setItem('useFirebaseSDK', 'true');
            const newService = new SettingsService();
            expect(newService.settings.useFirebaseSDK).toBe(true);
        });

        it('should handle invalid localStorage value gracefully', () => {
            localStorage.setItem('useFirebaseSDK', 'invalid');
            const newService = new SettingsService();
            expect(newService.settings.useFirebaseSDK).toBe(false);
        });
    });

    describe('existing settings functionality', () => {
        it('should toggle settings panel', () => {
            const initialState = service.settings.showSettings;
            service.toggleSettings();
            expect(service.settings.showSettings).toBe(!initialState);
        });

        it('should toggle open links in new tab', () => {
            const initialState = service.settings.openLinkInNewTab;
            service.toggleOpenLinksInNewTab();
            expect(service.settings.openLinkInNewTab).toBe(!initialState);
            expect(localStorage.getItem('openLinkInNewTab')).toBe(JSON.stringify(!initialState));
        });

        it('should set theme', () => {
            service.setTheme('night');
            expect(service.settings.theme).toBe('night');
            expect(localStorage.getItem('theme')).toBe('night');
        });

        it('should set font size', () => {
            service.setFont('18');
            expect(service.settings.titleFontSize).toBe('18');
            expect(localStorage.getItem('titleFontSize')).toBe('18');
        });

        it('should set list spacing', () => {
            service.setSpacing('10');
            expect(service.settings.listSpacing).toBe('10');
            expect(localStorage.getItem('listSpacing')).toBe('10');
        });
    });
});
