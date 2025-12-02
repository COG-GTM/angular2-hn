import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;
    let mockSettingsService: jasmine.SpyObj<SettingsService>;
    let mockSettings: Settings;

    beforeEach(async () => {
        mockSettings = {
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0'
        };

        mockSettingsService = jasmine.createSpyObj('SettingsService', ['toggleSettings'], {
            settings: mockSettings
        });

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [HeaderComponent],
            providers: [
                { provide: SettingsService, useValue: mockSettingsService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have settings from SettingsService', () => {
        expect(component.settings).toBe(mockSettings);
    });

    it('should call ngOnInit without errors', () => {
        expect(() => component.ngOnInit()).not.toThrow();
    });

    describe('toggleSettings', () => {
        it('should call settingsService.toggleSettings()', () => {
            component.toggleSettings();
            expect(mockSettingsService.toggleSettings).toHaveBeenCalled();
        });
    });

    describe('scrollTop', () => {
        it('should call window.scrollTo(0, 0)', () => {
            spyOn(window, 'scrollTo');
            component.scrollTop();
            expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
        });
    });
});
