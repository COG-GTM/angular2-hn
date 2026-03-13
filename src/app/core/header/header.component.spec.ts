import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';

import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';

@Component({ selector: 'app-settings', template: '' })
class MockSettingsComponent {}

describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;
    let mockSettingsService: any;

    beforeEach(() => {
        mockSettingsService = {
            settings: {
                showSettings: false,
                openLinkInNewTab: false,
                theme: 'default',
                titleFontSize: '16',
                listSpacing: '0',
            },
            toggleSettings: jasmine.createSpy('toggleSettings'),
        };

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [HeaderComponent, MockSettingsComponent],
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
        expect(component.settings).toBeTruthy();
        expect(component.settings.theme).toBe('default');
    });

    it('should call toggleSettings on service when toggleSettings is called', () => {
        component.toggleSettings();
        expect(mockSettingsService.toggleSettings).toHaveBeenCalled();
    });

    it('should call window.scrollTo when scrollTop is called', () => {
        spyOn(window, 'scrollTo');
        component.scrollTop();
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('should render navigation links', () => {
        const compiled = fixture.nativeElement;
        const links = compiled.querySelectorAll('.header-nav a');
        expect(links.length).toBe(4);
        expect(links[0].textContent).toContain('new');
        expect(links[1].textContent).toContain('show');
        expect(links[2].textContent).toContain('ask');
        expect(links[3].textContent).toContain('jobs');
    });

    it('should render logo', () => {
        const compiled = fixture.nativeElement;
        const logo = compiled.querySelector('.logo');
        expect(logo).toBeTruthy();
    });

    it('should render settings icon', () => {
        const compiled = fixture.nativeElement;
        const settingsIcon = compiled.querySelector('.settings');
        expect(settingsIcon).toBeTruthy();
    });

    it('should call toggleSettings when settings icon is clicked', () => {
        const compiled = fixture.nativeElement;
        const settingsIcon = compiled.querySelector('.settings');
        settingsIcon.click();
        expect(mockSettingsService.toggleSettings).toHaveBeenCalled();
    });
});
