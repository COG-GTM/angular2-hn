import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let settingsService: jasmine.SpyObj<SettingsService>;
  let mockSettings: Settings;

  beforeEach(async () => {
    mockSettings = {
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0'
    };

    settingsService = jasmine.createSpyObj('SettingsService', [
      'toggleSettings',
      'toggleOpenLinksInNewTab',
      'setTheme',
      'setFont',
      'setSpacing'
    ]);
    settingsService.settings = mockSettings;

    await TestBed.configureTestingModule({
      declarations: [ SettingsComponent ],
      providers: [
        { provide: SettingsService, useValue: settingsService }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize settings from service', () => {
    expect(component.settings).toEqual(mockSettings);
  });

  it('should call ngOnInit without errors', () => {
    expect(() => component.ngOnInit()).not.toThrow();
  });

  it('should call settingsService.toggleSettings when closeSettings is called', () => {
    component.closeSettings();
    expect(settingsService.toggleSettings).toHaveBeenCalled();
  });

  it('should call settingsService.toggleOpenLinksInNewTab when toggleOpenLinksInNewTab is called', () => {
    component.toggleOpenLinksInNewTab();
    expect(settingsService.toggleOpenLinksInNewTab).toHaveBeenCalled();
  });

  it('should call settingsService.setTheme when selectTheme is called', () => {
    const theme = 'night';
    component.selectTheme(theme);
    expect(settingsService.setTheme).toHaveBeenCalledWith(theme);
  });

  it('should call settingsService.setFont when changeTitleFont is called', () => {
    const fontSize = '18';
    component.changeTitleFont(fontSize);
    expect(settingsService.setFont).toHaveBeenCalledWith(fontSize);
  });

  it('should call settingsService.setSpacing when changeSpacing is called', () => {
    const spacing = '5';
    component.changeSpacing(spacing);
    expect(settingsService.setSpacing).toHaveBeenCalledWith(spacing);
  });
});
