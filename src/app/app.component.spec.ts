import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    (window as unknown as Record<string, unknown>)['ga'] = jasmine.createSpy('ga');
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [provideRouter([]), SettingsService],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should initialize settings from SettingsService', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.settings).toBe(TestBed.inject(SettingsService).settings);
  });
});
