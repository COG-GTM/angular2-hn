import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { Subject } from 'rxjs';
import { Component } from '@angular/core';

import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';

@Component({ selector: 'app-header', template: '' })
class MockHeaderComponent {}

@Component({ selector: 'app-footer', template: '' })
class MockFooterComponent {}

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let mockSettingsService: jasmine.SpyObj<SettingsService>;
    let routerEvents$: Subject<any>;

    beforeEach(async(() => {
        mockSettingsService = jasmine.createSpyObj('SettingsService', ['toggleSettings']);
        mockSettingsService.settings = {
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        };

        routerEvents$ = new Subject();

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [AppComponent, MockHeaderComponent, MockFooterComponent],
            providers: [{ provide: SettingsService, useValue: mockSettingsService }],
        }).compileComponents();
    }));

    beforeEach(() => {
        // Mock ga function
        (window as any).ga = jasmine.createSpy('ga');

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
        expect(component.settings).toEqual(mockSettingsService.settings);
    });

    it('should have a theme from settings', () => {
        expect(component.settings.theme).toBe('default');
    });

    it('should render app-header', () => {
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('app-header')).toBeTruthy();
    });

    it('should render app-footer', () => {
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('app-footer')).toBeTruthy();
    });

    it('should render router-outlet', () => {
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('router-outlet')).toBeTruthy();
    });

    it('should call ga on NavigationEnd events', () => {
        const router = TestBed.inject(Router);
        const gaFn = (window as any).ga;

        // Simulate a NavigationEnd event
        const navEnd = new NavigationEnd(1, '/news/1', '/news/1');
        (router.events as Subject<any>).next(navEnd);

        expect(gaFn).toHaveBeenCalledWith('set', 'page', '/news/1');
        expect(gaFn).toHaveBeenCalledWith('send', 'pageview');
    });

    it('should not call ga on non-NavigationEnd events', () => {
        const router = TestBed.inject(Router);
        const gaFn = (window as any).ga;
        gaFn.calls.reset();

        // Simulate a NavigationStart event (not NavigationEnd)
        const navStart = new NavigationStart(1, '/news/1');
        (router.events as Subject<any>).next(navStart);

        expect(gaFn).not.toHaveBeenCalled();
    });
});
