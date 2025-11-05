import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, NavigationEnd } from '@angular/router';
import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';
import { Settings } from './shared/models/settings';
import { Subject } from 'rxjs';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let settingsService: jasmine.SpyObj<SettingsService>;
  let router: jasmine.SpyObj<Router>;
  let mockSettings: Settings;
  let routerEventsSubject: Subject<any>;
  let gaFunction: jasmine.Spy;

  beforeEach(async () => {
    mockSettings = {
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0'
    };

    settingsService = jasmine.createSpyObj('SettingsService', []);
    settingsService.settings = mockSettings;

    routerEventsSubject = new Subject();
    router = jasmine.createSpyObj('Router', ['navigate']);
    Object.defineProperty(router, 'events', { value: routerEventsSubject.asObservable() });

    gaFunction = jasmine.createSpy('ga');
    (window as any).ga = gaFunction;

    await TestBed.configureTestingModule({
      declarations: [ AppComponent ],
      providers: [
        { provide: SettingsService, useValue: settingsService },
        { provide: Router, useValue: router }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    delete (window as any).ga;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize settings from service', () => {
    expect(component.settings).toEqual(mockSettings);
  });

  it('should call ga on NavigationEnd events', () => {
    const navigationEnd = new NavigationEnd(1, '/test', '/test');
    routerEventsSubject.next(navigationEnd);

    expect(gaFunction).toHaveBeenCalledWith('set', 'page', '/test');
    expect(gaFunction).toHaveBeenCalledWith('send', 'pageview');
  });

  it('should not call ga on non-NavigationEnd events', () => {
    gaFunction.calls.reset();
    routerEventsSubject.next({ type: 'other' });

    expect(gaFunction).not.toHaveBeenCalled();
  });
});
