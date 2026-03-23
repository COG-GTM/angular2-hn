import { TestBed, async, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, NavigationEnd } from '@angular/router';
import { Component } from '@angular/core';
import { Subject } from 'rxjs';

import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';

@Component({ selector: 'app-header', template: '' })
class MockHeaderComponent {}

@Component({ selector: 'app-footer', template: '' })
class MockFooterComponent {}

@Component({ template: '' })
class DummyComponent {}

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let mockSettingsService: any;
    let router: Router;

    beforeEach(async(() => {
        mockSettingsService = {
            toggleSettings: jasmine.createSpy('toggleSettings'),
            settings: {
                showSettings: false,
                openLinkInNewTab: false,
                theme: 'default',
                titleFontSize: '16',
                listSpacing: '0',
            },
        };

        // Define global ga function for Google Analytics
        (window as any).ga = jasmine.createSpy('ga');

        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule.withRoutes([
                    { path: '', component: DummyComponent },
                    { path: 'news', component: DummyComponent },
                ]),
            ],
            declarations: [AppComponent, MockHeaderComponent, MockFooterComponent, DummyComponent],
            providers: [{ provide: SettingsService, useValue: mockSettingsService }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
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

    it('should call ga on NavigationEnd', fakeAsync(() => {
        router.navigate(['/news']);
        tick();
        expect((window as any).ga).toHaveBeenCalledWith('set', 'page', '/news');
        expect((window as any).ga).toHaveBeenCalledWith('send', 'pageview');
    }));
});
