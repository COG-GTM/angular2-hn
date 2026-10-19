import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, async, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';
import { Settings } from './shared/models/settings';

@Component({ template: '' })
class DummyRouteComponent {}

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let settings: Settings;
  let ga: jasmine.Spy;

  beforeEach(async(() => {
    ga = (window as any).ga = jasmine.createSpy('ga');
    settings = { showSettings: false, openLinkInNewTab: false, theme: 'night', titleFontSize: '16', listSpacing: '0' };

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: '', redirectTo: 'news/1', pathMatch: 'full' },
          { path: 'news/:page', component: DummyRouteComponent },
        ]),
      ],
      declarations: [AppComponent, DummyRouteComponent],
      providers: [{ provide: SettingsService, useValue: { settings } }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  afterEach(() => {
    delete (window as any).ga;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
    expect(component.settings).toBe(settings);
  });

  it('should render the app shell: header, router outlet and footer', () => {
    const wrapper: HTMLElement = fixture.nativeElement.querySelector('.wrapper');

    expect(wrapper.querySelector('app-header')).not.toBeNull();
    expect(wrapper.querySelector('router-outlet')).not.toBeNull();
    expect(wrapper.querySelector('app-footer')).not.toBeNull();
  });

  it('should apply the current theme as a class on the root element', () => {
    const root: HTMLElement = fixture.nativeElement.firstElementChild;
    expect(root.className).toBe('night');

    settings.theme = 'amoledblack';
    fixture.detectChanges();
    expect(root.className).toBe('amoledblack');
  });

  it('should report a Google Analytics pageview after each navigation', fakeAsync(() => {
    const router = TestBed.inject(Router);

    fixture.ngZone.run(() => router.navigateByUrl('/'));
    tick();

    expect(ga).toHaveBeenCalledWith('set', 'page', '/news/1');
    expect(ga).toHaveBeenCalledWith('send', 'pageview');
  }));
});
