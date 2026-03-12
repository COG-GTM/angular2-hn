import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('SettingsComponent', () => {
    let component: SettingsComponent;
    let fixture: ComponentFixture<SettingsComponent>;
    let mockSettingsService: any;

    beforeEach(async(() => {
        mockSettingsService = {
            settings: {
                showSettings: true,
                openLinkInNewTab: false,
                theme: 'default',
                titleFontSize: '16',
                listSpacing: '0'
            },
            toggleSettings: jasmine.createSpy('toggleSettings'),
            toggleOpenLinksInNewTab: jasmine.createSpy('toggleOpenLinksInNewTab'),
            setTheme: jasmine.createSpy('setTheme'),
            setFont: jasmine.createSpy('setFont'),
            setSpacing: jasmine.createSpy('setSpacing')
        };

        TestBed.configureTestingModule({
            declarations: [SettingsComponent],
            providers: [
                { provide: SettingsService, useValue: mockSettingsService }
            ]
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

    it('should call toggleOpenLinksInNewTab on the service', () => {
        component.toggleOpenLinksInNewTab();
        expect(mockSettingsService.toggleOpenLinksInNewTab).toHaveBeenCalled();
    });

    it('should call setTheme with the provided theme', () => {
        component.selectTheme('night');
        expect(mockSettingsService.setTheme).toHaveBeenCalledWith('night');
    });

    it('should call setTheme with default', () => {
        component.selectTheme('default');
        expect(mockSettingsService.setTheme).toHaveBeenCalledWith('default');
    });

    it('should call setTheme with amoledblack', () => {
        component.selectTheme('amoledblack');
        expect(mockSettingsService.setTheme).toHaveBeenCalledWith('amoledblack');
    });

    it('should call setFont with the provided value', () => {
        component.changeTitleFont('20');
        expect(mockSettingsService.setFont).toHaveBeenCalledWith('20');
    });

    it('should call setSpacing with the provided value', () => {
        component.changeSpacing('10');
        expect(mockSettingsService.setSpacing).toHaveBeenCalledWith('10');
    });

    it('should render Settings heading', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('h1').textContent).toContain('Settings');
    });

    it('should render close button', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.close')).toBeTruthy();
    });

    it('should render theme radio buttons', () => {
        const compiled = fixture.debugElement.nativeElement;
        const radios = compiled.querySelectorAll('input[type="radio"]');
        expect(radios.length).toBe(3);
    });

    it('should render checkbox for open links in new tab', () => {
        const compiled = fixture.debugElement.nativeElement;
        const checkbox = compiled.querySelector('input[type="checkbox"]');
        expect(checkbox).toBeTruthy();
    });

    it('should render font size input', () => {
        const compiled = fixture.debugElement.nativeElement;
        const numberInputs = compiled.querySelectorAll('input[type="number"]');
        expect(numberInputs.length).toBe(2);
    });

    it('should call ngOnInit without errors', () => {
        expect(() => component.ngOnInit()).not.toThrow();
    });
});
