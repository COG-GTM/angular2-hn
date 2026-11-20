import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(() => {
    (window as unknown as { ga: unknown }).ga = jasmine.createSpy('ga');
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it('renders the shell with the current theme class', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.componentInstance.settings.theme = 'night';
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('div.night')).toBeTruthy();
    expect(root.querySelector('app-header')).toBeTruthy();
    expect(root.querySelector('router-outlet')).toBeTruthy();
  });
});
