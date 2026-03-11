import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';

import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';

@Component({ selector: 'app-settings', template: '' })
class MockSettingsComponent {}

describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;
    let mockSettingsService: jasmine.SpyObj<SettingsService>;

    beforeEach(async(() => {
        mockSettingsService = jasmine.createSpyObj('SettingsService', ['toggleSettings']);
        mockSettingsService.settings = {
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        };

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [HeaderComponent, MockSettingsComponent],
            providers: [{ provide: SettingsService, useValue: mockSettingsService }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have settings from SettingsService', () => {
        expect(component.settings).toEqual(mockSettingsService.settings);
    });

    it('should call toggleSettings on SettingsService', () => {
        component.toggleSettings();
        expect(mockSettingsService.toggleSettings).toHaveBeenCalled();
    });

    it('should call window.scrollTo on scrollTop', () => {
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

    it('should render home link', () => {
        const compiled = fixture.nativeElement;
        const homeLink = compiled.querySelector('.home-link');
        expect(homeLink).toBeTruthy();
    });

    it('should render settings icon', () => {
        const compiled = fixture.nativeElement;
        const settingsImg = compiled.querySelector('.settings');
        expect(settingsImg).toBeTruthy();
    });

    it('should not show app-settings when showSettings is false', () => {
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('app-settings')).toBeFalsy();
    });

    it('should show app-settings when showSettings is true', () => {
        mockSettingsService.settings.showSettings = true;
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('app-settings')).toBeTruthy();
    });
});
