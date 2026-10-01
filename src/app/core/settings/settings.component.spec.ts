import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

describe('SettingsComponent', () => {
  let fixture: ComponentFixture<SettingsComponent>;
  let component: SettingsComponent;
  let settingsService: jasmine.SpyObj<SettingsService>;
  let settings: Settings;

  const query = (selector: string): HTMLInputElement =>
    fixture.debugElement.query(By.css(selector)).nativeElement;
  const numberInputs = (): HTMLInputElement[] =>
    fixture.debugElement.queryAll(By.css('input[type="number"]')).map(de => de.nativeElement);

  beforeEach(() => {
    settings = {
      showSettings: true,
      openLinkInNewTab: true,
      theme: 'night',
      titleFontSize: '18',
      listSpacing: '4',
    };
    settingsService = jasmine.createSpyObj<SettingsService>('SettingsService', [
      'toggleSettings',
      'toggleOpenLinksInNewTab',
      'setTheme',
      'setFont',
      'setSpacing',
    ]);
    settingsService.settings = settings;

    TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }],
    });

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create with the settings from SettingsService', () => {
    expect(component).toBeTruthy();
    expect(component.settings).toBe(settings);
  });

  it('should render the current settings into the form controls', () => {
    expect(query('h1').textContent).toContain('Settings');
    expect(query('input[type="checkbox"]').checked).toBe(true);
    expect(query('input[value="default"]').checked).toBe(false);
    expect(query('input[value="night"]').checked).toBe(true);
    expect(query('input[value="amoledblack"]').checked).toBe(false);

    const [titleFont, listSpacing] = numberInputs();
    expect(titleFont.value).toBe('18');
    expect(listSpacing.value).toBe('4');
  });

  it('should check the radio matching the selected theme', () => {
    settings.theme = 'amoledblack';
    fixture.detectChanges();

    expect(query('input[value="night"]').checked).toBe(false);
    expect(query('input[value="amoledblack"]').checked).toBe(true);
  });

  it('should close the popup when the close icon is clicked', () => {
    query('.close').click();

    expect(settingsService.toggleSettings).toHaveBeenCalledTimes(1);
  });

  it('should toggle "open links in a new tab" when the checkbox changes', () => {
    query('input[type="checkbox"]').dispatchEvent(new Event('change'));

    expect(settingsService.toggleOpenLinksInNewTab).toHaveBeenCalledTimes(1);
  });

  ['default', 'night', 'amoledblack'].forEach(theme => {
    it(`should select the "${theme}" theme when its radio is clicked`, () => {
      query(`input[value="${theme}"]`).click();

      expect(settingsService.setTheme).toHaveBeenCalledWith(theme);
    });
  });

  it('should update the title font size on keyup', () => {
    const [titleFont] = numberInputs();
    titleFont.value = '22';
    titleFont.dispatchEvent(new KeyboardEvent('keyup'));

    expect(settingsService.setFont).toHaveBeenCalledWith('22');
  });

  it('should update the list spacing on keyup', () => {
    const [, listSpacing] = numberInputs();
    listSpacing.value = '10';
    listSpacing.dispatchEvent(new KeyboardEvent('keyup'));

    expect(settingsService.setSpacing).toHaveBeenCalledWith('10');
  });
});
