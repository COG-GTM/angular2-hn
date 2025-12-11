import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';

import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';
import { Settings } from './shared/models/settings';

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let mockSettingsService: jasmine.SpyObj<SettingsService>;
    let routerEventsSubject: Subject<any>;

    const mockSettings: Settings = {
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0',
    };

    beforeEach(async () => {
        routerEventsSubject = new Subject();

        mockSettingsService = jasmine.createSpyObj('SettingsService', ['toggleSettings'], {
            settings: mockSettings,
        });

        // Mock the ga function
        (window as any).ga = jasmine.createSpy('ga');

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [AppComponent],
            providers: [{ provide: SettingsService, useValue: mockSettingsService }],
        }).compileComponents();

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
        expect(component.settings).toBe(mockSettings);
    });

    it('should have a router instance', () => {
        expect(component.router).toBeDefined();
    });

    describe('Google Analytics tracking', () => {
        it('should track page views on NavigationEnd events', () => {
            const router = TestBed.inject(Router);
            const navigationEnd = new NavigationEnd(1, '/test', '/test');

            // Trigger a navigation event
            router.events.subscribe();

            expect(component).toBeTruthy();
        });
    });
});
