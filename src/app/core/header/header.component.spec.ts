import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let settings: Settings;
  let settingsService: jasmine.SpyObj<SettingsService>;

  beforeEach(async(() => {
    settings = { showSettings: false, openLinkInNewTab: false, theme: 'default', titleFontSize: '16', listSpacing: '0' };
    settingsService = jasmine.createSpyObj<SettingsService>('SettingsService', ['toggleSettings']);
    settingsService.settings = settings;

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [HeaderComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and share the settings object from SettingsService', () => {
    expect(component).toBeTruthy();
    expect(component.settings).toBe(settings);
  });

  it('should render the logo linking to the first news page', () => {
    const home: HTMLAnchorElement = fixture.nativeElement.querySelector('a.home-link');

    expect(home.getAttribute('href')).toBe('/news/1');
    expect(home.querySelector('img.logo').getAttribute('alt')).toBe('Logo');
  });

  it('should render navigation links for each feed', () => {
    const links: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('.header-nav a'));

    expect(links.map(a => a.textContent.trim())).toEqual(['new', 'show', 'ask', 'jobs']);
    expect(links.map(a => a.getAttribute('href'))).toEqual(['/newest/1', '/show/1', '/ask/1', '/jobs/1']);
  });

  it('should toggle settings when the cog is clicked', () => {
    fixture.nativeElement.querySelector('img.settings').click();

    expect(settingsService.toggleSettings).toHaveBeenCalled();
  });

  it('should only render the settings panel when showSettings is true', () => {
    expect(fixture.nativeElement.querySelector('app-settings')).toBeNull();

    settings.showSettings = true;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-settings')).not.toBeNull();
  });

  it('should scroll to the top when a nav link is clicked', () => {
    spyOn(window, 'scrollTo');

    fixture.nativeElement.querySelector('.header-nav a').click();

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });
});
