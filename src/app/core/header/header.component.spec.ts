import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Router } from '@angular/router';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let settingsServiceSpy: jasmine.SpyObj<SettingsService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const settingsSpy = jasmine.createSpyObj('SettingsService', ['toggleSettings']);
    settingsSpy.settings = { showSettings: false };
    const routeSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      providers: [
        { provide: SettingsService, useValue: settingsSpy },
        { provide: Router, useValue: routeSpy }
      ]
    }).compileComponents();

    settingsServiceSpy = TestBed.inject(SettingsService) as jasmine.SpyObj<SettingsService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have settings property', () => {
    expect(component.settings).toBeDefined();
  });

  it('should call toggleSettings method', () => {
    component.toggleSettings();
    expect(settingsServiceSpy.toggleSettings).toHaveBeenCalled();
  });
});
