import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';
import { SettingsServiceStub } from '../../testing/settings-service.stub';

describe('SettingsComponent', () => {
  let fixture: ComponentFixture<SettingsComponent>;
  let el: HTMLElement;
  let settingsService: SettingsServiceStub;

  beforeEach(async(() => {
    settingsService = new SettingsServiceStub();
    TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('closes via the service', () => {
    (el.querySelector('.close') as HTMLElement).click();
    expect(settingsService.toggleSettings).toHaveBeenCalled();
  });

  it('toggles open-in-new-tab on checkbox change', () => {
    const checkbox = el.querySelector('input[type=checkbox]') as HTMLInputElement;
    checkbox.dispatchEvent(new Event('change'));
    expect(settingsService.toggleOpenLinksInNewTab).toHaveBeenCalled();
  });

  it('selects a theme', () => {
    (el.querySelector('input[value=night]') as HTMLInputElement).click();
    expect(settingsService.setTheme).toHaveBeenCalledWith('night');
  });

  it('marks the active theme radio as checked', () => {
    expect((el.querySelector('input[value=default]') as HTMLInputElement).checked).toBe(true);
    expect((el.querySelector('input[value=amoledblack]') as HTMLInputElement).checked).toBe(false);
  });

  it('changes the title font size on keyup', () => {
    const inputs = el.querySelectorAll('input[type=number]');
    const font = inputs[0] as HTMLInputElement;
    font.value = '24';
    font.dispatchEvent(new KeyboardEvent('keyup'));
    expect(settingsService.setFont).toHaveBeenCalledWith('24');
  });

  it('changes the list spacing on keyup', () => {
    const inputs = el.querySelectorAll('input[type=number]');
    const spacing = inputs[1] as HTMLInputElement;
    spacing.value = '6';
    spacing.dispatchEvent(new KeyboardEvent('keyup'));
    expect(settingsService.setSpacing).toHaveBeenCalledWith('6');
  });
});
