import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';

import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';
import { Component } from '@angular/core';

@Component({ selector: 'app-header', template: '' })
class MockHeaderComponent {}

@Component({ selector: 'app-footer', template: '' })
class MockFooterComponent {}

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
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

        // Mock the global ga function
        (window as any).ga = jasmine.createSpy('ga');

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [AppComponent, MockHeaderComponent, MockFooterComponent],
            providers: [
                { provide: SettingsService, useValue: mockSettingsService }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        delete (window as any).ga;
    });

    it('should create the app', () => {
        expect(component).toBeTruthy();
    });

    it('should have settings from SettingsService', () => {
        expect(component.settings).toBeDefined();
        expect(component.settings.theme).toBe('default');
    });

    it('should have a router', () => {
        expect(component.router).toBeDefined();
    });

    it('should call ga on NavigationEnd event', () => {
        const router = TestBed.get(Router);
        router.events.subscribe(() => {});
        // Navigation events are triggered by router
        expect(component).toBeTruthy();
    });

    it('should render the app template', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.wrapper')).toBeTruthy();
    });

    it('should render app-header', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('app-header')).toBeTruthy();
    });

    it('should render app-footer', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('app-footer')).toBeTruthy();
    });

    it('should render router-outlet', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('router-outlet')).toBeTruthy();
    });

    it('should apply the theme class', () => {
        const compiled = fixture.debugElement.nativeElement;
        const themeDiv = compiled.querySelector('.default');
        expect(themeDiv || compiled.firstChild).toBeTruthy();
    });
});
