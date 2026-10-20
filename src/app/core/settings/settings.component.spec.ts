import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

describe('SettingsComponent', () => {
  let fixture: ComponentFixture<SettingsComponent>;
  let component: SettingsComponent;
  let service: jasmine.SpyObj<SettingsService>;
  let settings: Settings;

  beforeEach(() => {
    settings = { showSettings: true, openLinkInNewTab: false, theme: 'night', titleFontSize: '18', listSpacing: '6' };
    service = jasmine.createSpyObj<SettingsService>(
      'SettingsService',
      ['toggleSettings', 'toggleOpenLinksInNewTab', 'setTheme', 'setFont', 'setSpacing']
    );
    service.settings = settings;

    TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      providers: [{ provide: SettingsService, useValue: service }],
    });

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function el(): HTMLElement {
    return fixture.nativeElement;
  }

  function input(selector: string): HTMLInputElement {
    return el().querySelector(selector) as HTMLInputElement;
  }

  it('renders the settings popup sections', () => {
    expect(el().querySelector('h1').textContent).toBe('Settings');
    const headings = Array.from(el().querySelectorAll('h2')).map(h => h.textContent);
    expect(headings).toEqual(['Links', 'Select a theme', 'Change Font']);
  });

  it('reflects the current settings in the form', () => {
    expect(component.settings).toBe(settings);
    expect(input('input[type=checkbox]').checked).toBe(false);
    expect(input('input[value=default]').checked).toBe(false);
    expect(input('input[value=night]').checked).toBe(true);
    expect(input('input[value=amoledblack]').checked).toBe(false);
    const [font, spacing] = Array.from(el().querySelectorAll('input[type=number]')) as HTMLInputElement[];
    expect(font.value).toBe('18');
    expect(spacing.value).toBe('6');
  });

  it('checks the open-in-new-tab box when the setting is on', () => {
    settings.openLinkInNewTab = true;
    fixture.detectChanges();
    expect(input('input[type=checkbox]').checked).toBe(true);
  });

  it('closes the popup when the close button is clicked', () => {
    (el().querySelector('.close') as HTMLElement).click();
    expect(service.toggleSettings).toHaveBeenCalled();
  });

  it('toggles open-in-new-tab when the checkbox changes', () => {
    input('input[type=checkbox]').dispatchEvent(new Event('change'));
    expect(service.toggleOpenLinksInNewTab).toHaveBeenCalled();
  });

  ['default', 'night', 'amoledblack'].forEach(theme => {
    it(`selects the "${theme}" theme when its radio is clicked`, () => {
      input(`input[value=${theme}]`).click();
      expect(service.setTheme).toHaveBeenCalledWith(theme);
    });
  });

  it('updates the title font size on keyup', () => {
    const font = el().querySelectorAll('input[type=number]')[0] as HTMLInputElement;
    font.value = '22';
    font.dispatchEvent(new KeyboardEvent('keyup'));
    expect(service.setFont).toHaveBeenCalledWith('22');
  });

  it('updates the list spacing on keyup', () => {
    const spacing = el().querySelectorAll('input[type=number]')[1] as HTMLInputElement;
    spacing.value = '12';
    spacing.dispatchEvent(new KeyboardEvent('keyup'));
    expect(service.setSpacing).toHaveBeenCalledWith('12');
  });
});
