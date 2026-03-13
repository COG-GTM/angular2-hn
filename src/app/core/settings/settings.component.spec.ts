import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('SettingsComponent', () => {
    let component: SettingsComponent;
    let fixture: ComponentFixture<SettingsComponent>;
    let mockSettingsService: any;

    beforeEach(() => {
        mockSettingsService = {
            settings: {
                showSettings: true,
                openLinkInNewTab: false,
                theme: 'default',
                titleFontSize: '16',
                listSpacing: '0',
            },
            toggleSettings: jasmine.createSpy('toggleSettings'),
            toggleOpenLinksInNewTab: jasmine.createSpy('toggleOpenLinksInNewTab'),
            setTheme: jasmine.createSpy('setTheme'),
            setFont: jasmine.createSpy('setFont'),
            setSpacing: jasmine.createSpy('setSpacing'),
        };

        TestBed.configureTestingModule({
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
        expect(component.settings).toBeTruthy();
        expect(component.settings.theme).toBe('default');
    });

    it('should call toggleSettings on service when closeSettings is called', () => {
        component.closeSettings();
        expect(mockSettingsService.toggleSettings).toHaveBeenCalled();
    });

    it('should call toggleOpenLinksInNewTab on service', () => {
        component.toggleOpenLinksInNewTab();
        expect(mockSettingsService.toggleOpenLinksInNewTab).toHaveBeenCalled();
    });

    it('should call setTheme on service with correct theme', () => {
        component.selectTheme('night');
        expect(mockSettingsService.setTheme).toHaveBeenCalledWith('night');
    });

    it('should call setTheme with amoledblack', () => {
        component.selectTheme('amoledblack');
        expect(mockSettingsService.setTheme).toHaveBeenCalledWith('amoledblack');
    });

    it('should call setFont on service with correct value', () => {
        component.changeTitleFont('20');
        expect(mockSettingsService.setFont).toHaveBeenCalledWith('20');
    });

    it('should call setSpacing on service with correct value', () => {
        component.changeSpacing('10');
        expect(mockSettingsService.setSpacing).toHaveBeenCalledWith('10');
    });

    it('should render settings heading', () => {
        const compiled = fixture.nativeElement;
        const heading = compiled.querySelector('h1');
        expect(heading.textContent).toContain('Settings');
    });

    it('should render close button', () => {
        const compiled = fixture.nativeElement;
        const closeBtn = compiled.querySelector('.close');
        expect(closeBtn).toBeTruthy();
    });

    it('should call closeSettings when close button is clicked', () => {
        const compiled = fixture.nativeElement;
        const closeBtn = compiled.querySelector('.close');
        closeBtn.click();
        expect(mockSettingsService.toggleSettings).toHaveBeenCalled();
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
        const inputs = compiled.querySelectorAll('input[type="number"]');
        expect(inputs.length).toBe(2);
    });
});
