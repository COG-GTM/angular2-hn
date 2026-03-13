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
    let mockSettingsService: any;

    beforeEach(async(() => {
        mockSettingsService = {
            settings: {
                showSettings: false,
                openLinkInNewTab: false,
                theme: 'default',
                titleFontSize: '16',
                listSpacing: '0'
            },
            toggleSettings: jasmine.createSpy('toggleSettings')
        };

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [HeaderComponent, MockSettingsComponent],
            providers: [
                { provide: SettingsService, useValue: mockSettingsService }
            ]
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
        expect(component.settings).toBeDefined();
        expect(component.settings.theme).toBe('default');
    });

    it('should call toggleSettings on the service', () => {
        component.toggleSettings();
        expect(mockSettingsService.toggleSettings).toHaveBeenCalled();
    });

    it('should call scrollTop and scroll to top', () => {
        spyOn(window, 'scrollTo');
        component.scrollTop();
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('should render header element', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('header')).toBeTruthy();
    });

    it('should render the logo', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.logo')).toBeTruthy();
    });

    it('should render navigation links', () => {
        const compiled = fixture.debugElement.nativeElement;
        const links = compiled.querySelectorAll('.header-nav a');
        expect(links.length).toBe(4);
    });

    it('should render settings icon', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.settings')).toBeTruthy();
    });

    it('should not show settings panel when showSettings is false', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('app-settings')).toBeFalsy();
    });

    it('should show settings panel when showSettings is true', () => {
        component.settings.showSettings = true;
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('app-settings')).toBeTruthy();
    });

    it('should have home link to /news/1', () => {
        const compiled = fixture.debugElement.nativeElement;
        const homeLink = compiled.querySelector('.home-link');
        expect(homeLink).toBeTruthy();
    });

    it('should call ngOnInit without errors', () => {
        expect(() => component.ngOnInit()).not.toThrow();
    });
});
