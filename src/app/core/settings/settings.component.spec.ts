import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('SettingsComponent', () => {
    let component: SettingsComponent;
    let fixture: ComponentFixture<SettingsComponent>;
    let mockSettingsService: any;

    beforeEach(async(() => {
        mockSettingsService = {
            toggleSettings: jasmine.createSpy('toggleSettings'),
            toggleOpenLinksInNewTab: jasmine.createSpy('toggleOpenLinksInNewTab'),
            setTheme: jasmine.createSpy('setTheme'),
            setFont: jasmine.createSpy('setFont'),
            setSpacing: jasmine.createSpy('setSpacing'),
            settings: {
                showSettings: false,
                openLinkInNewTab: false,
                theme: 'default',
                titleFontSize: '16',
                listSpacing: '0',
            },
        };

        TestBed.configureTestingModule({
            declarations: [SettingsComponent],
            providers: [{ provide: SettingsService, useValue: mockSettingsService }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SettingsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have settings from SettingsService', () => {
        expect(component.settings).toBeDefined();
        expect(component.settings.theme).toBe('default');
    });

    it('should call toggleSettings on closeSettings', () => {
        component.closeSettings();
        expect(mockSettingsService.toggleSettings).toHaveBeenCalled();
    });

    it('should call toggleOpenLinksInNewTab', () => {
        component.toggleOpenLinksInNewTab();
        expect(mockSettingsService.toggleOpenLinksInNewTab).toHaveBeenCalled();
    });

    it('should call setTheme with correct theme', () => {
        component.selectTheme('night');
        expect(mockSettingsService.setTheme).toHaveBeenCalledWith('night');
    });

    it('should call setFont with correct value', () => {
        component.changeTitleFont('20');
        expect(mockSettingsService.setFont).toHaveBeenCalledWith('20');
    });

    it('should call setSpacing with correct value', () => {
        component.changeSpacing('10');
        expect(mockSettingsService.setSpacing).toHaveBeenCalledWith('10');
    });
});
