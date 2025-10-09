import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let settingsServiceSpy: jasmine.SpyObj<SettingsService>;

  beforeEach(async () => {
    const settingsSpy = jasmine.createSpyObj('SettingsService', 
      ['toggleSettings', 'toggleOpenLinksInNewTab', 'setTheme']
    );
    settingsSpy.settings = {
      showSettings: true,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0'
    };

    await TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      imports: [FormsModule],
      providers: [
        { provide: SettingsService, useValue: settingsSpy }
      ]
    }).compileComponents();

    settingsServiceSpy = TestBed.inject(SettingsService) as jasmine.SpyObj<SettingsService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have settings property', () => {
    expect(component.settings).toBeDefined();
  });

  it('should call closeSettings method', () => {
    component.closeSettings();
    expect(settingsServiceSpy.toggleSettings).toHaveBeenCalled();
  });

  it('should call selectTheme when theme is changed', () => {
    component.selectTheme('night');
    expect(settingsServiceSpy.setTheme).toHaveBeenCalledWith('night');
  });

  it('should call toggleOpenLinksInNewTab when checkbox is toggled', () => {
    component.toggleOpenLinksInNewTab();
    expect(settingsServiceSpy.toggleOpenLinksInNewTab).toHaveBeenCalled();
  });
});
