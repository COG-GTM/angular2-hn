import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';

describe('AppComponent', () => {
  let events: Subject<any>;
  let settingsService: any;

  beforeEach(() => {
    events = new Subject<any>();
    settingsService = {
      settings: {
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0'
      }
    };
    (window as any).ga = jasmine.createSpy('ga');
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        {provide: Router, useValue: {events}},
        {provide: SettingsService, useValue: settingsService}
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  it('sends page views for navigation end events', () => {
    TestBed.createComponent(AppComponent);

    events.next(new NavigationEnd(1, '/news/1', '/news/1'));

    expect((window as any).ga).toHaveBeenCalledWith('set', 'page', '/news/1');
    expect((window as any).ga).toHaveBeenCalledWith('send', 'pageview');
  });

  it('does not send page views for other router events', () => {
    TestBed.createComponent(AppComponent);

    events.next({type: 'other'});

    expect((window as any).ga).not.toHaveBeenCalled();
  });
});
