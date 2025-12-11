import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;
    let mockSettingsService: jasmine.SpyObj<SettingsService>;

    const mockSettings: Settings = {
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0',
    };

    beforeEach(async () => {
        mockSettingsService = jasmine.createSpyObj('SettingsService', ['toggleSettings'], {
            settings: mockSettings,
        });

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [HeaderComponent],
            providers: [{ provide: SettingsService, useValue: mockSettingsService }],
        }).compileComponents();

        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have settings from SettingsService', () => {
        expect(component.settings).toBe(mockSettings);
    });

    describe('toggleSettings', () => {
        it('should call settingsService.toggleSettings', () => {
            component.toggleSettings();
            expect(mockSettingsService.toggleSettings).toHaveBeenCalled();
        });
    });

    describe('scrollTop', () => {
        it('should scroll window to top', () => {
            spyOn(window, 'scrollTo');
            component.scrollTop();
            expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
        });
    });

    it('should call ngOnInit', () => {
        spyOn(component, 'ngOnInit');
        component.ngOnInit();
        expect(component.ngOnInit).toHaveBeenCalled();
    });
});
