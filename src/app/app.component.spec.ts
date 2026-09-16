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
        {
          provide: SettingsService,
          useValue: {
            settings: {
              showSettings: false,
              openLinkInNewTab: false,
              theme: 'default',
              titleFontSize: '16',
              listSpacing: '0'
            }
          }
        },
        { provide: Router, useValue: { events: routerEvents } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should send a pageview to analytics on NavigationEnd', () => {
    routerEvents.next(new NavigationEnd(1, '/a', '/b'));
    expect(gaSpy).toHaveBeenCalledWith('set', 'page', '/b');
    expect(gaSpy).toHaveBeenCalledWith('send', 'pageview');
  });

  it('should not send a pageview for non-NavigationEnd events', () => {
    routerEvents.next(new NavigationStart(1, '/a'));
    expect(gaSpy).not.toHaveBeenCalled();
  });
});
