import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
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
    let router: Router;

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

        // Define ga function on window to prevent errors
        (window as any).ga = jasmine.createSpy('ga');

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [AppComponent, MockHeaderComponent, MockFooterComponent],
            providers: [{ provide: SettingsService, useValue: mockSettingsService }],
        }).compileComponents();

        router = TestBed.inject(Router);
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        delete (window as any).ga;
    });

    it('should create the app', () => {
        expect(component).toBeTruthy();
    });

    it('should have settings from SettingsService', () => {
        expect(component.settings).toBeTruthy();
        expect(component.settings.theme).toBe('default');
    });

    it('should render app-header and app-footer', () => {
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('app-header')).toBeTruthy();
        expect(compiled.querySelector('app-footer')).toBeTruthy();
    });

    it('should render router-outlet', () => {
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('router-outlet')).toBeTruthy();
    });

    it('should apply theme class to wrapper div', () => {
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        const div = compiled.querySelector('div');
        expect(div.className).toContain('default');
    });

    it('should call ga on NavigationEnd events', () => {
        // Trigger a NavigationEnd event through the router
        const navEnd = new NavigationEnd(1, '/news', '/news');
        (router.events as Subject<any>).next(navEnd);
        expect((window as any).ga).toHaveBeenCalledWith('set', 'page', '/news');
        expect((window as any).ga).toHaveBeenCalledWith('send', 'pageview');
    });

    it('should not call ga on non-NavigationEnd events', () => {
        (window as any).ga.calls.reset();
        const navStart = new NavigationStart(1, '/news');
        (router.events as Subject<any>).next(navStart);
        expect((window as any).ga).not.toHaveBeenCalled();
    });
});
