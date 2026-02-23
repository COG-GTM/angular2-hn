import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';

import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';
import { HeaderComponent } from './core/header/header.component';
import { FooterComponent } from './core/footer/footer.component';
import { SettingsComponent } from './core/settings/settings.component';
import { CommonModule } from '@angular/common';

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let routerEvents: Subject<any>;

    beforeEach(async () => {
        routerEvents = new Subject();

        // Define global ga function to prevent errors
        (window as any).ga = jasmine.createSpy('ga');

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, CommonModule],
            declarations: [AppComponent, HeaderComponent, FooterComponent, SettingsComponent],
            providers: [SettingsService],
        }).compileComponents();
    });

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
        expect(component.settings).toBeTruthy();
    });

    it('should have a router instance', () => {
        expect(component.router).toBeTruthy();
    });
});
