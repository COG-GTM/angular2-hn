import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { Subject } from 'rxjs';

import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let routerEvents: Subject<any>;
  let gaSpy: jasmine.Spy;

  beforeEach(() => {
    routerEvents = new Subject<any>();
    gaSpy = jasmine.createSpy('ga');
    (window as any).ga = gaSpy;

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        { provide: SettingsService, useValue: { settings: { theme: 'default' } } },
        { provide: Router, useValue: { events: routerEvents.asObservable() } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the app and wires up settings', () => {
    expect(component).toBeTruthy();
    expect(component.settings.theme).toBe('default');
  });

  it('sends a google analytics pageview on NavigationEnd', () => {
    routerEvents.next(new NavigationEnd(1, '/news/1', '/news/1'));
    expect(gaSpy).toHaveBeenCalledWith('set', 'page', '/news/1');
    expect(gaSpy).toHaveBeenCalledWith('send', 'pageview');
  });

  it('ignores router events other than NavigationEnd', () => {
    routerEvents.next(new NavigationStart(1, '/news/1'));
    expect(gaSpy).not.toHaveBeenCalled();
  });
});
