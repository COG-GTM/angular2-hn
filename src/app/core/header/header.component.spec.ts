import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockSettingsService: jasmine.SpyObj<SettingsService>;

  beforeEach(() => {
    mockSettingsService = jasmine.createSpyObj('SettingsService', ['toggleSettings'], {
      settings: {
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0'
      }
    });

    TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      providers: [
        { provide: SettingsService, useValue: mockSettingsService }
      ]
    });

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have settings from SettingsService', () => {
    expect(component.settings).toBe(mockSettingsService.settings);
  });

  it('should call toggleSettings on SettingsService when toggleSettings is called', () => {
    component.toggleSettings();
    expect(mockSettingsService.toggleSettings).toHaveBeenCalled();
  });

  it('should initialize on ngOnInit', () => {
    expect(() => component.ngOnInit()).not.toThrow();
  });

  it('should update settings when SettingsService changes', () => {
    mockSettingsService.settings.theme = 'night';
    expect(component.settings.theme).toBe('night');
  });

  it('should have showSettings property from settings', () => {
    expect(component.settings.showSettings).toBe(false);
    
    mockSettingsService.settings.showSettings = true;
    expect(component.settings.showSettings).toBe(true);
  });
});
