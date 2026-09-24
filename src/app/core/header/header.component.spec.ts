import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HeaderComponent } from './header.component';
import { SettingsComponent } from '../settings/settings.component';
import { SettingsService } from '../../shared/services/settings.service';
import { SettingsServiceStub } from '../../testing/settings-service.stub';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;
  let settingsService: SettingsServiceStub;

  beforeEach(async(() => {
    settingsService = new SettingsServiceStub();
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [HeaderComponent, SettingsComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('exposes the shared settings object', () => {
    expect(component.settings).toBe(settingsService.settings);
  });

  it('toggles settings when the cog is clicked', () => {
    fixture.nativeElement.querySelector('img.settings').click();
    expect(settingsService.toggleSettings).toHaveBeenCalled();
  });

  it('scrolls to top on nav click', () => {
    const spy = spyOn(window, 'scrollTo');
    fixture.nativeElement.querySelector('a.home-link').click();
    expect(spy).toHaveBeenCalledWith(0, 0);
  });

  it('renders the settings panel only when showSettings is true', () => {
    expect(fixture.nativeElement.querySelector('app-settings')).toBeNull();
    settingsService.settings.showSettings = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-settings')).not.toBeNull();
  });
});
