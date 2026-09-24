import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { Subject } from 'rxjs';

import { AppComponent } from './app.component';
import { HeaderComponent } from './core/header/header.component';
import { FooterComponent } from './core/footer/footer.component';
import { SettingsComponent } from './core/settings/settings.component';
import { SettingsService } from './shared/services/settings.service';
import { SettingsServiceStub } from './testing/settings-service.stub';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let events$: Subject<any>;
  let ga: jasmine.Spy;
  let settingsService: SettingsServiceStub;

  beforeEach(async(() => {
    events$ = new Subject();
    ga = jasmine.createSpy('ga');
    (window as any).ga = ga;
    settingsService = new SettingsServiceStub();

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent, HeaderComponent, FooterComponent, SettingsComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }],
    }).compileComponents();

    const router = TestBed.inject(Router);
    Object.defineProperty(router, 'events', { get: () => events$ });
  }));

  afterEach(() => {
    delete (window as any).ga;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
  });

  it('applies the current theme as a class', () => {
    settingsService.settings.theme = 'night';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.night')).not.toBeNull();
  });

  it('reports pageviews to analytics on NavigationEnd', () => {
    events$.next(new NavigationStart(1, '/news/1'));
    expect(ga).not.toHaveBeenCalled();

    events$.next(new NavigationEnd(1, '/news/1', '/news/1'));
    expect(ga).toHaveBeenCalledWith('set', 'page', '/news/1');
    expect(ga).toHaveBeenCalledWith('send', 'pageview');
  });

  it('renders header and footer', () => {
    expect(fixture.nativeElement.querySelector('app-header')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-footer')).not.toBeNull();
  });
});
