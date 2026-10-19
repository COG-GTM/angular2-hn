import { ComponentFixture, TestBed, async } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let element: HTMLElement;
  let settings: Settings;
  let settingsService: jasmine.SpyObj<SettingsService>;

  beforeEach(async(() => {
    settings = { showSettings: true, openLinkInNewTab: true, theme: 'night', titleFontSize: '18', listSpacing: '4' };
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
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  function themeRadio(value: string): HTMLInputElement {
    return element.querySelector(`input[type="radio"][value="${value}"]`);
  }

  function numberInputs(): HTMLInputElement[] {
    return Array.from(element.querySelectorAll('input[type="number"]'));
  }

  it('should create and render the settings popup', () => {
    expect(component).toBeTruthy();
    expect(element.querySelector('h1').textContent).toBe('Settings');
    expect(Array.from(element.querySelectorAll('h2')).map(h => h.textContent)).toEqual([
      'Links',
      'Select a theme',
      'Change Font',
    ]);
  });

  it('should reflect the current settings in the controls', () => {
    const [titleFont, listSpacing] = numberInputs();

    expect(element.querySelector<HTMLInputElement>('input[type="checkbox"]').checked).toBe(true);
    expect(themeRadio('default').checked).toBe(false);
    expect(themeRadio('night').checked).toBe(true);
    expect(themeRadio('amoledblack').checked).toBe(false);
    expect(titleFont.value).toBe('18');
    expect(listSpacing.value).toBe('4');
  });

  it('should close the popup via the close button', () => {
    element.querySelector<HTMLElement>('.close').click();

    expect(settingsService.toggleSettings).toHaveBeenCalled();
  });

  it('should toggle opening links in a new tab when the checkbox changes', () => {
    element.querySelector('input[type="checkbox"]').dispatchEvent(new Event('change'));

    expect(settingsService.toggleOpenLinksInNewTab).toHaveBeenCalled();
  });

  it('should select the clicked theme', () => {
    themeRadio('amoledblack').click();
    expect(settingsService.setTheme).toHaveBeenCalledWith('amoledblack');

    themeRadio('default').click();
    expect(settingsService.setTheme).toHaveBeenCalledWith('default');
  });

  it('should change the title font size on keyup', () => {
    const [titleFont] = numberInputs();
    titleFont.value = '24';
    titleFont.dispatchEvent(new Event('keyup'));

    expect(settingsService.setFont).toHaveBeenCalledWith('24');
  });

  it('should change the list spacing on keyup', () => {
    const [, listSpacing] = numberInputs();
    listSpacing.value = '10';
    listSpacing.dispatchEvent(new Event('keyup'));

    expect(settingsService.setSpacing).toHaveBeenCalledWith('10');
  });
});
