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
    let mockSettings: Settings;

    beforeEach(async () => {
        mockSettings = {
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0'
        };

        mockSettingsService = jasmine.createSpyObj('SettingsService', ['toggleSettings'], {
            settings: mockSettings
        });

        routerEventsSubject = new Subject();

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [AppComponent],
            providers: [
                { provide: SettingsService, useValue: mockSettingsService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
    });

    it('should create the app', () => {
        expect(component).toBeTruthy();
    });

    it('should have settings from SettingsService', () => {
        expect(component.settings).toBe(mockSettings);
    });

    it('should have a router instance', () => {
        expect(component.router).toBeTruthy();
    });
});
