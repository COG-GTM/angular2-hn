import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('SettingsComponent', () => {
    let component: SettingsComponent;
    let fixture: ComponentFixture<SettingsComponent>;
    let mockSettingsService: jasmine.SpyObj<SettingsService>;

    beforeEach(async(() => {
        mockSettingsService = jasmine.createSpyObj(
            'SettingsService',
            ['toggleSettings', 'toggleOpenLinksInNewTab', 'setTheme', 'setFont', 'setSpacing']
        );
        mockSettingsService.settings = {
            showSettings: true,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
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
        expect(component.settings).toEqual(mockSettingsService.settings);
    });

    it('should call toggleSettings on closeSettings', () => {
        component.closeSettings();
        expect(mockSettingsService.toggleSettings).toHaveBeenCalled();
    });

    it('should call toggleOpenLinksInNewTab on service', () => {
        component.toggleOpenLinksInNewTab();
        expect(mockSettingsService.toggleOpenLinksInNewTab).toHaveBeenCalled();
    });

    it('should call setTheme on selectTheme', () => {
        component.selectTheme('night');
        expect(mockSettingsService.setTheme).toHaveBeenCalledWith('night');
    });

    it('should call setFont on changeTitleFont', () => {
        component.changeTitleFont('20');
        expect(mockSettingsService.setFont).toHaveBeenCalledWith('20');
    });

    it('should call setSpacing on changeSpacing', () => {
        component.changeSpacing('10');
        expect(mockSettingsService.setSpacing).toHaveBeenCalledWith('10');
    });

    it('should render Settings heading', () => {
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('h1').textContent).toContain('Settings');
    });

    it('should render close button', () => {
        const compiled = fixture.nativeElement;
        const closeBtn = compiled.querySelector('.close');
        expect(closeBtn).toBeTruthy();
    });

    it('should render theme radio buttons', () => {
        const compiled = fixture.nativeElement;
        const radios = compiled.querySelectorAll('input[type="radio"]');
        expect(radios.length).toBe(3);
    });

    it('should render checkbox for open links in new tab', () => {
        const compiled = fixture.nativeElement;
        const checkbox = compiled.querySelector('input[type="checkbox"]');
        expect(checkbox).toBeTruthy();
    });

    it('should render font size input', () => {
        const compiled = fixture.nativeElement;
        const numberInputs = compiled.querySelectorAll('input[type="number"]');
        expect(numberInputs.length).toBe(2);
    });
});
