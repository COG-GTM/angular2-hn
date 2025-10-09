import { TestBed } from '@angular/core/testing';
import { Router, NavigationEnd } from '@angular/router';
import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';
import { of } from 'rxjs';

describe('AppComponent', () => {
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSettingsService: jasmine.SpyObj<SettingsService>;

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate'], {
      events: of(new NavigationEnd(0, '/test', '/test'))
    });
    
    mockSettingsService = jasmine.createSpyObj('SettingsService', [], {
      settings: {
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0'
      }
    });

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: SettingsService, useValue: mockSettingsService }
      ]
    });
  });

  it('should create the app component', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have settings from SettingsService', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.settings).toBe(mockSettingsService.settings);
  });
});
