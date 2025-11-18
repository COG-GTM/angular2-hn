import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { SettingsService } from './settings.service';

describe('SettingsService SSR Compatibility', () => {
    let service: SettingsService;

    describe('Server Platform', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [
                    SettingsService,
                    { provide: PLATFORM_ID, useValue: 'server' }
                ]
            });
            service = TestBed.inject(SettingsService);
        });

        it('should be created on server', () => {
            expect(service).toBeTruthy();
        });

        it('should initialize with default settings on server', () => {
            expect(service.settings.useFirebaseSDK).toBe(false);
            expect(service.settings.openLinkInNewTab).toBe(false);
            expect(service.settings.theme).toBe('default');
            expect(service.settings.titleFontSize).toBe('16');
            expect(service.settings.listSpacing).toBe('0');
        });

        it('should not access localStorage on server', () => {
            expect(() => service.toggleFirebaseSDK()).not.toThrow();
            expect(service.settings.useFirebaseSDK).toBe(true);
        });

        it('should not access window.matchMedia on server', () => {
            expect(service.darkColorSchemeMedia).toBeUndefined();
        });

        it('should handle theme changes on server', () => {
            expect(() => service.setTheme('night')).not.toThrow();
            expect(service.settings.theme).toBe('night');
        });

        it('should handle font size changes on server', () => {
            expect(() => service.setFont('18')).not.toThrow();
            expect(service.settings.titleFontSize).toBe('18');
        });

        it('should handle spacing changes on server', () => {
            expect(() => service.setSpacing('10')).not.toThrow();
            expect(service.settings.listSpacing).toBe('10');
        });

        it('should handle open links toggle on server', () => {
            expect(() => service.toggleOpenLinksInNewTab()).not.toThrow();
            expect(service.settings.openLinkInNewTab).toBe(true);
        });
    });

    describe('Browser Platform', () => {
        beforeEach(() => {
            localStorage.clear();
            TestBed.configureTestingModule({
                providers: [
                    SettingsService,
                    { provide: PLATFORM_ID, useValue: 'browser' }
                ]
            });
            service = TestBed.inject(SettingsService);
        });

        afterEach(() => {
            localStorage.clear();
        });

        it('should be created on browser', () => {
            expect(service).toBeTruthy();
        });

        it('should access localStorage on browser', () => {
            service.toggleFirebaseSDK();
            const stored = localStorage.getItem('useFirebaseSDK');
            expect(stored).toBe('true');
        });

        it('should initialize darkColorSchemeMedia on browser', () => {
            expect(service.darkColorSchemeMedia).toBeDefined();
        });
    });
});
