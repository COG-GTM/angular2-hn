import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let mockSettingsService: jasmine.SpyObj<SettingsService>;

  beforeEach(() => {
    mockSettingsService = jasmine.createSpyObj('SettingsService', [
      'toggleSettings',
      'toggleOpenLinksInNewTab',
      'setTheme',
      'setFont',
      'setSpacing'
    ], {
      settings: {
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0'
      }
    });

    TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      providers: [
        { provide: SettingsService, useValue: mockSettingsService }
      ]
    });

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get settings from SettingsService', () => {
    expect(component.settings).toBe(mockSettingsService.settings);
  });

  it('should call toggleSettings on service when closeSettings is called', () => {
    component.closeSettings();
    expect(mockSettingsService.toggleSettings).toHaveBeenCalled();
  });

  it('should call toggleOpenLinksInNewTab on service', () => {
    component.toggleOpenLinksInNewTab();
    expect(mockSettingsService.toggleOpenLinksInNewTab).toHaveBeenCalled();
  });

  it('should call setTheme on service with correct theme', () => {
    component.selectTheme('night');
    expect(mockSettingsService.setTheme).toHaveBeenCalledWith('night');
  });

  it('should call setFont on service with correct font size', () => {
    component.changeTitleFont('18');
    expect(mockSettingsService.setFont).toHaveBeenCalledWith('18');
  });

  it('should call setSpacing on service with correct spacing', () => {
    component.changeSpacing('10');
    expect(mockSettingsService.setSpacing).toHaveBeenCalledWith('10');
  });
});
