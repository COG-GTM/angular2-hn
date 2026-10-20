import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HeaderComponent } from './header.component';
import { SettingsComponent } from '../settings/settings.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;
  let service: jasmine.SpyObj<SettingsService>;
  let settings: Settings;

  beforeEach(() => {
    settings = { showSettings: false, openLinkInNewTab: false, theme: 'default', titleFontSize: '16', listSpacing: '0' };
    service = jasmine.createSpyObj<SettingsService>('SettingsService', ['toggleSettings']);
    service.settings = settings;
    service.toggleSettings.and.callFake(() => (settings.showSettings = !settings.showSettings));
    spyOn(window, 'scrollTo');

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([{ path: '**', children: [] }])],
      declarations: [HeaderComponent, SettingsComponent],
      providers: [{ provide: SettingsService, useValue: service }],
    });

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function el(): HTMLElement {
    return fixture.nativeElement;
  }

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.settings).toBe(settings);
  });

  it('renders the logo linking home', () => {
    const home = el().querySelector('a.home-link');
    expect(home.getAttribute('href')).toBe('/news/1');
    expect(home.querySelector('img.logo').getAttribute('alt')).toBe('Logo');
  });

  it('renders the feed navigation links', () => {
    const links = Array.from(el().querySelectorAll('.header-nav a'));
    expect(links.map(a => a.textContent)).toEqual(['new', 'show', 'ask', 'jobs']);
    expect(links.map(a => a.getAttribute('href'))).toEqual(['/newest/1', '/show/1', '/ask/1', '/jobs/1']);
  });

  it('scrolls to top when a nav link is clicked', () => {
    (el().querySelector('.header-nav a') as HTMLElement).click();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('toggles the settings popup when the cog is clicked', () => {
    expect(el().querySelector('app-settings')).toBeNull();

    (el().querySelector('img.settings') as HTMLElement).click();
    fixture.detectChanges();
    expect(service.toggleSettings).toHaveBeenCalledTimes(1);
    expect(el().querySelector('app-settings')).toBeTruthy();

    (el().querySelector('img.settings') as HTMLElement).click();
    fixture.detectChanges();
    expect(el().querySelector('app-settings')).toBeNull();
  });
});
