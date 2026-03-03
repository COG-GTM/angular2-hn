import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
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
    let settingsService: SettingsService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [AppComponent, MockHeaderComponent, MockFooterComponent],
            providers: [SettingsService],
        }).compileComponents();
    }));

    beforeEach(() => {
        // Mock the global ga function
        (window as any).ga = jasmine.createSpy('ga');
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        settingsService = TestBed.inject(SettingsService);
    });

    afterEach(() => {
        delete (window as any).ga;
    });

    it('should create the app', () => {
        expect(component).toBeTruthy();
    });

    it('should have settings from SettingsService', () => {
        expect(component.settings).toBe(settingsService.settings);
    });

    it('should have a router', () => {
        expect(component.router).toBeTruthy();
    });
});
