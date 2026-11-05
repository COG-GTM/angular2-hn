import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';

describe('AppComponent', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [AppComponent], providers: [provideRouter([])] });
  });

  it('applies the selected theme class', () => {
    const fixture = TestBed.createComponent(AppComponent);
    TestBed.inject(SettingsService).setTheme('night');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('div').className).toBe('night');
    expect(fixture.nativeElement.querySelector('app-header')).toBeTruthy();
  });
});
