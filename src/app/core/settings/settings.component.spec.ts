import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

describe('SettingsComponent', () => {
    let component: SettingsComponent;
    let fixture: ComponentFixture<SettingsComponent>;
    let mockSettingsService: jasmine.SpyObj<SettingsService>;

    const mockSettings: Settings = {
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0',
    };

    beforeEach(async () => {
        mockSettingsService = jasmine.createSpyObj('SettingsService', [
            'toggleSettings',
            'toggleOpenLinksInNewTab',
            'setTheme',
            'setFont',
            'setSpacing',
        ], {
            settings: mockSettings,
        });

        await TestBed.configureTestingModule({
            declarations: [SettingsComponent],
            providers: [{ provide: SettingsService, useValue: mockSettingsService }],
        }).compileComponents();

        fixture = TestBed.createComponent(SettingsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have settings from SettingsService', () => {
        expect(component.settings).toBe(mockSettings);
    });

    describe('closeSettings', () => {
        it('should call settingsService.toggleSettings', () => {
            component.closeSettings();
            expect(mockSettingsService.toggleSettings).toHaveBeenCalled();
        });
    });

    describe('toggleOpenLinksInNewTab', () => {
        it('should call settingsService.toggleOpenLinksInNewTab', () => {
            component.toggleOpenLinksInNewTab();
            expect(mockSettingsService.toggleOpenLinksInNewTab).toHaveBeenCalled();
        });
    });

    describe('selectTheme', () => {
        it('should call settingsService.setTheme with the provided theme', () => {
            component.selectTheme('night');
            expect(mockSettingsService.setTheme).toHaveBeenCalledWith('night');
        });

        it('should call settingsService.setTheme with default theme', () => {
            component.selectTheme('default');
            expect(mockSettingsService.setTheme).toHaveBeenCalledWith('default');
        });
    });

    describe('changeTitleFont', () => {
        it('should call settingsService.setFont with the provided value', () => {
            component.changeTitleFont('18');
            expect(mockSettingsService.setFont).toHaveBeenCalledWith('18');
        });
    });

    describe('changeSpacing', () => {
        it('should call settingsService.setSpacing with the provided value', () => {
            component.changeSpacing('10');
            expect(mockSettingsService.setSpacing).toHaveBeenCalledWith('10');
        });
    });

    it('should call ngOnInit', () => {
        spyOn(component, 'ngOnInit');
        component.ngOnInit();
        expect(component.ngOnInit).toHaveBeenCalled();
    });
});
